import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

console.log('%c*** Welcome to Postomatic ***', 'color: green; font-size: 20px; font-weight: bold;');


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// let posts = [
//   {
//     id: 2398432,
//     post: 'This is my first automated live post! 😊',
//     start: '2021-07-01 12:00:00',
//     repeat: 24,
//     amount: 5,
//     groups: [{
//       id: 392847324,
//       groupId: 323958957681804,
//       groupName: 'שותפים לסטארט אפ',
//     }, 
//     {
//       id: 827678,
//       groupId: 1920854911477422,
//       groupName: 'דרושים מתכנתים ואנשי פיתוח',
//     },
//     {
//       id: 239847239,
//       groupId: 1943857349578934,
//       groupName: 'שותפים fKחילחיגד אפ',
//     },
//     {
//       id: 2398472879,
//       groupId: null,
//       groupName:'aichatgptisrael',
//     }
//     ],
//     fulfilled: [239847239],
//   },
//   {
//     id: 2398432,
//     post: 'This is my Second post! 🎉',
//     start: '2021-07-01 12:00:00',
//     repeat: 24,
//     amount: 5,
//     groups: [{
//       id: 8347568356,
//       groupId: 1712618298975630,
//       groupName: 'תאילנד שלנו',
//     }, 
//     {
//       id: 827678,
//       groupId: 1920854911477422,
//       groupName: 'דרושים מתכנתים ואנשי פיתוח',
//     },
//     {
//       id: 239847239,
//       groupId: 1943857349578934,
//       groupName: 'שותפים fKחילחיגד אפ',
//     },
//     {
//       id: 2398472879,
//       groupId: null,
//       groupName:'aichatgptisrael',
//     }
//     ],
//     fulfilled: [827678, 239847239, 2398472879],
//   },
// ]

let posts = [];
let username, password;
const production = process.env.NODE_ENV === 'production';
const serverIP = production ? 'https://panel.taskomatic.net' : 'http://localhost:5000' ;

const sleep = (s=1) => new Promise((resolve) => setTimeout(resolve, s*1e3));
const waitForUser = async () => {
  const docRef = doc(db, 'mask', 'postomatic');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data()?.verify === 80;
  } else {
    return null;
  }
};

// Main app function
const startApp = async () => {
  const user = await waitForUser();
  if(!user) return

  const userIn = () => {
      return Boolean(process.env.FIREBASE_APP_ID) && process.env.PROCESS_VERIFY==='121285';
  };

  console.log('Checking login status...');
  if (sessionStorage.getItem('Postomatics-loggedIn') === 'true') {
    if (window.location.href.includes('/groups/joins/')) {
      await sleep(1); // Wait for the page to load
      const groups = await startGroupCollection();
      console.log('Collected groups:', groups);
      return true;
    }
    await sleep(1); // Wait for the page to load
    return await App();
  }
  if (!window.location.href === 'https://www.facebook.com/') {
    console.log('Go to home page to login');
    return false
  }
  // Create overlay
  const overlay = document.createElement('div');
  const overlayStyle = {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      zIndex: '999',
  };
  Object.assign(overlay.style, overlayStyle);

  // Create dialog
  const dialog = document.createElement('div');
  const dialogStyle = {
    fontFamily: 'roboto, sans-serif',
    position: 'fixed',
    dir: 'ltr',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40vw',
    maxWidth: '600px',
    minWidth: '400px',
    height: '50vh',
    minHeight: '400px',
    margin: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    padding: '2rem',
    backgroundColor: 'white',
    backgroundImage: "linear-gradient(45deg,rgba(194, 189, 191, 0.27) 0%,rgba(227, 250, 249, 0.2) 100%)",
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    zIndex: '1000'
  };
  Object.assign(dialog.style, dialogStyle);

  // Create close button
  const closeButton = document.createElement('span');
  const closeButtonStyles = {
    position: 'absolute',
    color: 'black',
    padding: '8px',
    top: '5px',
    right: '5px',
    cursor: 'pointer',
    fontSize: '24px',
    color: 'black',
  };
  closeButton.textContent = '⨷';
  Object.assign(closeButton.style, closeButtonStyles);
  closeButton.onmouseover = () => {
    closeButton.style.opacity = '0.5';
  };
  closeButton.onmouseout = () => {
    closeButton.style.opacity = '1';
  };
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
    document.body.removeChild(dialog);
  };
  dialog.appendChild(closeButton);

  const logo = document.createElement('img');
  logo.src  = chrome.runtime.getURL('icons/icon.png');
  logo.style.display = 'block';
  logo.style.width = '40px';
  logo.style.height = '40px';
  logo.style.cursor = 'pointer';
  logo.style.margin = '15px auto';
  logo.onclick = () => {
    window.open('https://Taskomatic.net', '_blank');
  };
  dialog.appendChild(logo);

  const title = document.createElement('h1');
  title.textContent = 'Welcome to Postomatics';
  title.style.textAlign = 'center';
  title.style.fontSize = '1.8rem';
  dialog.appendChild(title);


  const subTtitle = document.createElement('h4');
  subTtitle.textContent = 'Automated & AI powered social media posting';
  subTtitle.style.textAlign = 'center';
  subTtitle.style.fontSize = '0.8rem';
  subTtitle.style.color = 'gray';
  subTtitle.style.marginBottom = '15px';
  dialog.appendChild(subTtitle);

  const usernameLabel = document.createElement('label');
  usernameLabel.textContent = 'Username:';
  dialog.appendChild(usernameLabel);

  const inputStyles = {
    display: 'block',
    minWidth: '95%',
    height: '30px',
    margin: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    padding: '5px',
  }

  const usernameInput = document.createElement('input');
  Object.assign(usernameInput.style, inputStyles);
  usernameInput.type = 'text';
  usernameInput.placeholder = 'Enter your username';
  usernameInput.name = 'Postomatics-username';
  usernameInput.id = 'Postomatics-username';
  usernameInput.onfocus = ()=>{
    if (document.getElementById('login-error-message')) {
      document.getElementById('login-error-message').remove();
    }
  }
  usernameInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      loginButton.click();
    } 
  };
  usernameInput.value = '';
  dialog.appendChild(usernameInput);

  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = 'Password:';
  dialog.appendChild(passwordLabel);

  const passwordInput = document.createElement('input');
  const loginButton = document.createElement('button');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Enter your password';
  passwordInput.name = 'Postomatics-password';
  passwordInput.id = 'Postomatics-password';
  passwordInput.onfocus = ()=>{
    if (document.getElementById('login-error-message')) {
      document.getElementById('login-error-message').remove();
    }
  }
  passwordInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      loginButton.click();
    } 
  };
  passwordInput.value = '';
  Object.assign(passwordInput.style, inputStyles);
  dialog.appendChild(passwordInput);

 
  const loginButtonStyles = {
    display: 'block',
    width: '150px',
    height: '40px',
    margin: '20px auto',
    backgroundImage: 'linear-gradient(to right, #1abc9c,rgba(26, 188, 75, 0.48))',
    color: 'black',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    uppercase: 'uppercase',
    fontSize: '1.2rem',
    transition: 'all 0.8s ease',
  };
  loginButton.textContent = 'Login';
  Object.assign(loginButton.style, loginButtonStyles);
  loginButton.onclick = async () => {
    const usernameTemp = usernameInput.value;
    const passwordTemp = passwordInput.value;
    // Show loader on login button
    loginButton.disabled = true;
    loginButton.textContent = '';
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.id = 'login-loader';
    loader.style.border = '2px solid #f3f3f3';
    loader.style.borderTop = '2px solid rgb(219, 135, 52)';
    loader.style.borderRadius = '50%';
    loader.style.width = '10px';
    loader.style.height = '10px';
    loader.style.animation = 'spin 2s linear infinite';
    loader.style.margin = '0 auto';
    loginButton.appendChild(loader);

    // Add CSS for loader animation
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
    const isAuth =  await handleLogin(usernameTemp, passwordTemp);
    if (isAuth.ok && userIn()) {
      console.log('Login successful');
      document.body.removeChild(overlay);
      document.body.removeChild(dialog);
      return await App();
    }
    else {
      if (document.getElementById('login-error-message')) {
        document.getElementById('login-error-message').remove();
      }
      const errorMessage = document.createElement('p');
      errorMessage.textContent = isAuth.message;
      errorMessage.id = 'login-error-message';
      errorMessage.style.color = 'red';
      errorMessage.style.textAlign = 'center';
      dialog.appendChild(errorMessage);
      loginButton.disabled = false;
      loginButton.textContent = 'Login';
      if (document.getElementById('login-loader')) {
        document.getElementById('login-loader').remove();
      }
      return false;
    }
  };
  loginButton.onmouseover = () => {
   loginButton.style.backgroundImage = 'linear-gradient(to left, #1abc9c,rgba(26, 188, 75, 0.48))';
  };
  loginButton.onmouseout = () =>  {
    loginButton.style.backgroundImage = 'linear-gradient(to right, #1abc9c,rgba(26, 188, 75, 0.48))';
  };

  dialog.appendChild(loginButton);

  const poweredByText = document.createElement('p');
  const poweredByTextStyles = {
    position: 'absolute',
    bottom: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'gray',
  };
  Object.assign(poweredByText.style, poweredByTextStyles);
  poweredByText.innerHTML = 'Powered by <a href="https://Taskomatic.net" target="_blank" style="color: blue; text-decoration: underline;">Taskomatic.net</a>';
  dialog.appendChild(poweredByText);


  dialog.id = 'login-dialog';
  overlay.id = 'login-overlay';
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);
};


// Function to handle login
const handleLogin = async (usernameTemp, passwordTemp) => {
  console.log('Username:', usernameTemp);
  const serverResponse = await fetch(`${serverIP}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: usernameTemp, password: passwordTemp }),
  });
  const response = await serverResponse.json();
  console.log('Server response:', response);
  const response2 = await getAuth();
  if (serverResponse.ok && response2 < 100) {
    sessionStorage.setItem('Postomatics-loggedIn', 'true');
    console.log('Valid credentials');
    username = usernameTemp;
    password = passwordTemp;
    await setAuth(username);
    await sleep(1);
    // Call the main app function after successful login
    const res = {ok: true, message: response?.message}
   return res;
  }
  console.log('Invalid credentials');
  const failRes = {ok: false, message: response?.message}
  return failRes;
  // Add your login handling logic here
};


const getAuth = async () => {
  const docRef = doc(db, 'mask', 'postomatic');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data()?.value;
  } else {
    return null;
  }
};

const setAuth = async (username) => {

  const userRef = doc(db, 'postomatic', username);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentEntries = userSnap.data().entries || 0;
    await setDoc(userRef, { entries: currentEntries + 1 });
  } else {
    await setDoc(userRef, { entries: 1 });
  }
};


const collectFacebookGroups = async () => {
  // Validate page
  if (!window.location.href.includes('/groups/joins/')) {
    return false
  }

  const groupsData = new Set();
  
  const extractGroups = () => {
    try {
      // Target specific group elements
      const groupElements = document.querySelectorAll('[role="main"] a[href*="/groups/"]');
      
      groupElements.forEach(element => {
        const href = element.getAttribute('href');
        const groupId = href.match(/groups\/(\d+)/)?.[1];
        const groupName = element.textContent.trim();
        
        if (groupId && groupName) {
          groupsData.add(JSON.stringify({
            id: groupId,
            name: groupName,
            url: `https://facebook.com/groups/${groupId}`
          }));
        }
      });
    } catch (error) {
      console.error('Extraction error:', error);
    }
  };

  // Initial extraction
  await new Promise(resolve => {
    let attempts = 0;
    const interval = setInterval(() => {
      extractGroups();
      attempts++;
      
      // Stop after 10 attempts or if we found groups
      if (attempts >= 10 || groupsData.size > 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  return Array.from(groupsData).map(item => JSON.parse(item));
};

// Usage
const startGroupCollection = async () => {
  collectFacebookGroups()
    .then(groups => {
      console.log(`Found ${groups.length} groups`);
      console.log('Groups: ',groups);
      // Store or process groups as needed
    })
    .catch(error => console.error('Error collecting groups:', error));
};

const postIntoInput = async (post) => {
  console.log('Group page loading, getting ready to post in the group...');
  await sleep(1);
// Click on the title of the group to reset all focused elements
  const groupTitle = document.querySelector("h1[dir='auto']");
  if (groupTitle) {
    groupTitle.click();
  } else {
    console.error('Group title not found.');
  }
  await sleep(1);
  // Wait for the "Write something..." button
  const postButton = await waitForElement("div[role='button'][tabindex='0'] > div > span");
  await sleep(1);
  if (!postButton) return console.error('Post button not found');
  if (postButton.textContent.includes('Write something...')) {
    postButton.click();
    await sleep(1);
    const postDialogChild =  await waitForElement("div[role='dialog'][aria-label='Create post']");
    const postDialog = postDialogChild.parentElement.parentElement;
    console.log('Post dialog:', postDialog);
    await sleep(2);
    // Wait for the editable post input box
    let postInput = postDialog.querySelector("div[role='textbox'][contenteditable='true'][tabindex='0'][data-lexical-editor='true']");
    console.log('Post input:', postInput);
    if (!postInput){
      postInput = await waitForElement("div[role='textbox'][contenteditable='true'][tabindex='0'][aria-label='Create a public post…'][data-lexical-editor='true']");
    }
    if (!postInput){
      postInput = postDialog.querySelector("div[role='textbox'][contenteditable='true'][tabindex='0']");
    }
    if (!postInput) return false;
    
    postInput?.focus();
    console.log('Post input focused.');
    await sleep(1);

    // Simulate text input
    const paragraph = postInput.querySelector('p');
    // console.log('Paragraph:', paragraph);
    await sleep(1);
    if (paragraph) {
      // console.log('Paragraph element found, simulating text input...');
      paragraph.innerHTML = ''; // Clear placeholder content
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: post.post,
      });
      paragraph.appendChild(
        Object.assign(document.createElement('span'), {
          'data-lexical-text': 'true',
          textContent: post.post,
        })
      );
      postInput.dispatchEvent(inputEvent); // Trigger React updates
      console.log('Text entered into post input:', post.post);
      await sleep(4);

      // Wait for the post button to be enabled
      const finalPostButton = postDialog.querySelector("div[aria-label='Post'][role='button']");
      console.log('Final post button:', finalPostButton);
      await sleep(5);
      if (!finalPostButton) return false;
      if (production){
        finalPostButton.click();
      }
      console.log('%c *** Posted post! ***', 'color: lightpurple; font-size: 24px; font-weight: bold;');
      await sleep(5);
      return true;

    } else {
      console.error('Paragraph element not found within post input.');
    }
    return false;
  } else {
    console.error('Post button issue detected.');
    return false
  }

};


const postToGroup = async (post, state, i=0) => {
  const group = post.groups[i];
  if (!group.groupName){
    group.groupName = group.groupname;
  }
  if (!group.groupId){
    group.groupId = group.groupid;
  }
  console.log(`Processing group name: ${group.groupName || group.groupId || group.id}`);
  
  if (state.fulfilled.includes(group.id)) {
    return console.log(`Already posted post id: ${post.id}`);
  }

  try {
    if (group.groupId && !window.location.href.includes(`/groups/${group.groupId}`) && !window.location.href.includes(`/groups/${group.groupName}`)) {
      // Direct navigation if we have groupId
      state.currentGroupIndex = i;
      await saveState(state);
      await sleep(1);
      const userGesture = document.createElement('a');
      userGesture.href = `https://www.facebook.com/groups/${group.groupId}`;
      userGesture.click();
      return;
    } else if (group.groupName && !window.location.href.includes(`/groups/${group.groupId}`) && !window.location.href.includes(`/groups/${group.groupName}`)) {
      // Search for group by name if no ID
      const searchInput = await waitForElement("input[type='search'][aria-label='Search Facebook']");
      if (!searchInput) return console.log('Search input not found');
      
      searchInput.focus();
      await sleep(1);
      searchInput.value = group.groupName;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      // Wait for search results to load
      await sleep(1);
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await sleep(1);  
      // Wait for search results and find group
      const groupLinks = document.querySelectorAll(`a[href*='/groups/'][role='link'] span`);
      let groupLink = null;
      groupLinks.forEach(link => {
        if (link.textContent.includes(group.groupName)) {
          groupLink = link.closest('a[href*="/groups/"]');
        }
      });
      state.currentGroupIndex = i;
      await saveState(state);
      if (groupLink) {
        groupLink.click();
      } else {
        console.log('Group link not found, redirecting to group page by name...');
        const userGesture = document.createElement('a');
        userGesture.href = `https://www.facebook.com/groups/${group.groupName}`;
        userGesture.click();
      }
    }
    // Wait for group page to load
    const res = await postIntoInput(post);
    if (!res) return;
    console.log('Posted in group:', group.groupName);
    // Save progress
    state.fulfilled.push(group.id);
    await saveState(state);
  
  } catch (error) {
    console.error(`Error processing group ${group.groupName}:`, error);
  }
};


// Helper function to wait for element
const waitForElement = async (selector, timeout = 10*1e3) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await sleep(1);
  }
  return null;
};

  // State management
const saveState = async (state) => {
  console.log('Saving state:', state);
  await sleep(1);
  localStorage.setItem('postomatic_state', JSON.stringify(state));
};

const getState = () => {
  return JSON.parse(localStorage.getItem('postomatic_state') || '{}');
};

const clearState = async () => {
  localStorage.removeItem('postomatic_state');
  localStorage.removeItem('postomatic_posts');
};

const postToFacebook = async (post) => {
  const response = await getAuth();
  if (response >= 100) {
    return;
  }
  console.log(`Processing post id: ${post.id}`);
  const postIndex = posts.indexOf(post);
  let state = getState();
  // If no state exists, initialize it
  if (!state?.currentPost) {
    state = {
      currentPost: post.id,
      nextPost: posts[postIndex + 1]?.id,
      currentGroupIndex: 0,
      fulfilled: post.fulfilled || []
    };
    await saveState(state);
  }

  // Resume from last position
  const startIndex = state.currentGroupIndex || 0;

  for (let i = startIndex; i < post.groups.length; i++) {
    await postToGroup(post, state, i);
    if (startIndex === post.groups.length-1) {
      console.log('All groups completed for post id:', post.id);
      if (postIndex === posts.length-1) {
        console.log('All posts completed.');
        await clearState();
        return;
      }
      const nextState = {
        currentPost:  posts[posts.indexOf(post) + 1]?.id,
        nextPost: posts[posts.indexOf(post) + 2]?.id || null,
        currentGroupIndex: 0,
        fulfilled: []
      }; 
      await saveState(nextState);
      return;
    }
  }

  // Completed all groups for this post

};

const getPendingPost = async (postId) => {
  // Fetch post data from your storage
  console.log('Fetching post data for post id:', postId, posts);
  return posts.find(post => post.id === postId);
};

const createBanner = async ()=>{
  const notificationBanner = document.createElement('div');
  const bannerStyle = {
    position: 'fixed',
    bottom: '50px',
    right: '10px',
    padding: '20px',
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
  absoluteCloseButton.textContent = '⨷';
  Object.assign(absoluteCloseButton.style, absoluteCloseButtonStyles);
  absoluteCloseButton.onmouseover = () => {
    absoluteCloseButton.style.opacity = '0.5';
  };
  absoluteCloseButton.onmouseout = () => {
    absoluteCloseButton.style.opacity = '1';
  };
  absoluteCloseButton.onclick = async () => {
    document.body.removeChild(notificationBanner);
    await clearState();
    sessionStorage.removeItem('Postomatics-loggedIn');
    console.log('Script execution finished.');
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
  notificationBanner.appendChild(bannerText);

  document.body.appendChild(notificationBanner);
};

if (window.location.href === 'https://www.facebook.com/') {
  sessionStorage.removeItem('Postomatics-loggedIn');
}


const getPosts = async ()=>{
  const hasPost = localStorage.getItem('postomatic_posts');
  if (hasPost){
    posts = JSON.parse(hasPost);
    return true
  }
  const serverPosts = await fetch(`${serverIP}/getpost`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username , password}),
  });
  const res = await serverPosts.json();
   console.log('Server posts: ', res);
   if (res && res.length > 0) {
     posts = res;
     localStorage.setItem('postomatic_posts', JSON.stringify(posts));
      return true
   }
   return false
}

// On page load, check for saved state and resume
(async () => {
  const user = await waitForUser();
  if(!user) return
  const state = getState();
  console.log('Current state:', state); 
  
  if (state.currentPost) {
    // Get post data from your storage
    await createBanner();
    await getPosts();
    const post = await getPendingPost(state.currentPost);
    console.log('Pending post:', post); 
    if (post) {
      await postToFacebook(post);
    }
  }
  else {
    await startApp();
  }
})();




const App = async () => {
    await createBanner();
    console.log('%c*** Initializing ***', 'color: lightgreen; font-size: 20px; font-weight: bold;');
    await getPosts();
    for (const post of posts) {
      await postToFacebook(post);
    }
  };




