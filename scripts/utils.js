import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { authManager } from './authManager';
import { postManager } from './postManager';

export const production = true;
export const serverIP = 'https://panel.taskomatic.net';

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

export const logProcess = (area, message, data = null) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
  const areaStyle = area === 'WEBSOCKET' ? 'background:rgb(91, 6, 3); color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;' :'background:rgb(44, 80, 63); color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;';
  
  // console.log(
  //   `%c[${area}]%c [${timestamp}] ${message}`, 
  //   areaStyle, 
  //   'color:rgb(110, 165, 197); font-weight: bold;'
  // );
  
  if (data && APP_CONFIG.DEBUG_MODE) {
    // console.log('→ Details:', data);
  }
};


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
    console.log('Creating postomatic banner');
    
    const notificationBanner = document.createElement('div');
    notificationBanner.id = 'notificationBannerPostomatic';
    const bannerStyle = {
      position: 'fixed',
      bottom: '50px',
      right: '10px',
      padding: '20px 30px',
      minWidth: '25vw',
      maxWidth: '88vw',
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
      // First remove the UI element
      if (document.body.contains(notificationBanner)) {
        document.body.removeChild(notificationBanner);
      }
      
      // Perform complete cleanup of all processes
      performGlobalCleanup();
      
      const logStyle = 'font-weight: bold; font-size: 16px; padding: 8px 15px; background-image: linear-gradient(45deg, #ff4500, #ff8c00); border-radius: 25px; color: black ; text-shadow: 2px 2px 4px rgba(45, 21, 47, 0.3)';
      console.log('%c +++ Script execution finished! 🚀 +++ ', logStyle);
      
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

  
    notificationBanner.appendChild(bannerLogo);
    // notificationBanner.appendChild(bannerText);    
    const stateInfo = document.createElement('div');
    stateInfo.id = 'stateInfoPostomatic';
    const stateInfoStyle = {
        marginRight: '10px',
        marginLeft: '10px',
        direction: 'rtl',
        textAlign: 'start',
        fontSize: '15px',
        color: 'white',
        direction: 'rtl',
    };
    Object.assign(stateInfo.style, stateInfoStyle);
  
    await updateBanner(stateInfo)

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

    const loadAllGroupsButton = await loadAllGroups(notificationBanner);

   
    const buttonsElement = document.createElement('div');
    const buttonsElementStyle = {
      display: 'flex',
      alignItems: 'start',
      // justifyContent: 'space-evenly',
      flexDirection: 'column',
      gap: '10px',
    };
    Object.assign(buttonsElement.style, buttonsElementStyle);
    buttonsElement.appendChild(newPostButton);
    buttonsElement.appendChild(loadAllGroupsButton);
    notificationBanner.appendChild(stateInfo);
    notificationBanner.appendChild(buttonsElement);
    document.body.appendChild(notificationBanner);
};

export const APP_CONFIG = {
  PROCESS_DELAY: 2, // Default delay in seconds for process operations
  DEBUG_MODE: false  // Enable detailed logging
};

export const updateBanner = async (stateInfoElement, text) => {
    logProcess('BANNER', 'Updating banner UI');
    console.log(' ++ Updating banner ++');
    const stateInfo = stateInfoElement || document.querySelector('#stateInfoPostomatic');
    if (!stateInfo) return;
    const state = postManager.state;
    const currentPost = getPostById(state.currentPost);
    const lastPost = getPostById(state.lastSuccessfulPost);
    const currentPostGroups = currentPost ? currentPost.groups.map(group => group.groupName) : null;
    const currentPostText = currentPost ? currentPost?.post?.substring(0, 45) + '...' : null;
    const lastPostText = lastPost ? lastPost.post?.substring(0, 45) + '...' : null;
    const errors = state.errors?.slice(-2) || [];
    
    stateInfo.innerHTML = `
    <div style="display: flex; justify-content: center; gap: 8px; align-items: center;">
      <div class="spinner" style="width: 18px; height: 18px; border: 3px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <div style="margin-right: 10px; color: white;">טוען...</div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
    `;

    const stateInfoStyle = `
    <style>
      #stateInfoPostomatic div {
        margin: 5px 0;
        color: rgba(255, 255, 255, 0.85);
        width: fit-content;
      }
      #stateInfoPostomatic div>b {
        color:rgb(255, 255, 255) !important;
      }
    </style>
    `
    await sleep(1);

    if (text) {
      stateInfo.innerHTML = `
        ${stateInfoStyle}
        <div style="display: flex; justify-content: center; align-items: center;">
          <pre style="color: white;">${text}</pre>
        </div>
      `
      return;
    }
    
    // If no current post, display waiting status
    if (!currentPost && !state.isProcessing) {
      stateInfo.innerHTML = `
       ${stateInfoStyle}
       <div style="display: flex; justify-content: center; align-items: center;">
        <div style="color: white;"><b>מחכה לפוסט הבא מהשרת</b></div>
       </div>
       ${lastPostText ? `<div><b>פוסט אחרון: </b> ${lastPostText}</div>` : ''}
       ${errors.map(e => `<div style="color: #ff6b6b">Error: ${e.message}</div>`).slice(0,3)?.join('')}
      `;
      return;
    }
    // If post is currently being processed
    else if (state.isProcessing) {
      const groupButton = (buttonsName = []) => `
        <style>
        .group-buttons {
          display: flex;
          align-items: center;
          justify-content: start;
          gap: 4px;
          flex-wrap: wrap;
          width: fit-content;
          max-height: 150px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .group-buttons span {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;
          cursor: pointer;
          padding: 4px 8px;
          flex: 0 0 auto;
          width: fit-content;
          border-radius: 20px;
          border: 1px solid rgba(224, 187, 149, 0.37);
          transition: background-color 0.3s;
          background-color: rgba(0, 0, 0, 0.1);
          color: white;
          font-size: 10px;
        }
        .group-buttons span:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        </style>
        <div class="group-buttons">
        ${buttonsName.map((name) => `
          <span>${name}</span>`).join('')}
        </div>
      `;
      
      stateInfo.innerHTML = `
        ${stateInfoStyle}
        ${currentPostText ? `<div><b>הפוסט הנוכחי: </b> ${currentPostText}</div>` : ''}
        ${currentPostGroups ? `<div style="display: block;"><b>לקבוצות: </b> ${groupButton(currentPostGroups)}</div>` : ''}
        ${lastPostText ? `<div><b>פוסט קודם: </b> ${lastPostText}</div>` : ''}
        ${errors.map(e => `<div style="color: #ff6b6b">Error: ${e.message}</div>`).slice(0,3)?.join('')}
      `;
    }
    // Post is ready but not yet processing
    else {
      const groupButton = (buttonsName = []) => `
        <style>
        .group-buttons {
          display: flex;
          align-items: center;
          justify-content: start;
          gap: 4px;
          flex-wrap: wrap;
          width: fit-content;
          max-height: 150px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .group-buttons span {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;
          cursor: pointer;
          padding: 4px 8px;
          flex: 0 0 auto;
          width: fit-content;
          border-radius: 20px;
          border: 1px solid rgba(224, 187, 149, 0.37);
          transition: background-color 0.3s;
          background-color: rgba(0, 0, 0, 0.1);
          color: white;
          font-size: 10px;
        }
        .group-buttons span:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        </style>
        <div class="group-buttons">
        ${buttonsName.map((name) => `
          <span>${name}</span>`).join('')}
        </div>
      `;
      
      stateInfo.innerHTML = `
        ${stateInfoStyle}
        ${currentPostText ? `<div><b>הפוסט הבא: </b> ${currentPostText}</div>` : ''}
        ${currentPostGroups ? `<div style="display: block;"><b>לקבוצות: </b> ${groupButton(currentPostGroups)}</div>` : ''}
        ${lastPostText ? `<div><b>פוסט קודם: </b> ${lastPostText}</div>` : ''}
        ${errors.map(e => `<div style="color: #ff6b6b">Error: ${e.message}</div>`).slice(0,3)?.join('')}
      `;
    }
    stateInfo.innerHTML += stateInfoStyle;
}

// Global abort controller for fetch requests
export const fetchController = {
  controller: new AbortController(),
  signal: null,
  
  initialize() {
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    logProcess('FETCH', 'Fetch controller initialized');
  },
  
  abort() {
    logProcess('FETCH', 'Aborting all pending fetch requests');
    this.controller.abort();
    this.initialize(); // Reinitialize for future use
  }
};

// Initialize the controller
fetchController.initialize();

// Global tracking of timeouts and intervals
export const asyncTracking = {
  timeouts: new Set(),
  intervals: new Set(),
  
  setTimeout(callback, delay) {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      callback();
    }, delay);
    this.timeouts.add(id);
    return id;
  },
  
  setInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.intervals.add(id);
    return id;
  },
  
  clearAll() {
    logProcess('CLEANUP', `Clearing ${this.timeouts.size} timeouts and ${this.intervals.size} intervals`);
    // Clear all timeouts
    this.timeouts.forEach(id => {
      clearTimeout(id);
    });
    this.timeouts.clear();
    
    // Clear all intervals
    this.intervals.forEach(id => {
      clearInterval(id);
    });
    this.intervals.clear();
    
    logProcess('CLEANUP', 'All async operations cleared');
  }
};

// Enhanced sleep function with timeout tracking
export const sleep = async (s) => {
  const seconds = typeof s === 'number' ? s : APP_CONFIG.PROCESS_DELAY;
  if (APP_CONFIG.DEBUG_MODE) {
    console.log(`Sleeping for ${seconds} seconds...`);
  }
  
  return new Promise(resolve => {
    const timeoutId = asyncTracking.setTimeout(() => resolve(), seconds * 1000);
  });
};

// Global cleanup function
export const performGlobalCleanup = () => {
  logProcess('CLEANUP', 'Starting global cleanup process');
  
  // 1. Abort all fetch requests
  fetchController.abort();
  
  // 2. Clear all timeouts and intervals
  asyncTracking.clearAll();
  
  // 3. Cleanup WebSocket connections
  if (window.wsClient) {
    window.wsClient.disconnect();
  }
  
  // 4. Cleanup postManager
  if (postManager) {
    postManager.cleanup();
  }
  
  // 5. Clear auth credentials
  if (authManager) {
    authManager.clearCredentials();
  }
  
  logProcess('CLEANUP', 'Global cleanup completed');
};

export const sleep2 = async (s) => {
  const seconds = typeof s === 'number' ? s : APP_CONFIG.PROCESS_DELAY;
  if (APP_CONFIG.DEBUG_MODE) {
    console.log(`Sleeping for ${seconds} seconds...`);
  }
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};


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
  

export function getNumberOfItemsFilter(item, array) {
    if (!Array.isArray(array)) {
      return null; // Handle cases where input isn't an array
    }
  return array.filter(element => element === item).length;
}

const loadAllGroups = async () => {
  const loadGroupsButton = document.createElement('div');
  const loadGroupsButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', 
    gap: '10px',
    cursor: 'pointer',
    padding: '8px 12px',
    flex: '0 0 auto',
    width: 'fit-content',
    borderRadius: '8px',
    marginRight: '15px',
    marginLeft: '15px',
    border: '1px solid rgba(224, 187, 149, 0.37)',
    transition: 'background-color 0.3s'
  };
  Object.assign(loadGroupsButton.style, loadGroupsButtonStyle);


  loadGroupsButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#fff" height="18px" width="18px" version="1.1" id="Layer_1" viewBox="0 0 475.851 475.851" xml:space="preserve">
      <g>
        <g>
          <g>
            <path d="M151.549,145.274c0,23.39,9.145,50.385,24.462,72.214c17.389,24.78,39.376,38.427,61.911,38.427     c22.534,0,44.521-13.647,61.91-38.428c15.317-21.828,24.462-48.824,24.462-72.213c0-47.626-38.746-86.372-86.372-86.372     C190.296,58.902,151.549,97.648,151.549,145.274z M237.922,73.902c39.354,0,71.372,32.018,71.372,71.372     c0,20.118-8.33,44.487-21.74,63.598c-14.29,20.364-32.38,32.043-49.632,32.043c-17.252,0-35.342-11.679-49.632-32.043     c-13.41-19.11-21.741-43.479-21.741-63.598C166.549,105.919,198.567,73.902,237.922,73.902z"/>
            <path d="M302.372,239.167c-2.862-1.363-6.273-0.778-8.52,1.461c-16.775,16.728-36.117,25.569-55.935,25.569     c-19.821,0-39.158-8.841-55.923-25.567c-2.246-2.241-5.659-2.826-8.521-1.463c-25.254,12.022-46.628,30.829-61.811,54.388     c-15.596,24.2-23.84,52.277-23.84,81.195v0.121c0,2.116,0.894,4.134,2.461,5.556c40.492,36.722,92.922,56.945,147.633,56.945     s107.141-20.224,147.632-56.945c1.568-1.422,2.462-3.439,2.462-5.556v-0.121c0-28.918-8.242-56.995-23.834-81.194     C348.997,269.995,327.625,251.188,302.372,239.167z M237.918,422.372c-49.861,0-97.685-18.023-135.057-50.827     c0.583-24.896,7.956-48.986,21.411-69.865c12.741-19.77,30.322-35.823,51.058-46.676c18.746,17.157,40.285,26.193,62.588,26.193     c22.3,0,43.842-9.035,62.598-26.193c20.734,10.853,38.313,26.906,51.053,46.676c13.452,20.877,20.823,44.968,21.406,69.865     C335.602,404.349,287.778,422.372,237.918,422.372z"/>
            <path d="M455.077,243.89c-13.23-20.532-31.856-36.923-53.864-47.399c-2.862-1.363-6.275-0.778-8.52,1.461     c-14.312,14.271-30.79,21.815-47.654,21.815c-9.142,0-18.184-2.205-26.873-6.553c-3.706-1.853-8.209-0.353-10.063,3.351     c-1.854,3.705-0.354,8.21,3.351,10.063c10.793,5.401,22.093,8.139,33.586,8.139c19.335,0,38.004-7.737,54.288-22.437     c17.504,9.298,32.348,22.934,43.141,39.685c11.445,17.763,17.756,38.243,18.338,59.416     c-18.524,16.158-40.553,28.449-63.91,35.634c-3.959,1.218-6.182,5.415-4.964,9.374c0.992,3.225,3.96,5.297,7.166,5.297     c0.73,0,1.474-0.107,2.208-0.333c26.509-8.154,51.435-22.362,72.082-41.088c1.568-1.422,2.462-3.439,2.462-5.556v-0.105     C475.85,289.45,468.666,264.98,455.077,243.89z"/>
            <path d="M130.493,210.473c7.93,0,15.841-1.934,23.516-5.748c3.709-1.843,5.222-6.345,3.379-10.054     c-1.843-3.71-6.345-5.222-10.054-3.379c-5.582,2.774-11.248,4.18-16.841,4.18c-14.541,0-29.836-9.914-41.964-27.2     c-11.449-16.318-18.562-37.112-18.562-54.266c0-33.375,27.152-60.527,60.526-60.527c15.752,0,30.67,6.022,42.006,16.958     c2.98,2.875,7.729,2.792,10.604-0.19c2.876-2.981,2.791-7.729-0.19-10.604c-14.146-13.647-32.763-21.163-52.42-21.163     c-41.646,0-75.526,33.881-75.526,75.527c0,20.38,7.957,43.887,21.283,62.881C91.445,198.545,110.709,210.473,130.493,210.473z"/>
            <path d="M61.034,340.143c-16.753-7.222-32.209-16.972-45.989-29.004c0.582-21.112,6.875-41.53,18.291-59.243     c10.761-16.698,25.561-30.294,43.01-39.566c16.239,14.662,34.856,22.376,54.139,22.376c11.587,0,22.969-2.785,33.829-8.277     c3.696-1.87,5.177-6.381,3.308-10.078c-1.869-3.697-6.381-5.177-10.078-3.308c-8.742,4.421-17.846,6.663-27.059,6.663     c-16.811,0-33.238-7.522-47.504-21.754c-2.246-2.24-5.658-2.825-8.521-1.462c-21.954,10.451-40.534,26.8-53.733,47.28     C7.167,264.811,0,289.221,0,314.362v0.103c0,2.116,0.894,4.134,2.461,5.556c15.629,14.174,33.338,25.579,52.634,33.897     c0.968,0.417,1.975,0.615,2.966,0.615c2.904,0,5.668-1.697,6.891-4.533C66.591,346.196,64.837,341.783,61.034,340.143z"/>
            <path d="M69.854,351.003c-2.671,6.443,4.532,12.832,10.617,9.387c3.238-1.834,4.683-5.937,3.227-9.385     C81.291,344.86,72.32,345.053,69.854,351.003z"/>
            <path d="M83.698,351.005C83.888,351.455,83.518,350.545,83.698,351.005L83.698,351.005z"/>
            <path d="M303.345,70.438c11.336-10.936,26.254-16.958,42.006-16.958c33.374,0,60.526,27.152,60.526,60.527     c0,17.154-7.112,37.947-18.563,54.266c-12.128,17.286-27.424,27.2-41.964,27.2c-5.593,0-11.259-1.406-16.841-4.18     c-3.711-1.844-8.212-0.331-10.055,3.379c-1.843,3.709-0.33,8.21,3.379,10.054c7.675,3.814,15.587,5.748,23.517,5.748     c19.783,0,39.048-11.927,54.243-33.585c13.327-18.994,21.283-42.501,21.283-62.881c0-41.646-33.881-75.527-75.526-75.527     c-19.657,0-38.273,7.516-52.42,21.163c-2.981,2.875-3.066,7.624-0.19,10.604C295.614,73.229,300.363,73.314,303.345,70.438z"/>
          </g>
        </g>
      </g>
      </svg>
      <span style="color:white;font-size:13px">עדכון קבוצות</span>
  `;
  
  loadGroupsButton.onmouseover = () => {
    loadGroupsButton.style.backgroundColor = 'rgba(255,255,255,0.1)';
  };
  loadGroupsButton.onmouseout = () => {
    loadGroupsButton.style.backgroundColor = 'transparent';
  };
  loadGroupsButton.onclick = () => {
    window.open('https://www.facebook.com/groups/joins/?nav_source=tab&ordering=viewer_added');
  };

  return loadGroupsButton;
}


export async function collectGroups() {
  const groups = new Map(); // Using Map to ensure unique IDs
  let lastScrollHeight = 0;
  const startTime = Date.now();
  let retriesLeft = 3; // Number of retry attempts

  // Create overlay and dialog for showing groups
  const overlay = document.createElement('div');
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9999
  };
  Object.assign(overlay.style, overlayStyle);


  const dialog = document.createElement('div');
  const dialogStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '33vw',
    height: '60vh',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    zIndex: 10000,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column'
  };
  Object.assign(dialog.style, dialogStyle);

  // Add title
  const title = document.createElement('h2');
  title.textContent = 'Postomatic collecting groups';
  title.style.margin = '0 0 15px 0';
  title.style.padding = '0 0 10px 0';
  title.style.textAlign = 'center';
  title.style.fontSize = '20px';
  title.style.borderBottom = '1px solid #eee';

  // Add scrollable content area
  const content = document.createElement('div');
  const contentStyle = {
    overflowY: 'auto',
    flex: 1,
    padding: '10px 0'
  };
  Object.assign(content.style, contentStyle);

  dialog.appendChild(title);
  dialog.appendChild(content);
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);

  // Update function for adding new groups
  const updateGroupsList = (groups) => {
    content.innerHTML = Array.from(groups.values())
      .map(group => `<div style="margin: 5px 0">▪ ${group.groupName}</div>`)
      .join('');
  };
  
  while (true) {
    // Collect groups in current viewport
    const groupElements = document.querySelectorAll('div[role="listitem"]') || 
              document.querySelectorAll('[role="listitem"] a[role="link"]');

    for (const group of groupElements) {
      const groupLink = group.querySelector('a');
      if (!groupLink) continue;

      // Extract name from either image aria-label or SVG aria-label
      const groupNameElement = groupLink.querySelector('svg[aria-label]') || 
                  groupLink.querySelector('img[aria-label]');
      const groupName = groupNameElement?.getAttribute('aria-label') || groupLink.textContent;
      const groupUrl = groupLink.href;
      const groupId = groupUrl.replace('https://www.facebook.com/groups/', '');
      
      // Only add if ID is not already present
      if (!groups.has(groupId)) {
        groups.set(groupId, { groupName: groupName.replaceAll(',', ' '), groupId: groupId.replaceAll('/', '') });
        updateGroupsList(groups);
      }
    }

    // Scroll down one viewport height
    window.scrollTo(0, window.scrollY + window.innerHeight);
    
    // Wait for new content to load
    // Check if we've reached the bottom or timeout
    const currentHeight = document.documentElement.scrollHeight;
    const scrollDelta = Math.abs(currentHeight - lastScrollHeight);
    
    // Add timeout check (5 minutes max)
    if (Date.now() - startTime > 5 * 60 * 1000) {
      console.log('Timeout reached after 5 minutes');
      break;
    }

    // Break if no scroll change or minimal change
    if (scrollDelta < 10) {
      console.log('Reached end of page or no new content');
      const retryCount = (retriesLeft-- > 0);
      if (!retryCount) break;
      
      // Try one more scroll as fallback
      window.scrollTo(0, currentHeight);
      await sleep(3);
    }
    
    lastScrollHeight = currentHeight;
  }

  const groupArray = Array.from(groups.values());
  console.log(`Total unique groups collected: ${groupArray.length}`);
  
  return groupArray;
}



/**
 * Simulates a drag and drop file operation on an element
 * @param {HTMLElement} element - The element to drop the file on
 * @param {File} file - The file to drop
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export async function simulateDragAndDrop(element, file) {
  try {
    console.log('Simulating drag and drop for image upload...');
    
    // Create a DataTransfer object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Create and dispatch dragenter event
    const dragEnterEvent = new DragEvent('dragenter', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    });
    element.dispatchEvent(dragEnterEvent);
    await sleep(0.3);
    
    // Create and dispatch dragover event
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    });
    element.dispatchEvent(dragOverEvent);
    await sleep(0.3);
    
    // Create and dispatch drop event
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    });
    element.dispatchEvent(dropEvent);
    
    console.log('Drag and drop simulation completed');
    return true;
  } catch (error) {
    console.error('Error in drag and drop simulation:', error);
    return false;
  }
}


// Get the client facebook ID (e.g https://www.facebook.com/yourusername/)
// By looking the facebook menu at the top right corner
export const getClientFbId = async () => {
  try {
    // Try multiple methods to find Facebook ID
    
    // Method 1: Check current URL if we're on a profile page
    if (window.location.href.includes('/profile.php?id=')) {
      const urlId = new URLSearchParams(window.location.search).get('id');
      if (urlId) {
        // colorLog.green(`Facebook ID found from URL: ${urlId}`);
        return urlId;
      }
    } else if (window.location.pathname.split('/').filter(Boolean).length === 1) {
      // URL format like facebook.com/username
      const potentialUsername = window.location.pathname.split('/')[1];
      if (potentialUsername && !['groups', 'pages', 'events', 'marketplace'].includes(potentialUsername)) {
        // colorLog.green(`Facebook username found from URL: ${potentialUsername}`);
        return potentialUsername;
      }
    }
    
    // Method 2: Check for User Profile Card (like in the provided example)
    const profileCardElements = document.querySelectorAll('[role="main"] span.x1lliihq');
    for (const element of profileCardElements) {
      if (element.textContent && element.textContent.trim().length > 0) {
        // Look for a nearby image with xlink:href containing facebook profile URL
        const container = element.closest('.x1ja2u2z, .x1n2onr6');
        if (container) {
          const image = container.querySelector('image[xlink\\:href*="facebook"]');
          if (image) {
            const imageUrl = image.getAttribute('xlink:href');
            if (imageUrl && imageUrl.includes('facebook')) {
              // Extract ID from URL if numeric ID is present
              const idMatch = imageUrl.match(/\/(\d+)_/);
              if (idMatch && idMatch[1]) {
                colorLog.green(`Facebook ID found from profile card: ${idMatch[1]}`);
                return idMatch[1];
              }
              
              // If we couldn't extract ID but found a name, use the name as profile identifier
              colorLog.blue(`Using profile name as identifier: ${element.textContent.trim()}`);
              return element.textContent.trim().replace(/\s+/g, '.');
            }
          }
        }
      }
    }

    // Method 3: Original method (for logged-in user)
    const navBar = document.querySelector('[aria-label="Shortcuts"][role="navigation"]');
    if (navBar) {
      const profileLink = navBar.querySelector('li:first-child a[role="link"]');
      if (profileLink && profileLink.href) {
        const fbUrl = profileLink.href;
        
        if (fbUrl.includes('facebook.com/')) {
          const fbId = fbUrl.split('facebook.com/')[1].split('?')[0].split('/')[0];
          if (fbId) {
            // colorLog.green(`Facebook ID found from navigation: ${fbId}`);
            return fbId;
          }
        }
      }
    }
    
    // Method 4: Look for any element with a profile link
    const potentialProfileLinks = document.querySelectorAll('a[href*="/profile.php?id="], a[href*="facebook.com/"]');
    for (const link of potentialProfileLinks) {
      const href = link.getAttribute('href');
      if (href) {
        if (href.includes('/profile.php?id=')) {
          const idParam = href.split('/profile.php?id=')[1].split('&')[0];
          if (idParam) {
            colorLog.green(`Facebook ID found from profile link: ${idParam}`);
            return idParam;
          }
        } else if (href.includes('facebook.com/')) {
          const segments = href.split('facebook.com/')[1].split('?')[0].split('/');
          if (segments.length > 0 && segments[0] && !['groups', 'pages', 'events', 'marketplace'].includes(segments[0])) {
            // colorLog.green(`Facebook username found from link: ${segments[0]}`);
            return segments[0];
          }
        }
      }
    }
    
    // Method 5: Try to extract from metadata
    const metaProfileId = document.querySelector('meta[property="al:android:url"][content*="fb://profile/"]');
    if (metaProfileId) {
      const content = metaProfileId.getAttribute('content');
      const idMatch = content.match(/fb:\/\/profile\/(\d+)/);
      if (idMatch && idMatch[1]) {
        // colorLog.green(`Facebook ID found from metadata: ${idMatch[1]}`);
        return idMatch[1];
      }
    }

    // If all methods fail, try to at least find a name to use as identifier
    const nameElement = document.querySelector('h1[dir="auto"], .x1lliihq:not(:empty)');
    if (nameElement && nameElement.textContent.trim()) {
      const name = nameElement.textContent.trim();
      // colorLog.yellow(`Could not find FB ID, using name as fallback: ${name}`);
      return name.replace(/\s+/g, '.');
    }

    colorLog.red('Could not extract Facebook ID with any method');
    return null;
  } catch (error) {
    colorLog.red(`Error getting Facebook ID: ${error.message}`);
    return null;
  }
};


// Colorful console log functions

export const colorLog = {
  blue: (message, ...args) => {
    console.log(`%c${message}`, 'color: #3498db; font-weight: bold;', ...args);
  },
  green: (message, ...args) => {
    console.log(`%c${message}`, 'color: #2ecc71; font-weight: bold;', ...args);
  },
  red: (message, ...args) => {
    console.error(`%c${message}`, 'color: #e74c3c; font-weight: bold;', ...args);
  },
  yellow: (message, ...args) => {
    console.log(`%c${message}`, 'color: #f39c12; font-weight: bold;', ...args);
  },
  bold: {
    blue: (message, ...args) => {
      console.log(`%c${message}`, 'color: #3498db; font-weight: bold; font-size: 14px;', ...args);
    },
    green: (message, ...args) => {
      console.log(`%c${message}`, 'color: #2ecc71; font-weight: bold; font-size: 14px;', ...args);
    },
    red: (message, ...args) => {
      console.error(`%c${message}`, 'color: #e74c3c; font-weight: bold; font-size: 14px;', ...args);
    },
    yellow: (message, ...args) => {
      console.log(`%c${message}`, 'color: #f39c12; font-weight: bold; font-size: 14px;', ...args);
    }
  }
};