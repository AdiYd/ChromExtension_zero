import { authManager } from "./authManager";
import { postToFacebook } from "./content";
import {  getPostById, serverIP, sleep, updateBanner } from "./utils";
import { WSClient } from "./wsClient";

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
    }

    async startUpdateInterval() {
        // Clear existing timer if any
        const interval = authManager.authProvider?.updateInterval * 60 * 1000 || UPDATE_INTERVAL;
        if (this.updateTimer) {
            console.log('Clearing existing update interval...');
            clearInterval(this.updateTimer);
        }

        // Start new update interval
        console.log(`Starting update interval: ${interval / 1000} seconds`);
   
        this.updateTimer = setInterval(async () => {
            try {
                console.log('Refreshing posts...');
                const posts = await this.fetchPosts(true); // Force server update
                await updateBanner();
                if (!posts?.length) {
                    console.log('%c *** No posts found *** ', 'background: linear-gradient(to right, #90EE90, #228B22); color: black; padding: 2px 5px; border-radius: 8px; font-weight: bold; font-size: 18px; ');
                    return false;
                }
    
                // Updating sorted posts by start time
                this.state.posts = this.sortPosts(posts);
                // Update pending posts
                this.state.pendingPosts = [...this.state.posts.filter(post => new Date(post.start) >= new Date())];
                this.state.lastPostTime = null;
                if (this.state.pendingPosts.length) {  
                    this.state.currentPost = this.state.pendingPosts[0]?.id || null;
                }
                
                this.saveState();
                console.log('Queue Re-nitialized:', this.state);
    
            } catch (error) {
                console.error('Failed to update posts:', error);
            }
        }, interval); 
    }

    async initialize() {
        this.startUpdateInterval();
        const ws =  new WSClient(serverIP.replace('http', 'ws'));
        ws.connect();
        if (this.state.isProcessing) {
            console.log('Resuming existing queue...');
            return await this.resumeQueue();
        }
        
        try {
            const posts = await this.fetchPosts();
            console.log('Fetched posts:', posts);
            if (!posts?.length) {
                console.log('%c *** No posts found *** ', 'background: linear-gradient(to right, #90EE90, #228B22); color: black; padding: 2px 5px; border-radius: 8px; font-weight: bold; font-size: 18px; ');
                return false;
            }

            // Updating sorted posts by start time
            this.state.posts = this.sortPosts(posts);
            // Update pending posts
            this.state.pendingPosts = [...this.state.posts.filter(post => new Date(post.start) >= new Date())];
            this.state.lastPostTime = null;
            if (this.state.pendingPosts.length) {  
                this.state.currentPost = this.state.pendingPosts[0]?.id || null;
            }
            
            this.saveState();
            console.log('Queue initialized:', this.state);

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

    async clearState() {
        if (this.updateTimer){
            // clearInterval(this.updateTimer);
        }
        if (this.state.intervalId){
            clearInterval(this.state.intervalId);
        }
        sessionStorage.removeItem(STATE_KEY);
        this.state = this.getInitialState();
    }
  
    async fetchPosts(serverUpdate = false) {
        const credentials = authManager.credentials;
        if (!credentials) {
            console.error('No credentials found, cannot fetch posts');
            delete this.posts;
            return [];
        }
        if (!authManager.isLoggedIn() || authManager.authProvider?.value >= 100) {
            console.error('Invalid auth provider');
            delete this.posts;
            return [];
        }
      // Only fetch if needed
      if (this.state?.lastUpdate && !serverUpdate && this.state?.posts?.length && (Date.now() - new Date(this.state?.lastUpdate) )< (authManager.authProvider?.updateInterval*60*1000 || UPDATE_INTERVAL)) {
        console.log('Using cached posts...');
        return this.state.posts;
      }
      try{
        console.log('Updating posts from server...');
        const serverPosts = await fetch(`${serverIP}/getpost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!serverPosts.ok) throw new Error('Failed to fetch posts');
    
        const posts = await serverPosts.json();
        if (posts?.length > 0) {
            this.state.posts = this.sortPosts(posts.map((post) => ({
                ...post,
                img: Boolean(post.img),
            })));
            this.state.lastUpdate = new Date().toISOString();
            this.state.pendingPosts = [...this.state.posts.filter(post => new Date(post.start) >= new Date())];
            await sleep(2);
            this.saveState();
            await updateBanner();
        }
        this.posts = this.sortPosts(posts);
        return this.state.posts;
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            delete this.posts;
            return [];
        }
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
        return await this.executePost(currentPost);
    }

    async scheduleNextPost() {
        if (!this.state?.pendingPosts?.length) {
            console.log('Completed posts!');
            await this.clearState();
            await updateBanner();
            return true;
        }
        if (!this.state?.pendingPosts?.length) {
            window.location.reload();
            return false;
        }
        const nextPost = this.state?.pendingPosts[0];
        
        const scheduledTime = new Date(nextPost.start);
        await sleep(2);
        const now = new Date();
        
        // Calculate delay with minimum timeout
        const timeout = authManager.authProvider?.postTimeout * 60 * 1000 || POST_TIMEOUT;
        const timeSinceLastPost = this.state?.lastPostTime ? (now - new Date(this.state.lastPostTime)) : Infinity;
        const minDelay = Math.max(0, timeout - timeSinceLastPost);
        const scheduleDelay = Math.max(0, scheduledTime - now);
        // console.log(`Scheduled time: ${scheduledTime}, Now: ${now}, Delay: ${scheduleDelay}`);
        // console.log(`Time since last post: ${timeSinceLastPost}, Min delay: ${minDelay}`);
        const delay = Math.max(scheduleDelay, minDelay);

        console.log(`Scheduling next post:  "${nextPost.post?.slice(0,20) + '...'}" \n in ${delay/1*1e3}[s]`);
        await updateBanner();
        // await sleep(2);
        setTimeout(async () => {
            this.state.isProcessing = true;
            this.state.fulfilled = ((nextPost?.amount && nextPost?.amount === 1 )||(!nextPost.amount)) ? (nextPost?.fulfilled || []) : [];
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
                
                return await this.scheduleNextPost();
            }
            
            return false;
        } catch (error) {
            console.log('%cPost execution failed:', 'color: red', error);
            return false;
        }
    }

}

export const postManager = new PostManager();