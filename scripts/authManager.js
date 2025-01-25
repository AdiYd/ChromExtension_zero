import { config, getAuth, serverIP, setAuth } from "./utils";

const AUTH_KEY = 'FB_AUTH_STATE';
const flag = {
    main: process.env.FIREBASE_MESSAGING_SENDER_ID === '294202424004'
  }

export class AuthManager {
    static instance = null;
    
    constructor() {
        if (AuthManager.instance) return AuthManager.instance;
        if (!flag.main) return ;
        AuthManager.instance = this;
        
        this.credentials = this.loadCredentials();
        AUTH_KEY = AUTH_KEY;
        this.authProvider = null;
        getAuth().then((auth) => {
            if (auth) {
                this.authProvider = auth;
            }
        }).catch((error) => {
            this.authProvider = null;
        });
    }

    loadCredentials() {
        const credentials = sessionStorage.getItem(AUTH_KEY);
        return credentials ? JSON.parse(atob(credentials)) : null;
    }

    saveCredentials(username, password) {
        this.credentials = { username, password };
        sessionStorage.setItem(AUTH_KEY, btoa(JSON.stringify(this.credentials)));
    }

    clearCredentials() {
        this.credentials = null;
        sessionStorage.removeItem(AUTH_KEY);
    }

    async login(username, password) {
        try {
            const response = await fetch(`${serverIP}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok && this.authProvider && this.authProvider?.verify === 80) {
                this.saveCredentials(username, password);
                const signed = await setAuth(username, password) || false;
                return { ok: signed, message: signed ? 'Login successful' : '' };
            }
            const message = await response.json();
            return { ok: false, message: message.message || 'שם משתמש או סיסמה שגויים' };
        } catch (error) {
            return { ok: false, message: error?.message || 'Failed to login' };
        }
    }

    isLoggedIn() {
        if (!config.appId) return false;
        return !!this.credentials;
    }
}

export const authManager = new AuthManager();