import { authManager } from "./authManager";
import { postToFacebook } from "./content";
import { config, getPostById, serverIP, sleep } from "./utils";

// State management
const STATE_KEY = 'FB_AUTO_POST_STATE';
const POST_TIMEOUT = 20 * 60 * 1000; // 20 minutes
const UPDATE_INTERVAL = 3 * 60 * 1000; // 3 minutes
const flag = {
    main: Boolean(process.env.FIREBASE_APP_ID)
  }

export class PostManager {
    static instance = null;
    
    constructor() {
        if (PostManager.instance) {
            return PostManager.instance;
        }
        if (!flag.main) return;
        PostManager.instance = this;

        this.updateTimer = null;
        this.state = this.loadState() || this.getInitialState();
        this.startUpdateInterval();
    }

    startUpdateInterval() {
        // Clear existing timer if any
        const interval = authManager.authProvider?.updateInterval * 60 * 1000 || UPDATE_INTERVAL;
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // Start new update interval
        this.updateTimer = setInterval(async () => {
            try {
                await this.fetchPosts(true); // Force server update
                console.log('Posts updated from server');
            } catch (error) {
                console.error('Failed to update posts:', error);
            }
        }, interval);
    }

    async initialize() {
        if (this.state.isProcessing) {
            console.log('Resuming existing queue...');
            return this.resumeQueue();
        }
        
        try {
            const posts = await this.fetchPosts();
            console.log('Fetched posts:', posts);
            if (!posts?.length) {
                console.log('%c *** No posts found *** ', 'background: linear-gradient(to right, #90EE90, #228B22); color: black; padding: 2px 5px; border-radius: 8px; font-weight: bold; font-size: 18px; ');
                return false;
            }

            this.state.posts = this.sortPosts(posts);
            this.state.pendingPosts = [...this.state.posts.filter(post => post.start >= new Date())];
            this.state.isProcessing = true;
            this.saveState();

            return this.scheduleNextPost();
        } catch (error) {
            console.error('Initialization failed:', error);
            return false;
        }
    }


    getInitialState() {
        return {
            // Queue Management
            posts: [],              // All fetched posts
            pendingPosts: [],       // Posts waiting to be executed
            
            // Current Execution
            currentPost: null,      // Active post being processed
            groupIndex: 0,          // Current group index in post.groups
            fulfilled: [],          // Completed group IDs for current post
            
            // Timing & Status
            lastPostTime: null,     // Timestamp of last successful post
            isProcessing: false,    // Queue processing status
            
            // Error Handling
            errors: [],             // Track any failures
            retryCount: 0           // Number of retries for current post
        };
    }
  
    loadState() {
        const saved = sessionStorage.getItem(STATE_KEY);
        return saved ? JSON.parse(saved) : this.getInitialState();
    }
  

    saveState() {
      sessionStorage.setItem(STATE_KEY, JSON.stringify(this.state));
    }

    clearState() {
        if (this.updateTimer){
            clearInterval(this.updateTimer);
        }
        sessionStorage.removeItem(STATE_KEY);
    }
  
    async fetchPosts(serverUpdate = false) {
        const credentials = authManager.credentials;
        if (!credentials) {
            throw new Error('No credentials found, cannot fetch posts');
        }
        if (!authManager.isLoggedIn() || authManager.authProvider?.value >= 100) {
            throw new Error('Invalid auth provider');
        }
      // Only fetch if needed
      if (this.state?.lastUpdate && !serverUpdate && this.state?.posts?.length && (Date.now() - new Date(this.state?.lastUpdate) )< (authManager.authProvider?.updateInterval*60*1000 || UPDATE_INTERVAL)) {
        console.log('Using cached posts...');
        return this.state.posts;
      }
      console.log('Fetching posts from server...');
      const serverPosts = await fetch(`${serverIP}/getpost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!serverPosts.ok) throw new Error('Failed to fetch posts');
  
      const posts = await serverPosts.json();
      if (posts?.length > 0) {
        this.state.posts = this.sortPosts(posts);
        this.state.lastUpdate = new Date().toISOString();
        await sleep(5)
        this.saveState();
      }
  
      return this.state.posts;
    }
  
    sortPosts(posts) {
        return posts.sort((a, b) => {
        const timeA = new Date(a.start);
        const timeB = new Date(b.start);
        return timeA - timeB;
        });
    }

    async resumeQueue() {
        const currentPost = getPostById(this.state.currentPost);
        if (!currentPost) {
            return this.scheduleNextPost();
        }
        return this.executePost(currentPost);
    }

    async scheduleNextPost() {
        if (!this.state?.pendingPosts?.length) {
            console.log('Queue completed');
            this.clearState();
            return true;
        }

        const nextPost = this.state?.pendingPosts[0];
        const scheduledTime = new Date(nextPost.start);
        await sleep(5);
        const now = new Date();
        
        // Calculate delay with minimum timeout
        const timeout = authManager.authProvider?.postTimeout * 60 * 1000 || POST_TIMEOUT;
        const timeSinceLastPost = this.state?.lastPostTime ? (now - new Date(this.state.lastPostTime)) : Infinity;
        const minDelay = Math.max(0, timeout - timeSinceLastPost);
        const scheduleDelay = Math.max(0, scheduledTime - now);
        const delay = Math.max(scheduleDelay, minDelay);

        console.log(`Scheduling next post ${nextPost.id} in ${delay/1000}s`);
        await sleep(5);
        setTimeout(async () => {
            this.state.currentPost = nextPost;
            this.state.fulfilled = nextPost?.fulfilled || [];
            this.saveState();
            await this.executePost(nextPost);
        }, delay);

        return true;
    }

    async executePost(post) {
        try {
            const result = await postToFacebook(post);
            
            if (result) {
                this.state.lastPostTime = new Date().toISOString();
                this.state.pendingPosts.shift();
                this.state.currentPost = null;
                this.saveState();
                
                return this.scheduleNextPost();
            }
            
            return false;
        } catch (error) {
            console.log('%cPost execution failed:', 'color: red', error);
            return false;
        }
    }

}

export const postManager = new PostManager();