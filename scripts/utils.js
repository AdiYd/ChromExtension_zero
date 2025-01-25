
import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { authManager } from './authManager';
import { postManager } from './postManager';

export const production = process.env.NODE_ENV === 'production';
export const serverIP = production ? 'https://panel.taskomatic.net' : 'http://localhost:5000' ;

export const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
  
export const app = initializeApp(config);
export const db = getFirestore(app);

export const getAuth = async () => {
    const docRef = doc(db, 'mask', 'postomatic');
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  };
  
export const setAuth = async (username, password='') => {
    if (!db) return false;
    const userRef = doc(db, 'postomatic', username);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists()) {
      const currentEntries = userSnap.data().entries || 0;
      await setDoc(userRef, { entries: currentEntries + 1 });
      return true;
    } else {
      await setDoc(userRef, { entries: 1, password });
      return true;
    }
  };

export const getManagerApprove = async () => {
    const docRef = doc(db, 'mask', 'postomatic');
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      return docSnap.data()?.verify === 80;
    } else {
      return null;
    }
  };
  
export const createBanner = async ()=>{
    const state = postManager.state;
    const notificationBanner = document.createElement('div');
    const bannerStyle = {
      position: 'fixed',
      bottom: '50px',
      right: '10px',
      padding: '20px 50px',
      minWidth: '25vw',
      backgroundColor: '#1abc9c',
      borderRadius: '5px',
      zIndex: '1001',
      display: 'flex',
      backgroundImage: 'linear-gradient(45deg, #2c3e50, #4ca1af)',
      color: 'white',
      border: '1px solid gray',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
      borderRadius: '12px',
      width: 'fit-content',
      alignItems: 'center',
    };
  
    Object.assign(notificationBanner.style, bannerStyle);
  
    const absoluteCloseButton = document.createElement('span');
    const absoluteCloseButtonStyles = {
      position: 'absolute',
      color: 'white',
      padding: '4px',
      top: '2px',
      right: '2px',
      cursor: 'pointer',
      fontSize: '18px',
      zIndex: '1002',
    };
    absoluteCloseButton.textContent = '⊗';
    Object.assign(absoluteCloseButton.style, absoluteCloseButtonStyles);
    absoluteCloseButton.onmouseover = () => {
      absoluteCloseButton.style.opacity = '0.5';
    };
    absoluteCloseButton.onmouseout = () => {
      absoluteCloseButton.style.opacity = '1';
    };
    absoluteCloseButton.onclick = async () => {
      document.body.removeChild(notificationBanner);
      postManager.clearState();
      authManager.clearCredentials();
      const logStyle = 'font-weight: bold; font-size: 16px; padding: 8px 15px; background-image: linear-gradient(45deg, #ff4500, #ff8c00); border-radius: 25px; color: black ; text-shadow: 2px 2px 4px rgba(45, 21, 47, 0.3)';
      console.log('%c +++ Script execution finished! 🚀 +++ ', logStyle);  
      await sleep(8);
      return true;
    };
  
    notificationBanner.appendChild(absoluteCloseButton);
    const bannerLogo = document.createElement('img');
    bannerLogo.src = chrome.runtime.getURL('icons/icon.png');
    bannerLogo.style.width = '30px';
    bannerLogo.style.height = '30px';
    // bannerLogo.style.animation = 'spin 3s linear infinite';
    // const styleSheet = document.createElement('style');
    // styleSheet.type = 'text/css';
    // styleSheet.innerText = `
    //   @keyframes spin {
    //     0% { transform: rotate(0deg); }
    //     100% { transform: rotate(360deg); }
    //   }
    // `;
    // document.head.appendChild(styleSheet);
    bannerLogo.style.marginRight = '10px';
  
    const bannerText = document.createElement('span');
    bannerText.textContent = 'Postomatics running...';
  
    notificationBanner.appendChild(bannerLogo);
    // notificationBanner.appendChild(bannerText);
    const stateInfo = document.createElement('div');
    const stateInfoStyle = {
        marginLeft: '20px',
        fontSize: '14px',
        color: 'white',
    };
    Object.assign(stateInfo.style, stateInfoStyle);
    const nextPost = getPostById(state.currentPost);
    const lastPost = getPostById(state.lastSuccessfulPost);
    const nextPostText = nextPost ? nextPost?.post?.substring(0, 30) + '...' : null;
    const lastPostText = lastPost ? lastPost?.post?.substring(0, 30) + '...' : null;
    const nextTime = nextPost ? postManager.state.isProcessing ? 'Now' :  new Date(nextPost.start).toLocaleTimeString() : 'Not scheduled';
    const errors = state.errors?.slice(-2) || [];

    stateInfo.innerHTML = `
        ${nextPostText ? `<div><b>Next post:</b> ${nextPostText}</div>` : ''}
        ${nextTime ? `<div><b>Scheduled:</b> ${nextTime}</div>` : ''}
        ${lastPostText ? `<div><b>Last post:</b> ${lastPostText}</div>` : ''}
        ${errors.map(e => `<div style="color: #ff6b6b">Error: ${e.message}</div>`).slice(0,3)?.join('')}
    `;

    if (nextPost){
        notificationBanner.appendChild(stateInfo);
    } else {
        notificationBanner.appendChild(bannerText);
    }
    document.body.appendChild(notificationBanner);
  };

export const sleep = (s=1) => new Promise((resolve) => setTimeout(resolve, s*1e3));

export const getPostById = (postId) => {
    return postManager.state.posts.find(post => post.id === postId);
  };

export const waitForElement = async (selector, timeout = 10*1e3) => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await sleep(1);
    }
    return null;
  };

// Add state validation
export const validateState = (state) => {
    const required = [
      'currentPost',
      'postIndex',
      'groupIndex',
      'fulfilled',
      'lastUpdate'
    ];
    
    const isValid = required.every(key => key in state);
    console.log('State validation:', isValid);
    return isValid;
  };
  
export const parsePostTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      console.log('Parsed time:', date);
      return date;
    } catch (error) {
      console.error('Time parsing error:', error);
      return null;
    }
  };

export const setFulfilled = async (postId, groupId) => {
    try {
        const credentials = authManager.credentials || {};
        const response = await fetch(`${serverIP}/setfullfield`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId, groupId, ...credentials })
        });
        if (!response.ok) {
            const data = await response.json();
            console.log('Fulfill response:', data);
            return false;
        }
       
        return true;
    } catch (error) {
        console.error('Error setting fulfill:', error);
        return false;
    }
}

export async function simulateTyping(inputEl, text) {
    for (const char of text) {
      // keydown
      const keyDownEvent = new KeyboardEvent('keydown', {
        key: char,
        bubbles: true,
        cancelable: true
      });
      inputEl.dispatchEvent(keyDownEvent);
  
      // בפועל מוסיפים את התו ל-textContent (או innerText)
      inputEl.textContent += char;
  
      // input
      const inputEvent = new InputEvent('input', {
        data: char,
        bubbles: true,
        cancelable: true,
      });
      inputEl.dispatchEvent(inputEvent);
  
      await sleep(0.03); // המתנה קצרה לדימוי הקלדה אנושית
    }
  }
  