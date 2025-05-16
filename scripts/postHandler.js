import { postManager } from './postManager';
import { logProcess, sleep, updateBanner, APP_CONFIG } from './utils';

// State management
const POST_HANDLER_STATE_KEY = 'FB_POST_HANDLER_STATE';

export class PostHandler {
  constructor(groupId, postText, options = {}) {
    this.groupId = groupId;
    this.postText = postText;
    this.postElement = null;
    this.isProcessing = false;
    this.isFound = false;
    this.options = {
      maxAttempts: 5,
      attemptDelay: 2, // seconds
      ...options
    };
    
    // Initialize state
    this.state = this.loadState() || {
      groupId,
      postText,
      lastAttempt: null,
      attemptCount: 0,
      successful: false,
      redirected: false
    };
    
    // Check if we were redirected to the group page
    this.checkForRedirect();
  }
  
  /**
   * Load state from session storage
   */
  loadState() {
    logProcess('POST_HANDLER', 'Loading state from storage');
    const saved = sessionStorage.getItem(POST_HANDLER_STATE_KEY);
    const loadedState = saved ? JSON.parse(saved) : null;
    
    if (loadedState) {
      logProcess('POST_HANDLER', 'State loaded', loadedState);
      // Only use the state if it matches our current target
      if (loadedState.groupId === this.groupId && loadedState.postText === this.postText) {
        return loadedState;
      }
    }
    return null;
  }
  
  /**
   * Save current state to session storage
   */
  saveState() {
    logProcess('POST_HANDLER', 'Saving state to storage', this.state);
    sessionStorage.setItem(POST_HANDLER_STATE_KEY, JSON.stringify(this.state));
  }
  
  /**
   * Clear state from session storage
   */
  clearState() {
    logProcess('POST_HANDLER', 'Clearing state');
    sessionStorage.removeItem(POST_HANDLER_STATE_KEY);
    this.state = {
      groupId: this.groupId,
      postText: this.postText,
      lastAttempt: null,
      attemptCount: 0,
      successful: false,
      redirected: false
    };
  }
  
  /**
   * Check if we were redirected to the group page and should start detection
   */
  checkForRedirect() {
    // If we previously set the redirected flag and we're now at the group URL
    if (this.state.redirected && window.location.href.includes(`/groups/${this.groupId}`)) {
      logProcess('POST_HANDLER', 'Detected redirect completion, starting post search');
      this.state.redirected = false;
      this.saveState();
      
      // Wait a moment for the page to fully load before searching
      setTimeout(() => this.detectPost(), 2000);
    }
  }
  
  /**
   * Initialize the post handler and validate current location
   */
  async initialize() {
    logProcess('POST_HANDLER', `Initializing for group: ${this.groupId}, post text: "${this.postText.substring(0, 30)}..."`);
    
    // Check if we're already in the correct group
    if (!window.location.href.includes(`/groups/${this.groupId}`)) {
      logProcess('POST_HANDLER', 'Not in correct group, navigating...');
      return this.navigateToGroup();
    }
    
    // We're in the correct group, try to detect the post
    return await this.detectPost();
  }
  
  /**
   * Navigate to the target group
   */
  navigateToGroup() {
    logProcess('POST_HANDLER', `Navigating to group: ${this.groupId}`);
    
    // Set redirected flag so we know to resume after navigation
    this.state.redirected = true;
    this.state.lastAttempt = new Date().toISOString();
    this.saveState();
    
    // Navigate to the group page
    const url = `https://www.facebook.com/groups/${this.groupId}`;
    window.location.href = url;
    
    // Return false since we're navigating away and not ready yet
    return false;
  }
  
  /**
   * Find the post element in the current page
   */
  async detectPost() {
    if (this.isProcessing) {
      logProcess('POST_HANDLER', 'Already processing a detection request');
      return false;
    }
    
    this.isProcessing = true;
    this.state.attemptCount++;
    this.state.lastAttempt = new Date().toISOString();
    this.saveState();
    
    try {
      logProcess('POST_HANDLER', `Detecting post (Attempt ${this.state.attemptCount}/${this.options.maxAttempts})`);
      await updateBanner(undefined, `Searching for post in group ${this.groupId}...`);
      
      // Scroll down slightly to ensure more posts are loaded
      window.scrollBy(0, window.innerHeight * 0.5);
      await sleep(1);
      
      // Try to find the post using the existing getPostElement function
      this.postElement = await getPostElement({ post: this.postText });
      
      if (this.postElement) {
        logProcess('POST_HANDLER', 'Post element found!', this.postElement);
        this.isFound = true;
        this.state.successful = true;
        this.saveState();
        await updateBanner(undefined, `Post found in group ${this.groupId}!`);
        this.isProcessing = false;
        return true;
      }
      
      // Post not found yet
      logProcess('POST_HANDLER', 'Post not found in current view');
      
      // Check if we've reached the maximum number of attempts
      if (this.state.attemptCount >= this.options.maxAttempts) {
        logProcess('POST_HANDLER', 'Maximum attempts reached, giving up');
        await updateBanner(undefined, `Could not find post in group ${this.groupId} after multiple attempts`);
        this.isProcessing = false;
        return false;
      }
      
      // Try scrolling more and trying again
      logProcess('POST_HANDLER', `Scrolling and retrying in ${this.options.attemptDelay} seconds`);
      window.scrollBy(0, window.innerHeight);
      
      // Wait before trying again
      await sleep(this.options.attemptDelay);
      this.isProcessing = false;
      
      // Recursive call to try again
      return await this.detectPost();
      
    } catch (error) {
      logProcess('ERROR', `Error detecting post: ${error.message}`);
      this.isProcessing = false;
      return false;
    }
  }
  
  /**
   * Like the detected post
   */
  async like_post() {
    if (!this.isFound || !this.postElement) {
      logProcess('POST_HANDLER', 'Cannot like post - post not found yet');
      return false;
    }
    
    try {
      logProcess('POST_HANDLER', 'Attempting to like post');
      const result = await likePost(this.postElement);
      
      if (result) {
        logProcess('POST_HANDLER', 'Successfully liked post');
        return true;
      } else {
        logProcess('POST_HANDLER', 'Failed to like post');
        return false;
      }
    } catch (error) {
      logProcess('ERROR', `Error liking post: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Comment on the detected post
   */
  async comment_on_post(commentText) {
    if (!this.isFound || !this.postElement) {
      logProcess('POST_HANDLER', 'Cannot comment on post - post not found yet');
      return false;
    }
    
    if (!commentText || typeof commentText !== 'string') {
      logProcess('ERROR', 'Invalid comment text provided');
      return false;
    }
    
    try {
      logProcess('POST_HANDLER', `Attempting to comment on post: "${commentText.substring(0, 20)}..."`);
      const result = await commentOnPost(this.postElement, commentText);
      
      if (result) {
        logProcess('POST_HANDLER', 'Successfully commented on post');
        return true;
      } else {
        logProcess('POST_HANDLER', 'Failed to comment on post');
        return false;
      }
    } catch (error) {
      logProcess('ERROR', `Error commenting on post: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Force a refresh of the post detection
   */
  async refreshPostDetection() {
    this.isFound = false;
    this.postElement = null;
    this.state.successful = false;
    this.saveState();
    
    return await this.detectPost();
  }
  
  /**
   * Clean up resources used by this handler
   */
  cleanup() {
    logProcess('POST_HANDLER', 'Cleaning up resources');
    this.clearState();
    this.postElement = null;
    this.isProcessing = false;
    this.isFound = false;
  }
}

// Example of creating a function to find and interact with a post
export const findAndInteractWithPost = async (groupId, postText, interaction = {}) => {
  try {
    const handler = new PostHandler(groupId, postText);
    const initialized = await handler.initialize();
    
    if (!initialized) {
      logProcess('POST_HANDLER', 'Failed to initialize post handler');
      return false;
    }
    
    let result = true;
    
    // Like the post if requested
    if (interaction.like) {
      const likeResult = await handler.like_post();
      result = result && likeResult;
    }
    
    // Comment on the post if requested
    if (interaction.comment) {
      const commentResult = await handler.comment_on_post(interaction.comment);
      result = result && commentResult;
    }
    
    // Clean up after interactions
    if (!interaction.keepAlive) {
      handler.cleanup();
    }
    
    return result;
  } catch (error) {
    logProcess('ERROR', `Error in findAndInteractWithPost: ${error.message}`);
    return false;
  }
};

export const getPostElement = async (post) => {
  logProcess('PostElement', '%c 🔍 Starting post element search...', 'color: #4287f5; font-weight: bold;');
  
  if (!post) {
    post = getPostById(postManager.state.currentPost);
    if (!post || !post.post) {
      console.error('❌ Post not found in state or by ID');
      return null;
    }
  }

  const postText = post.post.trim();
  const normalizedPostText = postText.replace(/\s+/g, ' '); // Normalize spaces
  logProcess('PostElement', `🔍 Looking for post with text: "${postText.substring(0, 50)}${postText.length > 50 ? '...' : ''}"`);

  // Helper function to check if element contains text (direct or in children)
  const hasText = (element, searchText) => {
    if (!element || !element.textContent) return false;
    
    // Check if element directly contains the text
    const elementText = element.textContent.trim().replace(/\s+/g, ' ');
    
    // For shorter texts, require exact match or containment
    if (searchText.length < 100) {
      return elementText.includes(searchText);
    }
    
    // For longer texts, check substantial overlap (at least 80% of text)
    const overlap = searchText.length > elementText.length 
      ? elementText.length / searchText.length
      : searchText.length / elementText.length;
      
    return overlap >= 0.8 || elementText.includes(searchText) || searchText.includes(elementText);
  };
  
  // Check if element appears to be a post container (has engagement elements)
  const isPostContainer = (element) => {
    if (!element) return false;
    
    // Look for common Facebook post indicators
    return (
      // Has like, comment, or share buttons
      !!element.querySelector('div[aria-label*="Like"]') ||
      !!element.querySelector('div[aria-label*="Comment"]') ||
      !!element.querySelector('div[aria-label*="Share"]') ||
      !!element.querySelector('div[aria-label*="אהבתי"]') || // Hebrew "Like"
      !!element.querySelector('div[aria-label*="תגובה"]') || // Hebrew "Comment"
      !!element.querySelector('div[aria-label*="שיתוף"]') || // Hebrew "Share"
      
      // Has timestamp elements
      !!element.querySelector('a[href*="/posts/"]') ||
      !!element.querySelector('a[href*="/permalink/"]') ||
      !!element.querySelector('span[id][title*=":"]') || // Timestamp often has time with colons
      
      // Common Facebook post class patterns
      element.classList.contains('userContentWrapper') ||
      element.classList.contains('_5pcr') ||
      element.classList.contains('_1dwg')
    );
  };

  // First, find feed containers
  logProcess('PostElement', '🔍 Searching for feed containers in the page...');
  const feedContainers = Array.from(document.querySelectorAll('div[role="feed"]'));
  logProcess('PostElement', `📊 Found ${feedContainers.length} feed containers`);
  
  // Search for direct children of feed containers that contain our text
  if (feedContainers.length > 0) {
    for (const feedContainer of feedContainers) {
      // Get all direct children of the feed
      const feedChildren = Array.from(feedContainer.children);
      logProcess('PostElement', `📊 Checking ${feedChildren.length} direct children of feed container`);
      
      for (const child of feedChildren) {
        // Check if this direct child contains our text
        if (hasText(child, normalizedPostText)) {
          logProcess('PostElement', '✅ Found direct child with matching text:', child);
          
          // Ensure this is not the feed itself
          if (child === feedContainer) {
            continue;
          }
          
          // Make sure we found a post-like container
          if (isPostContainer(child) || child.getAttribute('role') === 'article') {
            logProcess('PostElement', '✅ Found post container as direct child of feed:', child);
            return child; // Return the first matching direct child
          }
          
          // If child doesn't look like a post container, find one within it
          const childPostContainer = child.querySelector('[role="article"]') || 
                                    Array.from(child.querySelectorAll('*')).find(isPostContainer);
          
          if (childPostContainer) {
            logProcess('PostElement', '✅ Found post container within matching child:', childPostContainer);
            return childPostContainer;
          }
          
          // If no proper post container found, just return the child itself
          return child;
        }
        
        // If this child doesn't directly contain the text, check its descendants
        const elementWithText = child.querySelector('*:not([role="feed"])');
        
        if (elementWithText && hasText(elementWithText, normalizedPostText)) {
          logProcess('PostElement', '✅ Found element with matching text inside child:', elementWithText);
          
          // Find the closest post-like container inside this child
          const postContainer = elementWithText.closest('[role="article"]') || 
                               child.querySelector('[role="article"]') ||
                               Array.from(child.querySelectorAll('*')).find(isPostContainer);
          
          if (postContainer && postContainer !== feedContainer) {
            logProcess('PostElement', '✅ Found post container containing text element:', postContainer);
            return postContainer;
          }
          
          // If no proper post container, return the direct child of feed
          logProcess('PostElement', '⚠️ No specific post container found, returning feed\'s child:', child);
          return child;
        }
      }
    }
  }
  
  // If not found by direct feed children, try a broader approach
  logProcess('PostElement', '🔍 No direct feed children contained the post, trying broader search...');
  
  // Look for any elements with the text in the document
  const allElements = Array.from(document.body.querySelectorAll('*:not([role="feed"])'));
  const matchingElements = allElements.filter(el => hasText(el, normalizedPostText));
  
  if (matchingElements.length > 0) {
    logProcess('PostElement', `📊 Found ${matchingElements.length} elements with matching text`);
    
    // Get the first matching element
    const firstMatch = matchingElements[0];
    logProcess('PostElement', '✅ Found element with matching text (broader search):', firstMatch);
    
    // Try to find a post container for this element
    const feedParent = firstMatch.closest('[role="feed"]');
    
    if (feedParent) {
      // Find the closest child of feed that contains our match
      let currentNode = firstMatch;
      while (currentNode && currentNode.parentElement !== feedParent) {
        currentNode = currentNode.parentElement;
      }
      
      if (currentNode) {
        logProcess('PostElement', '✅ Found direct child of feed containing match:', currentNode);
        return currentNode;
      }
    }
    
    // If we can't find a direct feed child, return the element's post container or itself
    const postContainer = firstMatch.closest('[role="article"]') || 
                         Array.from(firstMatch.parentElement.querySelectorAll('*')).find(isPostContainer);
    
    if (postContainer) {
      logProcess('PostElement', '✅ Found post container for matching element:', postContainer);
      return postContainer;
    }
    
    return firstMatch;
  }
  
  // Last resort for long posts: look for distinctive segments
  if (postText.length > 20) {
    const distinctiveSegment = postText.substring(0, 20);
    const partialMatches = Array.from(document.body.querySelectorAll('*:not([role="feed"])'))
      .filter(el => el.textContent && el.textContent.includes(distinctiveSegment));
    
    if (partialMatches.length > 0) {
      logProcess('PostElement', `📊 Found ${partialMatches.length} elements with partial text matches`);
      const firstPartialMatch = partialMatches[0];
      
      // Try to find the feed child containing this match
      const feedParent = firstPartialMatch.closest('[role="feed"]');
      if (feedParent) {
        let currentNode = firstPartialMatch;
        while (currentNode && currentNode.parentElement !== feedParent) {
          currentNode = currentNode.parentElement;
        }
        
        if (currentNode) {
          logProcess('PostElement', '⚠️ Found feed child with partial match:', currentNode);
          return currentNode;
        }
      }
      
      logProcess('PostElement', '⚠️ Using first partial match as fallback:', firstPartialMatch);
      return firstPartialMatch;
    }
  }

  logProcess('PostElement', '❌ Could not find any post element matching the text');
  return null;
};

export const likePost = async (postElement) => {
  try {
    if (!postElement) {
      logProcess('Like', '❌ Invalid post element provided');
      return false;
    }
    
    logProcess('Like', '%c 👍 Looking for like button...', 'color: #4287f5; font-weight: bold;');
    
    // Try multiple approaches to find the Like button
    let likeButton = null;
    let isAlreadyLiked = false;
    
    // Approach 1: Find by aria-label (most reliable)
    const likeAriaLabels = ['Like', 'אהבתי', 'לייק', 'Me gusta', "J'aime", 'Gefällt mir'];
    const unlikeAriaLabels = ['Remove Like', 'Unlike', 'הסר לייק', 'בטל אהבתי', 'No me gusta'];
    
    // Check for like buttons
    for (const label of likeAriaLabels) {
      const candidates = postElement.querySelectorAll(`[aria-label="${label}"][role="button"]`);
      if (candidates.length > 0) {
        likeButton = candidates[0];
        logProcess('Like', '✅ Found like button via aria-label');
        break;
      }
    }
    
    // Check for unlike buttons (indicates post is already liked)
    for (const label of unlikeAriaLabels) {
      const candidates = postElement.querySelectorAll(`[aria-label="${label}"][role="button"]`);
      if (candidates.length > 0) {
        likeButton = candidates[0];
        isAlreadyLiked = true;
        logProcess('Like', '✅ Found unlike button - post is already liked');
        break;
      }
    }
    
    // Approach 2: Look for visual indicators of already liked status
    if (!isAlreadyLiked) {
      // Check for colored like button text (Facebook uses blue for liked posts)
      const coloredLikeText = postElement.querySelector('[data-ad-rendering-role="like_button"][style*="color"]');
      if (coloredLikeText) {
        const styleColor = coloredLikeText.style.color;
        // If the text color matches Facebook's like color (#0866FF) or contains "reaction-like"
        if (styleColor && (
            styleColor.includes('#0866FF') || 
            styleColor.includes('var(--reaction-like') ||
            coloredLikeText.closest('[style*="color"]')?.style.color.includes('rgb(32, 120, 244)')
          )) {
          isAlreadyLiked = true;
          logProcess('Like', '✅ Post appears to be already liked (colored button)');
          
          // Find the associated button
          likeButton = coloredLikeText.closest('[role="button"]');
        }
      }
      
      // Check for reaction indicators showing the current user has reacted
      const likeIconIndicators = postElement.querySelectorAll('img[src*="like"], svg[class*="like"]');
      if (likeIconIndicators.length > 0) {
        // This is a heuristic - presence of like icons often means post is already liked
        // But we need more validation since these might just be other people's likes
        
        // Check if reaction count is visible with the current user mentioned
        const reactionText = postElement.textContent;
        // If my name appears near reactions, it's likely I've liked it
        const myName = document.querySelector('[aria-label*="profile"]')?.textContent || '';
        if (myName && reactionText.includes(myName)) {
          isAlreadyLiked = true;
          logProcess('Like', '✅ Post appears to be already liked (found user in reactions)');
        }
      }
    }
    
    // Approach 3: Look for Facebook's specific structure with icons
    if (!likeButton) {
      const iconButtons = postElement.querySelectorAll('div[role="button"] i[data-visualcompletion="css-img"]');
      for (const iconElement of iconButtons) {
        const button = iconElement.closest('[role="button"]');
        if (button && button.textContent && 
            /like|אהבתי|לייק|me gusta|j'aime/i.test(button.textContent.toLowerCase())) {
          likeButton = button;
          
          // Check if the button has a color style that indicates it's active
          const buttonStyles = window.getComputedStyle(button);
          const textElement = button.querySelector('span');
          const textStyles = textElement ? window.getComputedStyle(textElement) : null;
          
          if ((buttonStyles.color && buttonStyles.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/)) ||
              (textStyles && textStyles.color && textStyles.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/))) {
            // Check if the color is blueish (Facebook uses blue for active state)
            const colorMatch = (buttonStyles.color || textStyles.color).match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
            if (colorMatch && parseInt(colorMatch[1]) < 50 && parseInt(colorMatch[2]) > 100 && parseInt(colorMatch[3]) > 200) {
              isAlreadyLiked = true;
              logProcess('Like', '✅ Post appears to be already liked (blue colored text)');
            }
          }
          
          logProcess('Like', '✅ Found like button via icon and text');
          break;
        }
      }
    }
    
    // Approach 4: Find in engagement bar (like, comment, share section)
    if (!likeButton) {
      // Look for the interaction bar (typically a horizontal div with buttons)
      const interactionBars = postElement.querySelectorAll('.xabvvm4, .x9f619 .xjyslct, .x78zum5 .x1iyjqo2');
      
      for (const bar of interactionBars) {
        const buttons = bar.querySelectorAll('[role="button"]');
        // First button is typically the Like button
        if (buttons.length > 0) {
          // Verify it's likely the Like button
          if (buttons[0].querySelector('i[data-visualcompletion="css-img"]') || 
              /like|אהבתי|לייק/i.test(buttons[0].textContent?.toLowerCase() || '')) {
            likeButton = buttons[0];
            
            // Check if it looks like an active/liked state
            if (buttons[0].querySelector('[style*="color"]') || 
                buttons[0].getAttribute('style')?.includes('color')) {
              isAlreadyLiked = true;
              logProcess('Like', '✅ Post appears to be already liked (styled button in interaction bar)');
            }
            
            logProcess('Like', '✅ Found like button in interaction bar');
            break;
          }
        }
      }
    }
    
    // If no like button found after all attempts
    if (!likeButton) {
      logProcess('Like', '❌ Could not find like button');
      return false;
    }
    
    // If the post is already liked, return true without clicking
    if (isAlreadyLiked) {
      logProcess('Like', '✅ Post is already liked, no action needed');
      return true;
    }
    
    // Click the like button
    logProcess('Like', '%c Clicking like button...', 'color: green; font-weight: bold;');
    likeButton.click();
    
    // Wait briefly to ensure the action takes effect
    await sleep(0.5);
    
    logProcess('Like', '%c 👍 Post like action completed', 'color: green; font-weight: bold;');
    return true;
    
  } catch (error) {
    logProcess('Like', `❌ Error liking post: ${error.message}`);
    console.error('Error in likePost:', error);
    return false;
  }
}

export const commentOnPost = async (postElement , commentText) => {
  try {
    if (!postElement || !commentText) {
      logProcess('Comment', 'Missing post element or comment text');
      return false;
    }
    
    logProcess('Comment', '%c 🔤 Attempting to comment on post...', 'color: #4287f5; font-weight: bold;');
    
    // Find the comment input section by looking for the contenteditable div with role="textbox"
    let commentInput = postElement.querySelector('div[role="textbox"][contenteditable="true"]');
    
    // If not found directly, try looking for the comment form first
    if (!commentInput) {
      const commentForm = postElement.querySelector('form');
      if (commentForm) {
        commentInput = commentForm.querySelector('div[role="textbox"][contenteditable="true"]');
      }
    }
    
    // If still not found, try to find it by common patterns
    if (!commentInput) {
      // Try to find the comment section first
      const commentSection = postElement.querySelector('div[aria-label*="Leave a comment"], div[aria-label*="תגובה"]');
      if (commentSection) {
        // Click to open the comment field if needed
        commentSection.click();
        await sleep(1);
        
        // Try to find the input field again
        commentInput = postElement.querySelector('div[role="textbox"][contenteditable="true"]');
      }
    }
    
    if (!commentInput) {
      logProcess('Comment', '❌ Could not find comment input field');
      return false;
    }
    
    logProcess('Comment', '✓ Found comment input field, focusing...');
    commentInput.focus();
    await sleep(0.5);
    
    // Clear existing text if any
    commentInput.innerHTML = '';
    await sleep(0.3);
    
    // Insert text using modern DOM manipulation
    logProcess('Comment', '✓ Inserting comment text...');
    
    // Method 1: Try using the Selection API to insert text
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(commentInput);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Insert the text node
      const textNode = document.createTextNode(commentText);
      range.insertNode(textNode);
      range.collapse(false);
      
      // Dispatch input event
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: commentText
      });
      commentInput.dispatchEvent(inputEvent);
    } 
    // Method 2: If Method 1 fails, try setting innerHTML with paragraph
    catch (error) {
      const p = document.createElement('p');
      p.textContent = commentText;
      commentInput.innerHTML = '';
      commentInput.appendChild(p);
      
      // Dispatch input event
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: commentText
      });
      commentInput.dispatchEvent(inputEvent);
    }
    
    await sleep(1);
    
    // Find the comment/post button using multiple approaches
    let commentButton = null;
    
    // Look for common button patterns
    const buttonSelectors = [
      // Direct form submission elements
      'div[aria-label="Comment"]',
      'div[aria-label="תגובה"]', // Hebrew
      'div[aria-label="Post"]',
      'div[aria-label="פרסום"]', // Hebrew
      'div[aria-label="Send"]',
      'div[aria-label="שלח"]', // Hebrew
      // Submit buttons within the form
      'button[type="submit"]',
      // Generic role buttons
      'div[role="button"]',
    ];
    
    // First try a direct approach with the form
    const commentForm = commentInput.closest('form');
    if (commentForm) {
      // Try to find the submit button in the comment form
      for (const selector of buttonSelectors) {
        const possibleButton = commentForm.querySelector(selector);
        if (possibleButton) {
          commentButton = possibleButton;
          break;
        }
      }
      
      // Look for buttons with specific icons or positions
      if (!commentButton) {
        // Look for icon-containing buttons (often used by Facebook)
        const iconButtons = Array.from(commentForm.querySelectorAll('div[role="button"]'))
          .filter(btn => btn.querySelector('i') || btn.querySelector('span'));
        
        if (iconButtons.length) {
          // Usually the last icon button is the submit button
          commentButton = iconButtons[iconButtons.length - 1];
        }
      }
      
      // Look for the last button in the form as a fallback
      if (!commentButton) {
        const allButtons = commentForm.querySelectorAll('div[role="button"], button');
        if (allButtons.length) {
          commentButton = allButtons[allButtons.length - 1];
        }
      }
    }
    
    // If no button found in form, try more general search in the post element
    if (!commentButton) {
      // Look for comment section and buttons near the input field
      const commentSection = commentInput.closest('div[role="article"]') || postElement;
      
      for (const selector of buttonSelectors) {
        const candidates = Array.from(commentSection.querySelectorAll(selector));
        
        // Filter to find buttons that are likely to be submit buttons
        const potentialButtons = candidates.filter(btn => {
          // Look for buttons with comment-related text
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('post') || 
                 text.includes('comment') || 
                 text.includes('send') || 
                 text.includes('שלח') || 
                 text.includes('תגובה') || 
                 text.includes('פרסום');
        });
        
        if (potentialButtons.length) {
          commentButton = potentialButtons[0];
          break;
        }
      }
    }
    
    // If we still can't find the button, try direct form submission or Enter key
    if (!commentButton) {
      if (commentForm) {
        logProcess('Comment', '⚠️ Trying direct form submission...');
        
        // Try to find any submit trigger in the form
        const submitTriggers = commentForm.querySelectorAll('div[role="button"], button');
        if (submitTriggers.length) {
          // Usually the last element is the submit button
          commentButton = submitTriggers[submitTriggers.length - 1];
        } else {
          // Try to submit the form directly
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          commentForm.dispatchEvent(submitEvent);
        }
      } else {
        // Last resort: Use Enter key
        logProcess('Comment', '⚠️ Could not find comment button, trying Enter key...');
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true,
          cancelable: true
        });
        commentInput.dispatchEvent(enterEvent);
      }
    } else {
      logProcess('Comment', '✓ Found comment button, clicking...');
      commentButton.click();
    }
    
    await sleep(2);
    logProcess('Comment', '✅ Comment submitted successfully');
    return true;
    
  } catch (error) {
    logProcess('Comment', `❌ Error commenting on post: ${error.message}`);
    console.error('Error in commentOnPost:', error);
    return false;
  }
};

export const getPostUrl = async (postElement) => {
    // Start without logging the entire function, just a message
    logProcess('PostUrl', '🔍 Starting post URL search...');
    
    if (!postElement || !postElement.nodeType) {
        logProcess('PostUrl', '❌ Invalid postElement provided');
        return false;
    }

    // Find the share button within the post element
    logProcess('PostUrl', '🔍 Looking for share button...');
    
    // Method 1: Look for elements with appropriate aria labels
    const shareLabels = ['Share', 'Send this to friends or post it on your profile', 'שיתוף', 'שתף'];
    let shareButton = null;
    
    for (const label of shareLabels) {
        const buttons = postElement.querySelectorAll(`[aria-label*="${label}"][role="button"]`);
        if (buttons.length > 0) {
            shareButton = buttons[0];
            logProcess('PostUrl', '✅ Found share button with aria-label: ' + label);
            break;
        }
    }
    
    // Method 2: Look for share button by its content structure
    if (!shareButton) {
        logProcess('PostUrl', '🔍 Looking for share button by content structure...');
        
        // Look for buttons that contain both text "Share" and an icon
        const potentialShareButtons = Array.from(postElement.querySelectorAll('[role="button"]'))
            .filter(button => {
                const hasShareText = button.textContent && 
                    (button.textContent.toLowerCase().includes('share') || 
                     button.textContent.toLowerCase().includes('שיתוף'));
                const hasIcon = button.querySelector('i, svg');
                
                return hasShareText && hasIcon;
            });
        
        if (potentialShareButtons.length > 0) {
            shareButton = potentialShareButtons[0];
            logProcess('PostUrl', '✅ Found share button via content structure');
        }
    }
    
    // Method 3: Look in the engagement bar area
    if (!shareButton) {
        // Look for areas that typically contain share buttons
        const engagementAreas = Array.from(postElement.querySelectorAll('div'))
            .filter(div => {
                const buttonChildren = div.querySelectorAll('[role="button"]');
                return buttonChildren.length >= 3 && buttonChildren.length <= 5;
            });
        
        for (const area of engagementAreas) {
            // Share is typically the last or second-to-last button
            const buttons = area.querySelectorAll('[role="button"]');
            const candidateButtons = [buttons[buttons.length - 1], buttons[buttons.length - 2]].filter(Boolean);
            
            for (const button of candidateButtons) {
                if (button && 
                        (button.textContent.toLowerCase().includes('share') || 
                         button.textContent.toLowerCase().includes('שיתוף'))) {
                    shareButton = button;
                    logProcess('PostUrl', '✅ Found share button in engagement area');
                    break;
                }
            }
            
            if (shareButton) break;
        }
    }
    
    // If no share button found, return false
    if (!shareButton) {
        logProcess('PostUrl', '❌ Could not find share button');
        return false;
    }
    
    // Click the share button to open the dialog
    try {
        logProcess('PostUrl', '👆 Clicking share button...');
        shareButton.click();
        
        // Wait for the dialog to appear
        await sleep(1);
        
        // Look for "Copy link" option in the dialog
        logProcess('PostUrl', '🔍 Looking for copy link option...');
        
        // Wait a bit more to ensure dialog is fully loaded
        await sleep(0.5);
        
        // Try various ways to find the copy link button
        const copyLinkLabels = ['Copy link', 'העתק קישור', 'העתקת קישור'];
        let copyLinkButton = null;
        
        // Method 1: Look for the exact structure provided in the example
        logProcess('PostUrl', '🔍 Looking for copy link button with specific structure...');
        const listItems = document.querySelectorAll('div[role="listitem"]');
        for (const item of listItems) {
            if (item.textContent && 
                (item.textContent.includes('Copy link') || 
                 item.textContent.includes('העתק קישור'))) {
                // Find the button inside
                const buttonElement = item.querySelector('div[role="button"]');
                if (buttonElement) {
                    copyLinkButton = buttonElement;
                    await sleep(0.5);
                    logProcess('PostUrl', '✅ Found copy link button with exact matching structure');
                    break;
                }
            }
        }
        
        // Method 2: Look by aria-label
        if (!copyLinkButton) {
            for (const label of copyLinkLabels) {
                const buttons = document.querySelectorAll(`[aria-label*="${label}"]`);
                if (buttons.length > 0) {
                    copyLinkButton = buttons[0];
                    logProcess('PostUrl', `✅ Found copy link button with aria-label: ${label}`);
                    break;
                }
            }
        }
        
        // Method 3: Look by text content in the share dialog
        if (!copyLinkButton) {
            // Look specifically at the bottom of the dialog where Copy link usually appears
            const shareDialog = document.querySelector('div[role="dialog"]');
            if (shareDialog) {
                const allMenuItems = shareDialog.querySelectorAll('[role="menuitem"], [role="button"], [role="listitem"]');
                
                for (const item of allMenuItems) {
                    if (item.textContent && 
                            (item.textContent.includes('Copy link') || 
                             item.textContent.includes('העתק קישור'))) {
                        // Get the actual button within this item
                        copyLinkButton = item.querySelector('[role="button"]') || item;
                        logProcess('PostUrl', '✅ Found copy link button via text content in dialog');
                        await sleep(0.5);
                        break;
                    }
                }
                
                // If still not found, look for any element with copy link icon
                if (!copyLinkButton) {
                    // Look for the specific Copy link icon
                    const copyLinkIcons = shareDialog.querySelectorAll('i[data-visualcompletion="css-img"]');
                    for (const icon of copyLinkIcons) {
                        const parentButton = icon.closest('[role="button"]');
                        if (parentButton) {
                            copyLinkButton = parentButton;
                            logProcess('PostUrl', '✅ Found copy link button via icon in dialog');
                            await sleep(0.5);
                            break;
                        }
                    }
                }
            }
        }
        
        if (!copyLinkButton) {
            // Close dialog if opened
            const closeButton = document.querySelector(
                'div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]'
            );
            if (closeButton) closeButton.click();
            
            logProcess('PostUrl', '❌ Could not find copy link button in dialog');
            return false;
        }

        // Identify the clickable element in the copy link button
        logProcess('PostUrl', '🔍 Examining copy link button structure...');
        let clickableElement = copyLinkButton;

        // Highlight the clickable element
        if (clickableElement && clickableElement.style) {
          clickableElement.style.backgroundColor = 'lightgreen';
          logProcess('PostUrl', '🎨 Highlighted clickable element');
          await sleep(4);
          logProcess('PostUrl', '👆 Clicking copy link button...', clickableElement);   
        //   clickableElement.click();
        let extractedUrl = null;
        const shareDialog = document.querySelector('div[role="dialog"]'); // Or a more specific selector for the share UI

        if (shareDialog) {
            // Try to find an input field that might contain the URL
            const urlInput = shareDialog.querySelector('input[type="text"], input[readonly]');
            if (urlInput && urlInput.value && urlInput.value.includes('facebook.com')) {
                extractedUrl = urlInput.value;
                logProcess('PostUrl', `✅ Extracted URL from input field: ${extractedUrl}`);
            }
            // Add more specific selectors here if you identify other elements
            // that display the URL after "Copy Link" is clicked.
        }

        if (extractedUrl) {
            // Close dialog and return
            const closeButton = document.querySelector('div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]');
            if (closeButton) closeButton.click();
            return extractedUrl;
        }

          await sleep(0.3);
        }

        // Make sure we're focusing the document before clicking
        logProcess('PostUrl', '🔍 Preparing document for clipboard operation...');
        await sleep(0.2);
        
    
        // Wait for clipboard operation to complete
        logProcess('PostUrl', '⏳ Waiting for clipboard operation to complete...');
        await sleep(1);
        
        try {            
            // Attempt to read from clipboard
            const postUrl = await navigator.clipboard.readText();
            logProcess('PostUrl', '📋 Attempting to read from clipboard...', postUrl);
            
            // Only log actual valid URLs, not code
            if (postUrl && typeof postUrl === 'string' && postUrl.length < 1000) {
                // Verify it's a URL format before logging
                if (postUrl.startsWith('http') && postUrl.includes('facebook.com')) {
                    logProcess('PostUrl', `📋 URL: ${postUrl}`);
                    
                    // Close share dialog
                    const closeButton = document.querySelector(
                        'div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]'
                    );
                    if (closeButton) {
                        closeButton.click();
                    }
                    
                    return postUrl;
                } else {
                    logProcess('PostUrl', '⚠️ Clipboard content doesn\'t appear to be a Facebook URL');
                }
            } else {
                logProcess('PostUrl', '⚠️ Invalid clipboard content');
            }
            
            // Fallback: Try to find the URL in a different way
            const shareDialog = document.querySelector('div[role="dialog"]');
            if (shareDialog) {
                logProcess('PostUrl', '🔍 Looking for URL in dialog elements...');
                // Look for elements with href attributes that might contain the post URL
                const linkElements = shareDialog.querySelectorAll('a[href*="facebook.com"]');
                
                logProcess('PostUrl', `🔍 Found ${linkElements.length} potential link elements`);
                
                for (const linkEl of linkElements) {
                    const href = linkEl.getAttribute('href');
                    logProcess('PostUrl', `🔗 Checking link: ${href}`);
                    if (href && href.includes('/share/')) {
                        logProcess('PostUrl', `✅ Found URL: ${href}`);
                        
                        // Close dialog
                        const closeButton = document.querySelector(
                            'div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]'
                        );
                        if (closeButton) closeButton.click();
                        
                        return href;
                    }
                }
                
                logProcess('PostUrl', '❌ No valid Facebook URLs found in dialog elements');
            }
            
            // Look for any data-store attributes that might contain the URL
            logProcess('PostUrl', '🔍 Checking for data attributes containing URL...');
            const dataElements = document.querySelectorAll('[data-store]');
            
            for (const el of dataElements) {
                try {
                    const dataStore = JSON.parse(el.getAttribute('data-store'));
                    if (dataStore && dataStore.share_link) {
                        logProcess('PostUrl', `✅ Found URL in data-store: ${dataStore.share_link}`);
                        
                        // Close dialog
                        const closeButton = document.querySelector(
                            'div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]'
                        );
                        if (closeButton) closeButton.click();
                        
                        return dataStore.share_link;
                    }
                } catch (e) {
                    // Silent error
                }
            }
            
            // Close dialog if opened
            const closeButton = document.querySelector(
                'div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]'
            );
            if (closeButton) {
                closeButton.click();
            }
            
            if (postUrl && postUrl.startsWith('http')) {
                return postUrl;
            }
            
            logProcess('PostUrl', '❌ Could not find valid URL');
            return false;
        } catch (clipboardError) {
            logProcess('PostUrl', '⚠️ Clipboard access error', clipboardError);
            
            // Fallback: Look for toast notification that appears when link is copied
            logProcess('PostUrl', '🔍 Looking for "Link copied" toast notification...');
            const toasts = document.querySelectorAll('.x9f619, .xnz67gz, .x78zum5');
            
            for (const toast of toasts) {
                if (toast.textContent && (
                    toast.textContent.includes('Link copied') ||
                    toast.textContent.includes('הקישור הועתק')
                )) {
                    logProcess('PostUrl', '✅ "Link copied" toast notification detected');
                    
                    // Close dialog
                    const closeButton = document.querySelector(
                        'div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]'
                    );
                    if (closeButton) closeButton.click();
                    
                    // Check if we can at least get the current page URL
                    const currentUrl = window.location.href;
                    logProcess('PostUrl', `📄 Current page URL: ${currentUrl}`);
                    
                    // Return true to indicate success but couldn't get the exact URL
                    return true;
                }
            }
            
            // Close dialog if opened
            const closeButton = document.querySelector(
                'div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]'
            );
            if (closeButton) closeButton.click();
            
            logProcess('PostUrl', '❌ Could not access clipboard and no fallback found');
            return false;
        }
    } catch (error) {
        // Close dialog if opened
        const closeButton = document.querySelector(
            'div[aria-label="Close"], div[aria-label="סגירה"], div[aria-label="סגור"]'
        );
        if (closeButton) closeButton.click();
        
        logProcess('PostUrl', '❌ Error getting post URL');
        return false;
    }
};
