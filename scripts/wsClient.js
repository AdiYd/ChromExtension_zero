import { postManager } from './postManager';
import { io } from 'socket.io-client';
import { serverIP, updateBanner } from './utils';
import { authManager } from './authManager';

export class WSClient {
  constructor(url) {
    this.url = url || serverIP.replace('http', 'ws');
    this.socket = null;
  }

  connect() { 
    
    // Use Socket.IO client instead of native WebSocket
    this.socket = io(this.url, {withCredentials: true});
    
    // Connection event
    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
      // Emit the event using Socket.IO format
      this.socket.emit('connect_frontend',{...authManager.credentials});
    });
    
    // Message event
    this.socket.on('post_updated', async (data) => {
      postManager.clearState();
      try {
        console.log('Received post update:', data);
        const posts = await postManager.fetchPosts(true); // Force server update
        if (!posts?.length) {
            console.log('%c *** No posts found *** ', 'background: linear-gradient(to right, #90EE90, #228B22); color: black; padding: 2px 5px; border-radius: 8px; font-weight: bold; font-size: 18px; ');
            return false;
        }

        // Updating sorted posts by start time
        postManager.state.posts = postManager.sortPosts(posts);
        // Update pending posts
        postManager.state.pendingPosts = [...postManager.state.posts.filter(post => new Date(post.start) >= new Date())];
        postManager.state.lastPostTime = null;
        if (postManager.state.pendingPosts.length) {  
          postManager.state.currentPost = postManager.state.pendingPosts[0]?.id || null;
        }
        
        postManager.saveState();
        await updateBanner();
        
        return await postManager.scheduleNextPost();
      } catch(err) {
        console.error('Error updating posts:', err);
      }
    });
    
    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Disconnect event
    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });
  }
}