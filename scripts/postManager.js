import { authManager } from "./authManager";
import { postToFacebook } from "./content";
import { getPostById, sleep, updateBanner } from "./utils";
import { wsClient } from "./wsClient";

const APP_CONFIG = {
    PROCESS_DELAY: 2, // Default delay in seconds for process operations
    DEBUG_MODE: false  // Enable detailed logging
  };

const logProcess = (area, message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
    const areaStyle = 'background:rgb(66, 44, 80); color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;';
    
    // console.log(
    //   `%c[${area}]%c [${timestamp}] ${message}`, 
    //   areaStyle, 
    //   'color:rgb(110, 165, 197); font-weight: bold;'
    // );
    
    if (data && APP_CONFIG.DEBUG_MODE) {
    //   console.log('→ Details:', data);
    }
  };
  

// State management
const STATE_KEY = 'FB_AUTO_POST_STATE';
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
        logProcess('INIT', 'Initializing PostManager');
        
        // Check authentication before connecting to WebSocket
        if (!authManager.isLoggedIn()) {
            logProcess('INIT', 'User not logged in, cannot initialize');
            return false;
        }
        
        // Store WebSocket client globally for cleanup
        window.wsClient = wsClient;
        
        // Connect with authentication credentials
        wsClient.connect(authManager.credentials);
        
        // Check if we were previously processing a post (after redirect/reload)
        if (this.state.isProcessing) {
            logProcess('INIT', 'Detected unfinished post execution, resuming', { currentPost: this.state.currentPost });
            await sleep(APP_CONFIG.PROCESS_DELAY);
            return await this.resumeQueue();
        }
        
        // If we have a post already in state, execute it
        if (this.state.posts.length > 0 && this.state.currentPost) {
            logProcess('INIT', `Found post to execute: ${this.state.currentPost}`, this.state.posts[0]);
            await sleep(APP_CONFIG.PROCESS_DELAY);
            return await this.executeCurrentPost();
        }
        
        // Otherwise, wait for WebSocket notifications
        logProcess('INIT', 'No posts available, waiting for WebSocket notifications');
        await updateBanner();
        return true;
    }

    getInitialState() {
        return {
            // Post Management
            posts: [],              // Current post (in an array for API compatibility)
            
            // Current Execution
            currentPost: null,      // Active post being processed
            groupIndex: 0,          // Current group index in post.groups
            fulfilled: [],          // Completed group IDs for current post
            
            // Timing & Status
            lastPostTime: null,     // Timestamp of last successful post
            isProcessing: false,    // Flag indicating if a post is being processed
            lastSuccessfulPost: null, // ID of last successful post
            
            // Error Handling
            errors: [],             // Track any failures
            retryCount: 0           // Number of retries for current post
        };
    }
  
    loadState() {
        logProcess('STATE', 'Loading state from storage');
        const saved = sessionStorage.getItem(STATE_KEY);
        const loadedState = saved ? JSON.parse(saved) : this.getInitialState();
        logProcess('STATE', 'State loaded', loadedState);
        return loadedState;
    }
  
    saveState() {
        logProcess('STATE', 'Saving state to storage', this.state);
        sessionStorage.setItem(STATE_KEY, JSON.stringify(this.state));
    }

    async clearState() {
        logProcess('STATE', 'Clearing state');
        sessionStorage.removeItem(STATE_KEY);
        this.state = this.getInitialState();
    }

    async resumeQueue() {
        logProcess('EXEC', 'Resuming post execution');
        
        const currentPost = getPostById(this.state.currentPost);
        if (!currentPost) {
            logProcess('EXEC', 'No current post found in state, waiting for WebSocket notification');
            this.clearState();
            await updateBanner();
            return true;
        }
        
        logProcess('EXEC', `Resuming execution of post ${currentPost.id}`, currentPost);
        await sleep(APP_CONFIG.PROCESS_DELAY);
        return await this.executePost(currentPost);
    }

    async executeCurrentPost() {
        if (!this.state.posts.length) {
            logProcess('EXEC', 'No posts to execute, waiting for WebSocket notification');
            await this.clearState();
            await updateBanner();
            return true;
        }
        
        const nextPost = this.state.posts[0];
        logProcess('EXEC', `Starting post execution: "${nextPost.post?.slice(0,20) + '...'}"`);
        await updateBanner();
        await sleep(APP_CONFIG.PROCESS_DELAY);
        
        // Mark as processing to handle page reloads/redirects
        this.state.isProcessing = true;
        this.state.fulfilled = [];
        this.saveState();
        
        // Add small delay before execution
        await sleep(0.3);
        return await this.executePost(nextPost);
    }

    async executePost(post) {
        try {
            logProcess('EXEC', `Executing post ${post.id} with ${post.groups?.length || 0} groups`);
            
            const result = await postToFacebook(post);
            await sleep(APP_CONFIG.PROCESS_DELAY);
            
            if (result) {
                logProcess('EXEC', `Post ${post.id} executed successfully`);
                this.state.lastPostTime = new Date().toISOString();
                this.state.lastSuccessfulPost = post.id;
                this.state.currentPost = null;
                this.state.isProcessing = false;
                this.state.groupIndex = 0;
                this.state.posts = [];
                this.saveState();
                
                // Wait for next WebSocket notification
                logProcess('EXEC', 'Entering waiting state for next post notification');
                await updateBanner();
                return true;
            } else {
                logProcess('ERROR', `Post execution returned failure for post ${post.id}`);
                this.state.isProcessing = false;
                this.saveState();
                return false;
            }
        } catch (error) {
            logProcess('ERROR', `Post execution failed: ${error.message}`);
            // Clear processing state to prevent loops
            this.state.isProcessing = false;
            this.saveState();
            return false;
        }
    }

    // Helper to report group fulfillment via WebSocket
    async reportGroupFulfilled(postId, groupId) {
        return await wsClient.sendGroupFulfillment(postId, groupId);
    }

    // Cleanup method
    cleanup() {
        logProcess('CLEANUP', 'Performing full cleanup of PostManager');
        this.clearState();
        this.state = this.getInitialState();
        logProcess('CLEANUP', 'PostManager cleanup completed');
    }
}

export const postManager = new PostManager();