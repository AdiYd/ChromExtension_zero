import { postManager } from './postManager';
import { io } from 'socket.io-client';
import { updateBanner, APP_CONFIG, sleep, logProcess } from './utils';
import { authManager } from './authManager';

const serverIP = 'https://panel.taskomatic.net';

export class WSClient {
  constructor(url) {
    this.url = url || serverIP.replace('http', 'ws');
    this.socket = null;
    this.credentials = null;
  }

  connect(credentials = null) { 
    logProcess('WEBSOCKET', 'Connecting to server', this.url);
    
    // If credentials not provided, try to get them from authManager
    const authCredentials = credentials || authManager.credentials;
    
    if (!authCredentials) {
        logProcess('ERROR', 'No authentication credentials available for WebSocket connection');
        return false;
    }
    
    // Store for future reference
    this.credentials = authCredentials;
    
    // Use Socket.IO client instead of native WebSocket
    this.socket = io(this.url, {withCredentials: true});
    
    // Connection event
    this.socket.on('connect', () => {
        logProcess('WEBSOCKET', 'Socket.IO connected');
        
        // Emit the event using Socket.IO format with stored credentials
        this.socket.emit('connect_frontend', {...this.credentials});
        logProcess('WEBSOCKET', 'Sent frontend connection credentials to server');
    });
    
    // Message event - when server notifies about new post
    this.socket.on('post_updated', async (data) => {
      logProcess('WEBSOCKET', 'Received post update notification from server', data);
      
      try {
        // Safety check - if already processing, don't interrupt
        if (postManager.state.isProcessing) {
          logProcess('WEBSOCKET', 'Currently processing a post, ignoring new post');
          return;
        }
        
        // Check if we received a post object directly
        const postData = data.post || data;
        if (!postData || !postData.id) {
          logProcess('ERROR', 'Invalid post data received from server', postData);
          return;
        }
        
        // Reset state for new post
        logProcess('WEBSOCKET', 'Clearing state before processing new post');
        await postManager.clearState();
        await sleep(APP_CONFIG.PROCESS_DELAY);
        
        // Update state with the received post
        logProcess('WEBSOCKET', `Received post ${postData.id} for execution`, postData);
        postManager.state.posts = [postData];
        postManager.state.currentPost = postData.id;
        postManager.saveState();
        
        await updateBanner();
        await sleep(2); // 10 second delay before executing post
        
        // Execute the post
        logProcess('WEBSOCKET', 'Starting post execution');
        await postManager.executeCurrentPost();
        
      } catch(err) {
        logProcess('ERROR', `Error handling post update: ${err.message}`);
        // Ensure we're not stuck in processing state in case of error
        if (postManager.state.isProcessing) {
          postManager.state.isProcessing = false;
          postManager.saveState();
        }
      }
    });

    // Message event - when server want to show text in the banner
    this.socket.on('UI_text', async (text) => {
      logProcess('WEBSOCKET', 'Received banner message from server', text);
      
      // Update the banner with the received message
      await updateBanner(undefined, text);
      await sleep(2); // 10 second delay before executing post
    });
    
    // Error handling
    this.socket.on('error', (error) => {
      logProcess('ERROR', `Socket error: ${error.message || error}`);
    });
    
    // Disconnect event
    this.socket.on('disconnect', () => {
      logProcess('WEBSOCKET', 'Socket.IO disconnected');
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (this.socket?.disconnected) {
          logProcess('WEBSOCKET', 'Attempting to reconnect...');
          this.socket.connect();
        }
      }, 5000);
    });
  }

  // Method to report group completion
  async sendGroupFulfillment(postId, groupId) {
    if (!this.socket || !this.socket.connected) {
      logProcess('ERROR', 'Cannot send fulfillment: WebSocket not connected');
      return false;
    }
    
    postManager.state.isProcessing = false;
    await postManager.saveState();
    logProcess('WEBSOCKET', `Sending set_full_field for post=${postId}, group=${groupId}`);
    this.socket.emit('set_full_field', {
      postId,
      groupId,
      ...authManager.credentials
    });
    
    return true;
  }

  // Disconnect method 
  disconnect() {
    logProcess('WEBSOCKET', 'Disconnecting WebSocket');
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      logProcess('WEBSOCKET', 'WebSocket disconnected');
    }
  }
}

// Export singleton instance
export const wsClient = new WSClient();