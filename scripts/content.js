import { authManager, flag } from './authManager';
import { postManager } from './postManager';
import {  getManagerApprove,  waitForElement, production, sleep, setFulfilled, createBanner, config, simulateTyping } from './utils';


// console.log('%c *** Welcome to Postomatic *** ', 'background: linear-gradient(to right,rgba(175, 234, 171, 0.79), #4ca1af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 20px; font-weight: bold;');


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





// Main app function
const startApp = async () => {

  const userIn = () => {
      return Boolean(process.env.FIREBASE_APP_ID) && process.env.PROCESS_VERIFY==='121285';
  };

  if (!window.location.href === 'https://www.facebook.com/') {
    console.log('Go to home page to login');
    window.location.href = 'https://www.facebook.com/';
    return false;
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
    height: '65vh',
    minHeight: '450px',
    margin: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    padding: '1rem',
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
  closeButton.textContent = '⊗';
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

  // Create terms checkbox container
  const termsContainer = document.createElement('div');
  termsContainer.style.margin = '10px';
  termsContainer.style.display = 'flex';
  termsContainer.style.alignItems = 'start';

  // Create checkbox
  const termsCheckbox = document.createElement('input');
  termsCheckbox.type = 'checkbox';
  termsCheckbox.id = 'terms-checkbox';
  termsCheckbox.style.marginRight = '10px';
  termsCheckbox.onchange = (e) => {
    if (!e.target.checked) {
      document.getElementById('approve-error-message').style.visibility = 'visible';
    } else {
      document.getElementById('approve-error-message').style.visibility = 'hidden';
    }
  };

  // Create label
  const termsLabel = document.createElement('label');
  termsLabel.htmlFor = 'terms-checkbox';
  termsLabel.innerHTML = 'I have read and agree to the <a href="https://taskomatic.net/terms" target="_blank" style="color: blue; text-decoration: underline;">Terms and Conditions</a>';
  termsLabel.style.fontSize = '0.8rem';

  termsContainer.appendChild(termsCheckbox);
  termsContainer.appendChild(termsLabel);
  dialog.appendChild(termsContainer);

  const errorMessageApprove = document.createElement('p');
  errorMessageApprove.textContent = 'Please accept the Terms and Conditions';
  errorMessageApprove.id = 'approve-error-message';
  errorMessageApprove.style.color = 'red';
  errorMessageApprove.style.margin = '5px auto';
  errorMessageApprove.style.marginLeft = '10px';
  errorMessageApprove.style.textAlign = 'start';
  errorMessageApprove.style.visibility = 'hidden';
  dialog.appendChild(errorMessageApprove);
 
  const loginButtonStyles = {
    display: 'block',
    width: '150px',
    height: '40px',
    margin: '10px auto',
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
    if (!termsCheckbox.checked) {
      if (document.getElementById('approve-error-message')) {
        document.getElementById('approve-error-message').style.visibility = 'visible';
      }
      return;
    }
    const username = usernameInput.value;
    const password = passwordInput.value;
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
    const isAuth =  await authManager.login(username, password);
    if (isAuth.ok && userIn()) {
      console.log('%c +++ Login successful +++', 'background: linear-gradient(to right, #ff69b4, #ffa07a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 18px; font-weight: bold;');
      document.body.removeChild(overlay);
      document.body.removeChild(dialog);
      
      postManager.initialize();
      await createBanner()
      await sleep(5)
      // return await App();
    }
    else {
      if (document.getElementById('login-error-message')) {
        document.getElementById('login-error-message').remove();
      }
      const errorMessage = document.createElement('p');
      errorMessage.textContent = isAuth.message;
      errorMessage.id = 'login-error-message';
      errorMessage.style.color = 'red';
      errorMessage.style.margin = '5px auto';
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
  // if (!flag.main) return false;
  await sleep(1);
// Click on the title of the group to reset all focused elements

  let option = authManager?.authProvider?.option || 1;
  await sleep(1);
  // Wait for the "Write something..." button
  const postButton = await waitForElement("div[role='button'][tabindex='0'] > div > span");
  await sleep(1);
  if (!postButton) {
    console.error('Create a post button not found');
    await sleep(40);
    return false;
  }
  if (postButton.textContent.includes('Write something...')) {
    postButton.click();
    await sleep(3);
    const postDialogChild =  await waitForElement("div[role='dialog'][aria-label='Create post']");
    const postDialog = postDialogChild.parentElement.parentElement;
    if (!postDialog) {
      console.error('Post dialog not found.');
      await sleep(40);
      return false;
    }
    console.log('Post dialog:', postDialog);
    await sleep(3);

    // Find the post input
    let postInput = null;
    const inputSelectos =[
      "div[role='textbox'][contenteditable='true'][tabindex='0'][data-lexical-editor='true']",
      "div[role='textbox'][contenteditable='true'][tabindex='0'][aria-label='Create a public post…'][data-lexical-editor='true']",
      "div[role='textbox'][contenteditable='true'][tabindex='0']"
    ]

    for (const selector of inputSelectos) {
      postInput = postDialog.querySelector(selector);
      if (postInput) break;
    }

    if (!postInput){
      console.error('Post input not found.');
      await sleep(40);
      return false;
    }

    console.log('Post input:', postInput);
    postInput.style.backgroundColor = 'lightyellow';
    postInput?.focus();
    const postText = post.post.replace(/\s+/g, ' ').trim();
    await sleep(2);

    if (option === 1) {
      try {
        const success = document.execCommand('insertText', false, postText);
        if (!success) {
          console.error("execCommand didn't work, fallback to manual typing...");
          await simulateTyping(postInput, postText);
          option += 1;
        } else {
          // dispatch event כדי לעדכן את React
          postInput.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            data: postText,
          }));
        }
      } catch (err) {
        console.error("execCommand error, fallback to manual typing...", err);
        await simulateTyping(postInput, postText);
        option += 1;
      }
    }

    if (option === 2) {
      // Verify we have the correct element
      const isTextbox = (
        postInput.getAttribute('data-lexical-editor') === 'true' &&
        postInput.getAttribute('role') === 'textbox' &&
        postInput.getAttribute('contenteditable') === 'true'
      );
    
      if (!isTextbox) {
        console.error('PostInput is not the textbox element');
        option += 1;
        // await sleep(40);
        // return false;
      }
      else{
          // Clear existing content
          postInput.innerHTML = '';
          postInput.focus();
          await sleep(1);
        
          // Insert new content
          const p = document.createElement('p');
          // No class needed, just set the text content
          p.textContent = postText;
          postInput.appendChild(p);
        
          // Dispatch events
          postInput.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            data: postText
          }));
      }
    }
    if (option === 3){
        // Simulate text input
        const paragraph = postInput.querySelector('p');
        // console.log('Paragraph:', paragraph);
        await sleep(1);
        if (!paragraph) {
          console.error('Paragraph element not found');
          option += 1;
          // await sleep(10);
          // return false;
        }
        else {
          // console.log('Paragraph element found, simulating text input...');
          paragraph.innerHTML = ''; // Clear placeholder content
          const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            data: postText,
          });
            paragraph.appendChild(
            Object.assign(document.createElement('span'), {
                'data-lexical-text': 'true',
                'data-lexical-node': 'true',
                'class': 'xdj266r x11i5rnm xat24cr x1mh8g0r',
                'dir': 'auto',
                'spellcheck': 'true',
                'style': 'white-space: pre-wrap;',
                'data-text': 'true',
                textContent: postText,
              })
            );

          postInput.dispatchEvent(inputEvent); // Trigger React updates
        }
    }
    if (option === 4){
        postInput.innerHTML = `
            <div class="x1iorvi4 x1pi30zi" data-lexical-root="true" style="max-width: 100%; min-height: 100px;">
              <div class="xdj266r x11i5rnm xat24cr x1mh8g0r x1w2wdvj">
                <p class="xdj266r x11i5rnm xat24cr x1mh8g0r" dir="auto">
                  <span data-lexical-text="true" data-lexical-node="true" class="xdj266r x11i5rnm xat24cr x1mh8g0r">${post.post.trim()}</span>
                </p>
              </div>
            </div>
            `;
      //   postInput.innerHTML = `
      //   <div class=""><div class=""><p dir="auto">
      //     <span data-lexical-text="true">${post.post}</span>
      //   </p></div></div>
      // `;

      // Method 3: Try dispatching multiple events
      const events = [
        new InputEvent('input', { bubbles: true, cancelable: true, data: post.post }),
        new Event('change', { bubbles: true }),
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      ];

      for (const event of events) {
        postInput.dispatchEvent(event);
      }
      // Verify the post content was inserted correctly
      await sleep(2);
      const verifyPost = postInput.textContent.trim();
      await sleep(2);
      if (!verifyPost.includes(post.post.trim())) {
        console.log('Post content verification failed.');
        await sleep(10);
        return false;
      }
    }
    console.log('Post flow:', option);
    await sleep(2);

    // Find post button with multiple selectors
    const postButtonSelectors = [
      "div[aria-label='Post'][role='button']",
      "div[role='button'] span:contains('Post')",
      "div.x1i10hfl[role='button']",
      "div[tabindex='0'][role='button'] span.x1lliihq:contains('Post')"
    ];

    let finalPostButton = null;
    for (const selector of postButtonSelectors) {
      finalPostButton = postDialog.querySelector(selector);
      if (finalPostButton) {
        break;
      }
    }

    if (!finalPostButton) {
      console.error('Post button not found');
      await sleep(10);
      return false;
    }

    // Style the button and its container
    if (production || true ) {
      // Target the inner container div that handles background
      const buttonContainer = finalPostButton.querySelector('.x1ja2u2z');
      if (buttonContainer) {
        buttonContainer.style.cssText = `
          background-image: linear-gradient(45deg, #2c3e50, #4ca1af) !important;
          box-shadow: 0 -5px 15px rgba(140, 76, 175, 0.7) !important;
          transition: all 0.3s ease !important;
        `;
      } else {
        // Fallback to main button
        console.log('Post final button: ', finalPostButton);
        buttonContainer.style.cssText = `
          background-image: linear-gradient(45deg, #2c3e50, #4ca1af) !important;
          box-shadow: 0 -5px 15px rgba(140, 76, 175, 0.7) !important;
          transition: all 0.3s ease !important;
        `;
      }
    }

    await sleep(2);
    if (authManager.authProvider?.click || false){
      if (!authManager.credentials || !authManager.isLoggedIn()) {
        console.error('User not logged in');
        return false;
      }
      console.log('%c+++ Clicking Post Button +++', 'color: pink; font-weight: bold; font-size: 16px');
      finalPostButton.click();
    }
    await sleep(5);
    return true;
  } else {
    console.error('Post did not posted!');
    await sleep(40);
    return false
  }

};

export const postToGroup = async (post) => {
  
  const state = postManager.state;
  const group = post.groups[state.groupIndex];

  try {
      if (!authManager.credentials || !authManager.isLoggedIn()) {
        return {status: false, message: 'User not logged in'};
    }
      // Normalize group data
      group.groupName = group.groupName || group.groupname;
      group.groupId = group.groupId || group.groupid;

      // Check if already posted
      if (state.fulfilled.includes(group.id)) {
          console.log(`Already posted in group ${group.id}`);
          return {status: true, message: 'Already posted'};
      }

      // Validate group data
      if (!group.groupId && !group.groupName) {
          return {status: false, message: 'Invalid group data'};
      }

      // Navigate to group
      if (!window.location.href.includes(`/groups/${group.groupId}`)) {
          const url = `https://www.facebook.com/groups/${group.groupId}`;
          window.location.href = url;
          await sleep(10);
          return {status: false, message: 'Navigating to group'};
      }

      // Post content
      console.log(`%c *** Posting in group  ${group.groupName} *** `, 'color:rgb(198, 225, 252); font-size: 18px; border-radius: 12px; font-weight: 600; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); background: linear-gradient(45deg,rgb(213, 58, 66), #9400D3);');
      const posted = await postIntoInput(post);
      
      if (!posted) {
          postManager.saveState();
          if (state.retryCount > 3) {
              throw new Error('Max retries exceeded');
          }
          return {status: false, message: 'Post failed'};
      }
      console.log(`%c *** Posted in group 🎉 *** `, 'color:rgb(211, 224, 238); font-size: 18px; border-radius: 12px; font-weight: 800; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); background: linear-gradient(45deg, #2c3e50, #4ca1af);');
      // Reset retry counter on success
      state.retryCount = 0;
      postManager.saveState();
      
      return {status: true, message: 'Post successful'};
  } catch (error) {
      console.error(`Error in group ${group.groupName}:`, error);
      return {status: false, message: error.message};
  }
};

export const postToFacebook = async (post) => {
  const state = postManager.state;

  try {
      if (!authManager.credentials || !authManager.isLoggedIn()) {
          throw new Error('User not logged in');
      }
      if (!post || !post.groups || !post.groups.length) {
          throw new Error('Invalid post structure or groups');
      }


      for (let i = state.groupIndex; i < post.groups.length; i++) {
          // Update current execution state
          state.currentPost = post.id;
          state.groupIndex = i;
          postManager.saveState();

          const isPosted = await postToGroup(post);
          if (!isPosted.status) {
              state.errors.push({
                  postId: post.id,
                  message: isPosted.message,
                  groupId: post.groups[i].id,
                  time: new Date().toISOString()
              });
              state.groupIndex = i + 1;
              postManager.saveState();
              continue;
          }
          else {
            // Update success state
            state.fulfilled.push(post.groups[i].id);
            await setFulfilled(post.id, post.groups[i]?.id);
            state.groupIndex = i + 1;
            state.lastPostTime = new Date().toISOString();
            postManager.saveState();
          }
      }

      // Post completed successfully
      state.currentPost = null;
      state.groupIndex = 0;
      state.lastSuccessfulPost = post.id;
      state.fulfilled = [];
      state.isProcessing = false;
      postManager.saveState();
      return true;
      
  } catch (error) {
      console.error('Post execution failed:', error);
      state.errors.push({
          postId: post.id,
          message: error.message,
          time: new Date().toISOString()
      });
      postManager.saveState();
      return false;
  }
};





async function initializePostomatic() {
  console.log('%c *** Postomatic Initializing *** ', 'background: linear-gradient(to right, #4ca1af, #c4e0e5); color: black ; padding: 7px 10px; border-radius: 8px; box-shadow: 0 0 10px rgba(30, 18, 43, 0.3); font-size: 20px; font-weight: bold;');
  
  const approve = await getManagerApprove();
  if(!approve) return
  if (!config.appId || !config.projectId) return
    
  // Check if already logged in
  if (authManager.isLoggedIn()) {
    console.log(`%c +++ ${authManager.credentials?.username || ''} logged in +++`, 'background: linear-gradient(to right, #ff69b4, #ffa07a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 18px; font-weight: bold;');
      postManager.initialize();
      await createBanner();
      return;
  }

  // Show login UI if needed
  if (window.location.href === 'https://www.facebook.com/') {
      await startApp();
  }
  else if (!authManager.isLoggedIn()) {
    console.log('%c *** Go to home page to login to postomatic *** ', 'background: linear-gradient(to right, #ffd700, #d3d3d3); color: black; font-weight: bold; font-size: 20px; padding: 4px 8px; border-radius: 8px;');
    console.log('https://www.facebook.com/');
  }

}

window.addEventListener('load', initializePostomatic);






