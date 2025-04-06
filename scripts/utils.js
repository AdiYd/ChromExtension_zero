
import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { authManager } from './authManager';
import { postManager } from './postManager';

export const production = chrome.runtime.getManifest().production;
console.log('Production:', production); 
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
        if (document.getElementById('notificationBannerPostomatic')) {
          document.getElementById('notificationBannerPostomatic').remove();
        };
        const state = postManager.state;
        const notificationBanner = document.createElement('div');
        notificationBanner.id = 'notificationBannerPostomatic';
        const bannerStyle = {
          position: 'fixed',
          bottom: '50px',
          right: '10px',
          padding: '20px 30px',
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
            if (i > 15) {
                break;
            }
        }
        const nextPost = getPostById(state.currentPost);
        const lastPost = getPostById(state.lastSuccessfulPost);
        const nextPostText = nextPost ? nextPost?.post?.substring(0, 30) + '...' : null;
        const lastPostText = lastPost ? lastPost.post?.substring(0, 30) + '...' : null;
        const errors = state.errors?.slice(-2) || [];
        let nextTime = 'לא מתוזמן';
        await sleep(2);

        if (nextPost && !state.isProcessing) {
          if (state.isProcessing) {
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
        else if (state.isProcessing) {
          let postDelayed = 0;
            const postDelayTimer = setInterval(() => {
              if (state.postDelay*60 - postDelayed <= 0) {
                  delete state.postDelay;
                  clearInterval(postDelayTimer);
                  postDelayed = 0;
                }
                else {
                    stateInfo.innerHTML = `
                    ${nextPostText ? `<div><b>הפוסט שרץ: </b> ${nextPostText}</div>` : ''}
                    ${state.nextGroup ? `<div><b>קבוצה הבאה: </b> ${state.nextGroup}</div>` : ''}
                    ${state.postDelay ? `<div><b>הפוסט הבא יעלה בעוד: </b> ${Math.floor(state.postDelay*60 - postDelayed)} שניות</div>` : ''}
                    ${state.lastSuccessfulGroup ? `<div><b>קבוצה אחרונה: </b> ${state.lastSuccessfulGroup}</div>` : ''}
                    ${state.totalFullfilled ? `<div><b>כמות הקבוצות שהושלמו: </b> ${state.totalFullfilled}</div>` : ''}
                    ${lastPostText ? `<div><b>פוסט קודם: </b> ${lastPostText}</div>` : ''}
                    ${errors.map(e => `<div style="color: #ff6b6b">Error: ${e.message}</div>`).slice(0,3)?.join('')}
                `;
                postDelayed += 1;
                }
              }, 1*1e3);
        }
        else{
          stateInfo.innerHTML = `
          ${nextPostText ? `<div><b>הפוסט הבא: </b> ${nextPostText}</div>` : ''}
          ${state.nextGroup ? `<div><b>קבוצה הבאה: </b> ${state.nextGroup}</div>` : ''}
          ${state.lastSuccessfulGroup ? `<div><b>קבוצה אחרונה: </b> ${state.lastSuccessfulGroup}</div>` : ''}
          ${state.totalFullfilled ? `<div><b>כמות הקבוצות שהושלמו: </b> ${state.totalFullfilled}</div>` : ''}
          ${lastPostText ? `<div><b>פוסט קודם: </b> ${lastPostText}</div>` : ''}
          ${errors.map(e => `<div style="color: #ff6b6b">Error: ${e.message}</div>`).slice(0,3)?.join('')}
        `;
        }

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

        if (nextPost){
          notificationBanner.appendChild(stateInfo);
        } else {
          notificationBanner.appendChild(bannerText);
        }
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

        notificationBanner.appendChild(buttonsElement);
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
        console.log('Setting fulfill:', postId, groupId);
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