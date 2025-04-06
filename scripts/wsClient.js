
import { postManager } from './postManager';
import { serverIP } from './utils';


export class WSClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
  }

  connect() {
    console.success('Connecting to WebSocket server...');   
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () => console.log('WebSocket connected');
    this.socket.onmessage = async (event) => {
      try {
        console.log('Received event:', event.data);
        // Parse event, check if it's a "new post" or "update" push
        await postManager.fetchPosts(true); // Force refresh
        // Rebuild or reschedule posts
        await postManager.initialize();
      } catch(err) {
        console.error('Error updating posts:', err);
      }
    };
    this.socket.onclose = () => console.log('WebSocket disconnected');
  }
}
// ... Then in your extension’s init code:
const ws = new WSClient(serverIP);
console.log('WebSocket URL:', serverIP);
ws.connect();