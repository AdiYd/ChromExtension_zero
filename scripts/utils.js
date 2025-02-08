
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
      justifyContent: 'space-between',
      backgroundImage: 'linear-gradient(135deg, #2c3e50, #4ca1af)',
      color: 'white',
      border: '1px solid gray',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
      borderRadius: '12px',
      width: 'fill-available',
      alignItems: 'center',
      direction: 'rtl',
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
    bannerLogo.style.margin = 'auto 10px';
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
    // bannerLogo.style.marginLeft = '10px';
  
    const bannerText = document.createElement('span');
    bannerText.textContent = 'מחכה לפוסטים מתוזמנים...';
  
    notificationBanner.appendChild(bannerLogo);
    // notificationBanner.appendChild(bannerText);
    const stateInfo = document.createElement('div');
    const stateInfoStyle = {
        marginRight: '10px',
        marginLeft: '10px',
        direction: 'rtl',
        textAligh: 'start',
        fontSize: '15px',
        color: 'white',
        direction: 'rtl',
    };
    Object.assign(stateInfo.style, stateInfoStyle);
    let i = 0;
    while (!state.currentPost) {
        await sleep(1);
        i++;
        if (i > 30) {
            break;
        }
    }
    const nextPost = getPostById(state.currentPost);
    const lastPost = getPostById(state.lastSuccessfulPost);
    const nextPostText = nextPost ? nextPost?.post?.substring(0, 30) + '...' : null;
    const lastPostText = lastPost ? lastPost.post?.substring(0, 30) + '...' : null;
    const errors = state.errors?.slice(-2) || [];
    let nextTime = 'לא מתוזמן';

    if (nextPost) {
      if (postManager.state.isProcessing) {
        nextTime = 'עכשיו';
      } else {
        const startDate = new Date(nextPost.start);
         state.intervalId = setInterval(() => {
          if (Date.now() >= startDate) {
            nextTime = 'עכשיו';
            clearInterval(state.intervalId);
          } else {
            nextTime = startDate.toLocaleTimeString();
          }
          stateInfo.innerHTML = `
                ${nextPostText ? `<div><b>הפוסט הבא: </b> ${nextPostText}</div>` : ''}
                <div><b>מתוזמן ל: </b> ${nextTime}</div>
                ${ (startDate >= Date.now()) ? `<div><b >עולה בעוד: </b> ${new Date(startDate - Date.now()).toISOString().substr(11, 8)}</div>` : ''}
                ${lastPostText ? `<div><b >הפוסט הקודם: </b> ${lastPostText}</div>` : ''}
                ${errors?.map(e => `<div style="color: #ff6b6b">Error: ${e.message}</div>`).slice(0,3)?.join('')}
                `;
        }, 1*1e3);
      }
    }


    stateInfo.innerHTML = `
        ${nextPostText ? `<div><b>הפוסט שרץ: </b> ${nextPostText}</div>` : ''}
        ${state.nextGroup ? `<div><b>קבוצה הבאה: </b> ${state.nextGroup}</div>` : ''}
        ${state.lastSuccessfulGroup ? `<div><b>קבוצה אחרונה: </b> ${state.lastSuccessfulGroup}</div>` : ''}
        ${state.totalFullfilled ? `<div><b>כמות הקבוצות שהושלמו: </b> ${state.totalFullfilled}</div>` : ''}
        ${lastPostText ? `<div><b>פוסט קודם: </b> ${lastPostText}</div>` : ''}
        ${errors.map(e => `<div style="color: #ff6b6b">Error: ${e.message}</div>`).slice(0,3)?.join('')}
    `;

  
    const newPostButton = document.createElement('div');
    const newPostButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', 
      cursor: 'pointer',
      padding: '8px 12px',
      flex: '0 0 auto',
      width: 'fit-content',
      borderRadius: '8px',
      marginRight: '15px',
      border: '1px solid rgba(224, 187, 149, 0.37)',
      transition: 'background-color 0.3s'
    };
    Object.assign(newPostButton.style, newPostButtonStyle);

    newPostButton.innerHTML = `
      <svg style="width:16px;height:16px;margin-left:6px" viewBox="0 0 24 24">
        <path fill="white" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
      </svg>
      <span style="color:white;font-size:13px">פוסט חדש</span>
    `;

    newPostButton.onmouseover = () => {
      newPostButton.style.backgroundColor = 'rgba(255,255,255,0.1)';
    };
    newPostButton.onmouseout = () => {
      newPostButton.style.backgroundColor = 'transparent';
    };
    newPostButton.onclick = () => {
      window.open('https://panel.taskomatic.net/login', '_blank');
    };
    if (nextPost){
      notificationBanner.appendChild(stateInfo);
    } else {
      notificationBanner.appendChild(bannerText);
    }
    notificationBanner.appendChild(newPostButton);
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
  