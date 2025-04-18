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
      this.socket.emit('connect_frontend', {...authManager.credentials});
    });
    
    // Message event - when server notifies about new post
    this.socket.on('post_updated', async (data) => {
      console.log('Received post update notification from server:', data);
      try {
        // Clear current state if we're not in the middle of posting
        if (!postManager.state.isProcessing) {
          await postManager.clearState();
        } else {
          console.log('Currently processing a post, will fetch next post after completion');
          return;
        }
        
        // Fetch the latest post from the server
        const posts = await postManager.fetchPosts(true);
        
        if (!posts?.length) {
          console.log('No posts available from server');
          await updateBanner();
          return;
        }
        
        // Update state and start execution
        postManager.state.posts = [...posts];
        postManager.state.currentPost = posts[0]?.id || null;
        postManager.saveState();
        
        await updateBanner();
        
        // If not currently processing, start execution
        if (!postManager.state.isProcessing) {
          await postManager.executeCurrentPost();
        }
      } catch(err) {
        console.error('Error handling post update:', err);
      }
    });
    
    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Disconnect event
    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (this.socket.disconnected) {
          console.log('Attempting to reconnect...');
          this.socket.connect();
        }
      }, 5000);
    });
  }
}