import { authManager, flag } from './authManager';
import { postManager } from './postManager';
import {  getManagerApprove,  waitForElement, production, sleep, setFulfilled, createBanner, config, simulateTyping, getNumberOfItemsFilter, collectGroups, serverIP } from './utils';


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
  const terms = `
תאריך עדכון אחרון: 1 בפברואר 2025

ברוכים הבאים לאתר/לאפליקציה שלנו (להלן: "האתר"). השימוש באתר כפוף לתנאים ולהגבלות המפורטים להלן. הנך מתבקש/ת לקרוא אותם בקפידה. על־ידי גישה לאתר ו/או שימוש בו, הנך מסכים/ה לתנאים אלה במלואם. אם אינך מסכים/ה לאחד או יותר מהתנאים המפורטים, עליך להימנע משימוש באתר.

1. הגדרות
1.1 "אנחנו"/"החברה" – בעלי האתר או מפעיליו.
1.2 "האתר" – האתר, האפליקציה, השירותים או הפלטפורמה המקוונת המוצעת על־ידינו, לרבות כל תוכן, שירות או פונקציונליות נלווים.
1.3 "משתמש/ת" – כל אדם או גורם אחר אשר ניגש/ת לאתר או עושה בו שימוש, לרבות ללא הגבלה, גלישה, העלאת תוכן, הורדת מידע וכדומה.

2. כשירות לשימוש
2.1 השימוש באתר מותר לבגירים (מעל גיל 18) או לקטינים מעל גיל מסוים באישור הורים/אפוטרופוסים.
2.2 החברה שומרת לעצמה את הזכות לבקש מסמכים מזהים או פרטים אישיים לצורך אימות זהות המשתמש/ת, וכן לסרב להעניק גישה או שירות למשתמש/ת אשר לא עומד/ת בתנאי הכשירות או פועל/ת בניגוד לתנאי שימוש אלה.

3. שימוש באתר
3.1 שימוש הולם: המשתמש/ת מתחייב/ת להשתמש באתר אך ורק למטרות חוקיות ובהתאם לכל דין. נאסר על המשתמש/ת לעשות שימוש שיש בו משום פגיעה, הפרעה, הגבלה או מניעת שימוש מצד משתמשים אחרים.
3.2 רישום וחשבונות: ייתכן כי חלק מהשירותים דורשים פתיחת חשבון משתמש ורישום. על המשתמש/ת לספק פרטים נכונים, עדכניים ומלאים. המשתמש/ת אחראי/ת על שמירת סודיות פרטי ההתחברות, ועל כל פעולה שתתבצע תחת החשבון שלו/ה.
3.3 תוכן משתמש/ת: המשתמש/ת מצהיר/ה שכל מידע, טקסט, תמונות, קבצים או כל תוכן אחר שהעלה לאתר, הינו בבעלותו/ה או שיש לו/לה את הזכות החוקית להשתמש בו. המשתמש/ת מעניק/ה לנו רישיון לא בלעדי להשתמש בתוכן לצורכי הפעלת האתר ו/או הצגתו למשתמשים אחרים.

4. פרטיות
4.1 מדיניות פרטיות: אנו אוספים מידע אישי בהתאם למדיניות הפרטיות שלנו, אשר מפורסמת באתר ומהווה חלק בלתי נפרד מתנאי שימוש אלה.
4.2 עוגיות (Cookies): האתר עשוי להשתמש בקבצי עוגיות או בטכנולוגיות דומות על מנת לשפר את חוויית המשתמש/ת ולנתח שימוש באתר.

5. קניין רוחני
5.1 זכויות יוצרים: כל הזכויות בתכנים הכלולים באתר (טקסט, גרפיקה, לוגו, אייקונים, תמונות, תוכנה, קוד וכדומה) הינן בבעלותנו או בבעלות צדדים שלישיים אשר התירו לנו להשתמש בהם. חל איסור להעתיק, להפיץ, לשדר, לשכפל, לפרסם או להשתמש בכל אופן אחר בתכנים ללא אישור מראש ובכתב מאיתנו.
5.2 סימני מסחר: כל סימני המסחר, הסימנים המסחריים והשמות המסחריים המופיעים באתר הם בבעלותנו או בבעלות בעליהם החוקיים. אין לראות בתנאי שימוש אלה היתר לשימוש בסימני מסחר ללא אישור כתוב.

6. אחריות והגבלת אחריות
6.1 אחריות תוכן: האתר, תכניו והשירותים שבו מוצעים כמות שהם ("As Is") וללא אחריות מכל סוג שהוא, מפורשת או משתמעת.
6.2 שירות רציף: אנו משתדלים לשמור על זמינות האתר ושירותיו, אך איננו מתחייבים לכך שהשירות יהיה רציף, נטול טעויות או מוגן מפני גישה בלתי מורשית.
6.3 שיפוי: המשתמש/ת מסכים/ה לשפות ולפצות את החברה בגין כל נזק, תביעה, הפסד או הוצאה (לרבות שכר טרחת עו"ד) הנובעים מהפרת תנאים אלה על־ידיו/ה.

7. שינויים והפסקת שירות
7.1 שינויים באתר: אנו שומרים לעצמנו את הזכות לשנות מעת לעת את מבנה האתר, מראהו ועיצובו, את היקף וזמינות השירותים בו וכל היבט אחר הכרוך בהם – והכול ללא צורך להודיע על כך מראש.
7.2 הפסקת שירות: באפשרותנו להפסיק את פעילות האתר, כולו או חלקו, באופן זמני או לצמיתות, לפי שיקול דעתנו הבלעדי וללא הודעה מוקדמת.

8. סיום התקשרות
8.1 באפשרותנו, לפי שיקול דעתנו, למנוע ממשתמש/ת גישה לאתר, לבטל חשבונו/ה או לחסום את השתתפותו/ה באתר אם הפר/ה את תנאי השימוש הללו או אם קיים חשד סביר לפריצה או שימוש לרעה.
8.2 המשתמש/ת רשאי/ת להפסיק שימוש באתר בכל עת, ולסגור את החשבון (אם קיים) באמצעות הכלים המוצעים באתר או דרך פנייה אל שירות הלקוחות שלנו.

9. החוק החל וסמכות שיפוט
9.1 על תנאים אלה ועל כל שימוש באתר יחולו דיני מדינת ישראל (או כל מדינה אחרת, בהתאם לצורך — יש להתאים לפי המיקום המשפטי הרלוונטי).
9.2 כל סכסוך משפטי יתברר בבתי המשפט המוסמכים במחוז שבו רשומה החברה או בכל מקום מוסכם אחר, לפי שיקול דעתנו.
  `;

  const termsCheckbox = document.createElement('input');
  termsCheckbox.type = 'checkbox';
  termsCheckbox.id = 'terms-checkbox';
  termsCheckbox.style.marginRight = '10px';

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

  const showTermsDialog = () => {
    const overlay = document.createElement('div');
   
    const dialog = document.createElement('div');
    const overlayStyles = {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: '9999'
    };
    Object.assign(overlay.style, overlayStyles);

    const dialogStyles = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      padding: '30px 50px',
      borderRadius: '8px',
      maxWidth: '88vw',
      minWidth: '300px',
      maxHeight: '88vh',
      overflowY: 'auto',
      zIndex: '10000'
    };
    Object.assign(dialog.style, dialogStyles);
    overlay.onclick = (e) => {
      e.stopPropagation();
      termsCheckbox.checked = false;
      document.getElementById('approve-error-message').style.visibility = 'visible';
      document.body.removeChild(overlay);
      document.body.removeChild(dialog);
    };

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
      termsCheckbox.checked = false;
      document.getElementById('approve-error-message').style.visibility = 'visible';
      document.body.removeChild(overlay);
      document.body.removeChild(dialog);
    };

    const heading = document.createElement('h2');
    heading.textContent = 'תנאים והגבלות (Terms and Conditions)';
    heading.style.textAlign = 'center'; 
    heading.style.fontSize = '1.2rem';
    heading.style.margin = '10px auto';
    heading.style.direction = 'ltr';
    
    const text = document.createElement('pre');
    text.textContent = terms;
    text.style.fontSize = '0.8rem';
    text.style.textAlign = 'start';
    text.style.lineHeight = '1.3';
    text.style.margin = '10px auto';
    text.style.maxWidth = '90%';
    text.style.textWrap = 'wrap';
    text.style.wordBreak = 'break-word';
    text.style.direction = 'rtl';

    const approveBtn = document.createElement('button');
    approveBtn.textContent = 'אישור';
    approveBtn.style.marginTop = '10px';
    Object.assign(approveBtn.style, loginButtonStyles);
    approveBtn.onclick = () => {
      termsCheckbox.checked = true;
      document.getElementById('approve-error-message').style.visibility = 'hidden';
      document.body.removeChild(overlay);
      document.body.removeChild(dialog);
    };

    dialog.appendChild(closeButton);
    dialog.appendChild(heading);
    dialog.appendChild(text);
    dialog.appendChild(approveBtn);
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
  };

  // termsCheckbox.onclick = (e) => {
  //   // Prevent default checking
  //   if (!termsCheckbox.checked) {
  //     e.preventDefault();
  //     showTermsDialog();
  //   }
  // };

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
  termsLabel.style.fontSize = '0.8rem';
  termsLabel.textContent = 'I have read and agree to the ';

  // Create clickable text
  const termsLink = document.createElement('span');
  termsLink.textContent = 'Terms and Conditions';
  termsLink.style.color = 'blue';
  termsLink.style.textDecoration = 'underline';
  termsLink.style.cursor = 'pointer';
  termsLink.onclick = showTermsDialog;

  termsLabel.appendChild(termsLink);

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
  poweredByText.innerHTML = `Powered by <a href="https://Taskomatic.net" target="_blank" style="color: blue; text-decoration: underline;">Taskomatic.net</a> (V${chrome.runtime.getManifest().version})`;
  dialog.appendChild(poweredByText);


  dialog.id = 'login-dialog';
  overlay.id = 'login-overlay';
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);
};



export const postIntoInput = async (post) => {
  // המתנה קצרה להרגעה
  await sleep(1);

  // 1) איתור כפתור "Write something..." או בעברית "כתוב משהו..."
  //    (שים לב אם יש תרגומים אחרים)
  const writeButton = await waitForElement("div[role='button'][tabindex='0'] > div > span", 15000);
  if (!writeButton) {
    console.error('לא נמצא כפתור ליצירת פוסט (Write something...)');
    await sleep(3);
    return false;
  }

  // בדיקה גמישה: באנגלית / בעברית
  const textBtn = writeButton.textContent.trim().toLowerCase();
  if (
    !textBtn.includes('write something') &&
    !textBtn.includes('כתוב משהו')
  ) {
    console.warn('הכפתור קיים, אך הטקסט שלו אינו "Write something..." או "כתוב משהו..." – יתכן עיצוב אחר.');
  }

  // 2) לוחצים על הכפתור
  writeButton.click();
  await sleep(3);


  const postDialogSelectors = [
    "div[role='dialog'][aria-label='Create post']",
    "div[role='dialog'][aria-label='Create Post']",
    "div[role='dialog'][aria-label='יצירת פוסט']", // Hebrew - Create post
    "div[role='dialog'][aria-label='צור פוסט']", // Hebrew - Create post
    "div[role='dialog'][aria-label='צרי פוסט']", // Hebrew - Create post
    "div[role='dialog'][aria-label='Create a post']",
    "div[role='dialog'][aria-label='Create a Post']",
    "div[role='dialog'][aria-label='New post']",
    "div[role='dialog'][aria-label='New Post']",
    "div[role='dialog'][aria-label='פוסט חדש']", // Hebrew - New post
    "div[role='dialog'][aria-label='כתיבת פוסט']", // Hebrew - Write post
    "div[role='dialog'][aria-label='פרסום פוסט']", // Hebrew - Publish post
    "div[role='dialog'][aria-label='העלאת פוסט']", // Hebrew - Upload post
    "div[role='dialog']", // Generic fallback as last resort
  ];

  let postDialogChild = null;
  for (const selector of postDialogSelectors) {
    postDialogChild = await waitForElement(selector, 2*1e3);
    if (postDialogChild) break;
  }

  if (!postDialogChild) {
    console.error('לא נמצא דיאלוג Create post לפי הסלקטורים הקיימים');
    await sleep(2); 
    return false;
  }
  // לפעמים postDialogChild הוא ממש ה-div, לפעמים צריך parentElement.parentElement
  const postDialog = postDialogChild.parentElement?.parentElement || postDialogChild.parentElement;
  if (!postDialog) {
    console.error('postDialog לא אותר (אולי מבנה DOM שונה)');
    await sleep(3);
    return false;
  }

  await sleep(2);
  console.log('Post dialog:', postDialog);

  // 4) איתור אלמנט הקלט (contenteditable)
  //    אם צריך, הוסף/עדכן סלקטורים נוספים
  const inputSelectors = [
    "div[role='textbox'][contenteditable='true'][tabindex='0'][data-lexical-editor='true']",
    "div[role='textbox'][contenteditable='true'][tabindex='0'][aria-label='Create a public post…'][data-lexical-editor='true']",
    "div[role='textbox'][contenteditable='true'][tabindex='0'][aria-label='יצירת פוסט ציבורי...'][data-lexical-editor='true']",
    "div[role='textbox'][contenteditable='true'][tabindex='0'][aria-label='יצירת פוסט ציבורי…'][data-lexical-editor='true']",
    "div[role='textbox'][contenteditable='true'][tabindex='0']"
  ];

  let postInput = null;
  for (const sel of inputSelectors) {
    const candidate = postDialog.querySelector(sel);
    if (candidate) {
      postInput = candidate;
      break;
    }
  }
  if (!postInput) {
    console.error('לא נמצא אלמנט contenteditable להוספת טקסט');
    await sleep(2);
    return false;
  }

  console.log('Post input:', postInput);
  postInput.focus();
  const postText = post.post?.trim() || '';
  console.log('מנסה להזין טקסט:', postText);
  await sleep(1);

  // 5) נתחיל option 1..5 
  //    (ננקה תחילה focus, אם צריך)
  let option = authManager?.authProvider?.option || 1; 
  // אתה יכול גם לקבוע option=1 בכל קריאה חדשה

  // מכניס השהייה קצרה בין כל ניסיון
  for (let tries = option; tries <= 6; tries++) {
    console.log(`נסה option=${tries} להזנת הטקסט`);
    const success = await attemptTextInsertion(postInput, postText, tries);
    if (success) {
      console.log(`option=${tries} הצליח!`);
      break;
    } else {
      console.warn(`option=${tries} לא הצליח, נמשיך ל-option=${tries+1}`);
      await sleep(1);
    }
    if (tries === 6) {
      console.error('כל האפשרויות נכשלו בהוספת הטקסט');
      await sleep(2);
      return false;
    }
  }

  await sleep(2);
  const posted = await clickPostButton(postDialog);
  if (!posted) {
    console.error('לא נמצא כפתור Post או לא הצליח ללחוץ');
    return false;
  }
  return true;
};


/**
 * attemptTextInsertion – פונקציה שעושה את שלבי option=1..5 + option=6 (Composition)
 * מחזירה true/false האם הצליחה
 */
async function attemptTextInsertion(postInput, postText, option) {
  try {
    postInput.focus();
    await sleep(0.5);

    switch (option) {
      case 1: {
        // Range insertion
        try {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(postInput);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          const textNode = document.createTextNode(postText);
          range.insertNode(textNode);
          range.collapse(false);

          // שליחת event עדכון
          const evt = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            data: postText,
          });
          postInput.dispatchEvent(evt);
        } catch (err) {
          console.error('[option1] Range insertion failed:', err);
          return false;
        }
        break;
      }
      case 2: {
        // document.execCommand('insertText')
        postInput.focus();
        let success = document.execCommand('insertText', false, postText);
        if (!success) {
          console.warn('[option2] execCommand("insertText") החזיר false, ננסה שוב');
          success = postInput.execCommand?.('insertText', false, postText);
        }
        if (!success) {
          console.error('[option2] execCommand לא עבד');
          return false;
        }
        // Dispatch input event
        const evt = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: postText,
        });
        postInput.dispatchEvent(evt);
        break;
      }
      case 3: {
        // החלפת innerHTML + יצירת <p> בתוכו
        postInput.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = postText;
        postInput.appendChild(p);

        // אירוע
        const evt = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: postText
        });
        postInput.dispatchEvent(evt);
        break;
      }
      case 4: {
        // סימולציית typing פשוטה
        postInput.innerHTML = '<p></p>';
        const paragraph = postInput.querySelector('p');
        if (!paragraph) {
          console.error('[option4] לא נמצא p');
          return false;
        }
        paragraph.innerHTML = '';
        await simulateTyping(postInput, postText); 
        // יש לך פונקציה simulateTyping – היא שולחת keydown/input פר תו
        break;
      }
      case 5: {
        // הוספת data-lexical-text עם dispatch של כמה events
        postInput.innerHTML = `
          <div data-lexical-root="true" style="max-width: 100%; min-height: 100px;">
            <div>
              <p dir="auto">
                <span data-lexical-text="true" data-lexical-node="true"
                      class="xdj266r x11i5rnm xat24cr x1mh8g0r"
                      dir="auto" style="white-space: pre-wrap;"
                      data-text="true">${postText}</span>
              </p>
            </div>
          </div>
        `;
        const events = [
          new InputEvent('input', { bubbles: true, cancelable: true, data: postText }),
          new Event('change', { bubbles: true }),
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        ];
        for (const e of events) {
          postInput.dispatchEvent(e);
        }
        break;
      }
      case 6: {
        // דימוי Composition Events מלא
        postInput.innerHTML = '<p></p>';
        const paragraph = postInput.querySelector('p');
        paragraph?.focus();

        // compositionstart
        const compStart = new CompositionEvent('compositionstart', {
          bubbles: true,
          cancelable: true,
          data: ''
        });
        postInput.dispatchEvent(compStart);

        // נכניס את הטקסט ידנית
        for (const char of postText) {
          paragraph.textContent += char;
          const inputEvt = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            data: char,
            inputType: 'insertText'
          });
          postInput.dispatchEvent(inputEvt);
          await sleep(0.02);
        }

        // compositionend
        const compEnd = new CompositionEvent('compositionend', {
          bubbles: true,
          cancelable: true,
          data: postText
        });
        postInput.dispatchEvent(compEnd);
        break;
      }
      default:
        console.error('Option not recognized:', option);
        return false;
    }

    // בדיקה סופית אם טקסט מופיע
    await sleep(0.5);
    const finalCheck = postInput.textContent.trim();
    if (!finalCheck.includes(postText)) {
      console.warn(`[option${option}] textCheck נכשל. finalCheck="${finalCheck}"`);
      return false;
    }
    // הצלחה
    return true;

  } catch (err) {
    console.error(`[option${option}] שגיאה כללית:`, err);
    return false;
  }
}


/**
 * clickPostButton – מוצא את כפתור "Post" ולוחץ
 */
async function clickPostButton(postDialog) {
  // סלקטורים אפשריים
  const postButtonSelectors = [
    "div[aria-label='Post'][role='button']",
    "div[aria-label='פרסום'][role='button']", // Hebrew Post button
    "div[aria-label='פרסם'][role='button']", // Hebrew Post button
    "div[aria-label='פרסמי'][role='button']", // Hebrew Post button
    "div[role='button']:has(span:contains('Post'))",
    "div[role='button']:has(span:contains('פרסום'))", // Hebrew Post text
    "div[role='button']:has(span:contains('פרסם'))", // Hebrew Post text
    "div[role='button']:has(span:contains('פרסמי'))", // Hebrew Post text
    "div[role='button'] span:contains('Post')",
    "div[role='button'] span:contains('פרסום')", // Hebrew Post span
    "div[role='button'] span:contains('פרסם')", // Hebrew Post span
    "div[role='button'] span:contains('פרסמי')", // Hebrew Post span
    "div.x1i10hfl[role='button']",
    "div[tabindex='0'][role='button'] span.x1lliihq:contains('Post')",
    "div[tabindex='0'][role='button'] span.x1lliihq:contains('פרסום')", // Hebrew Post span with class
    "div[tabindex='0'][role='button'] span.x1lliihq:contains('פרסם')", // Hebrew Post span with class
    "div[tabindex='0'][role='button'] span.x1lliihq:contains('פרסמי')" // Hebrew Post span with class
  ];

  let finalPostButton = null;
  for (const sel of postButtonSelectors) {
    finalPostButton = postDialog.querySelector(sel);
    if (finalPostButton) break;
  }

  if (!finalPostButton) {
    console.error('לא נמצא כפתור Post לפי הסלקטורים');
    return false;
  }

  // בדיקה אם המשתמש מחובר
  if (!authManager.credentials || !authManager.isLoggedIn()) {
    console.error('User not logged in');
    return false;
  }

  console.log('%c +++ Clicking Post Button +++', 'color: pink; font-weight: bold; font-size: 16px');
  if (authManager.authProvider?.click && (production !== false)) {
    finalPostButton.click();
  }
  else {
    console.log('Click event is blocked');
  }
  await sleep(10);

  return true;
}

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
      if (state.fulfilled.includes(group.id) && (post.amount === getNumberOfItemsFilter(group.id, state.fulfilled))) {
          console.log(`Already posted in group ${group.id}`);
          return {status: true, message: 'Already posted', posted: true};
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
  console.log('Post to Facebook:', post, postManager.state);

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
          state.nextGroup = post.groups[i]?.groupName;
          state.totalFullfilled = `${state.fulfilled.length} / ${post.groups.length}`;
          state.groupIndex = i;
          postManager.saveState();
          console.log('Posting in group:', post.groups[i].groupName); 

          const isPosted = await postToGroup(post);
          if (!isPosted.status) {
              state.errors.push({
                  postId: post.id,
                  message: isPosted.message,
                  groupId: post.groups[i].id,
                  time: new Date().toISOString()
              });
              state.groupIndex = i + 1;
              state.nextGroup = post.groups[i + 1]?.groupName;
              state.totalFullfilled = `${state.fulfilled.length} / ${post.groups.length}`;
              postManager.saveState();
              continue;
          }
          else {
            // Update success state
            if (!isPosted.posted) {
              const response = await setFulfilled(post.id, post.groups[i]?.id);
              if (response){
                state.fulfilled.push(post.groups[i].id);
              }
            }
            
            state.lastSuccessfulGroup = post.groups[i] ?  post.groups[i].groupName : null;
            state.nextGroup = post.groups[i+1] ?  post.groups[i + 1]?.groupName : null;
            state.totalFullfilled = `${state.fulfilled.length} / ${post.groups.length}`;
            state.groupIndex = i + 1;
            state.lastPostTime = new Date().toISOString();
            postManager.saveState();
            if (!(i === post.groups.length - 1)) {
              const postDelay = authManager.authProvider?.postDelay || (Math.random() * 3.5 + 1.5);
              state.postDelay = postDelay;
              await sleep(postDelay * 60);
            }
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
      if (window.location.href.includes('https://www.facebook.com/groups/joins/')) {
        console.log('%c +++ Collecting groups data +++ ', 'font-weight: bold; color: #4CAF50; font-size: 16px');
        const groups = await collectGroups();
        console.log('Collected groups:', groups);
        try {
          const setGroupsToServer = await fetch(`${serverIP}/setgroups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({...authManager.credentials, data: groups})
                });
          if (setGroupsToServer.ok) {
            console.log('Groups data sent to server');
          }
        } catch (error) {
          console.error('Error sending groups data to server:', error);
          window.location.href = 'https://www.facebook.com/';
        }
        await sleep(8);
        window.location.href = 'https://www.facebook.com/';
      }
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






