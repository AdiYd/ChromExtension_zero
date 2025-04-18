import { authManager } from "./authManager";
import { postToFacebook } from "./content";
import {  getPostById, serverIP, sleep, updateBanner } from "./utils";
import { WSClient } from "./wsClient";

// State management
const STATE_KEY = 'FB_AUTO_POST_STATE';
const POST_TIMEOUT = 20 * 60 * 1000; // 20 minutes
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

        this.state = this.loadState() || this.getInitialState();
    }


    async initialize() {
        const ws = new WSClient(serverIP.replace('http', 'ws'));
        ws.connect();
        if (this.state.isProcessing) {
            console.log('Resuming existing post execution...');
            return await this.resumeQueue();
        }
        
        try {
            const posts = await this.fetchPosts();
            console.log('Fetched posts:', posts);
            if (!posts?.length) {
                console.log('%c *** No posts found *** ', 'background: linear-gradient(to right, #90EE90, #228B22); color: black; padding: 2px 5px; border-radius: 8px; font-weight: bold; font-size: 18px; ');
                return false;
            }

            // Update state with the received post
            this.state.posts = [...posts];
            this.state.currentPost = this.state.posts[0]?.id || null;
            this.state.lastPostTime = null;
            
            this.saveState();
            console.log('Post initialized:', this.state);
            
            return await this.executeCurrentPost();
        } catch (error) {
            console.error('Initialization failed:', error);
            return false;
        }
    }


    getInitialState() {
        return {
            // Post Management
            posts: [],              // All fetched posts (typically will contain only one post)
            
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
        sessionStorage.removeItem(STATE_KEY);
        this.state = this.getInitialState();
    }
  
    async fetchPosts(forceUpdate = false) {
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
    
        try {
            console.log('Requesting next post from server...');
            const serverResponse = await fetch(`${serverIP}/next_post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            console.log('Server response status:', serverResponse.status);

            if (!serverResponse.ok) {
                console.log('No post available or server returned non-OK status');
                this.state.posts = [];
                this.saveState();
                await updateBanner();
                return [];
            }
    
            const posts = await serverResponse.json();
            if (posts?.length > 0) {
                this.state.posts = posts.map((post) => ({
                    ...post,
                    img: Boolean(post.img),
                }));
                this.saveState();
                await updateBanner();
            } else {
                this.state.posts = [];
                this.saveState();
                await updateBanner();
            }
            
            this.posts = posts;
            return this.state.posts;
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            delete this.posts;
            return [];
        }
    }

    async resumeQueue() {
        const currentPost = getPostById(this.state.currentPost);
        if (!currentPost) {
            console.log('No current post found, requesting next post');
            await this.fetchPosts(true);
            return this.executeCurrentPost();
        }
        return await this.executePost(currentPost);
    }

    async executeCurrentPost() {
        if (!this.state.posts.length) {
            console.log('No posts to execute');
            await this.clearState();
            await updateBanner();
            return true;
        }
        
        const nextPost = this.state.posts[0];
        
        console.log(`Starting post execution: "${nextPost.post?.slice(0,20) + '...'}"`);
        await updateBanner();
        
        setTimeout(async () => {
            this.state.isProcessing = true;
            this.state.fulfilled = [];
            this.saveState();
            await this.executePost(nextPost);
        }, 300);
        
        return true;
    }

    async executePost(post) {
        try {
            const result = await postToFacebook(post);
            
            if (result) {
                this.state.lastPostTime = new Date().toISOString();
                this.state.currentPost = null;
                this.state.isProcessing = false;
                this.saveState();
                
                // Request next post from server after completing this one
                await this.fetchPosts(true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.log('%cPost execution failed:', 'color: red', error);
            return false;
        }
    }
}

export const postManager = new PostManager();