// Authentication Service for BharatSetu
class AuthService {
    constructor() {
        console.log('AuthService constructor called');
        this.token = localStorage.getItem('bharatsetu_token');
        this.user = JSON.parse(localStorage.getItem('bharatsetu_user') || 'null');
        this.apiBase = '/api';
        console.log('AuthService constructor completed');
        
        // Initialize Google Auth
        this.initGoogleAuth().catch(error => {
            console.error('Failed to initialize Google Auth:', error);
        });
        
        // Check authentication state on page load
        this.checkAuthStateOnLoad();
    }

    // Check authentication state when page loads
    checkAuthStateOnLoad() {
        console.log('Checking auth state on page load...');
        if (this.isAuthenticated()) {
            console.log('User is authenticated, updating UI...');
            this.updateUIForAuthenticatedUser();
        } else {
            console.log('User is not authenticated, updating UI...');
            this.updateUIForUnauthenticatedUser();
        }
    }

    // Initialize Google OAuth
    initGoogleAuth() {
        console.log('AuthService.initGoogleAuth() called');
        return new Promise((resolve, reject) => {
            // Load Google OAuth script
            if (window.google && window.google.accounts && window.google.accounts.id) {
                console.log('Google library already available');
                this.initializeGoogleSignIn();
                resolve();
            } else {
                console.log('Loading Google OAuth script...');
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.onload = () => {
                    console.log('Google OAuth script loaded');
                    // Wait a bit for the library to fully initialize
                    setTimeout(() => {
                        this.initializeGoogleSignIn();
                        resolve();
                    }, 500);
                };
                script.onerror = (error) => {
                    console.error('Failed to load Google OAuth script:', error);
                    reject(error);
                };
                document.head.appendChild(script);
            }
        });
    }

    // Global Google OAuth initialization flag
    static googleInitialized = false;

    // Initialize Google Sign-In
    initializeGoogleSignIn() {
        try {
            // Only initialize once
            if (!AuthService.googleInitialized) {
                google.accounts.id.initialize({
                    client_id: '450190082724-3knmlhpjkog7gdktivlsa3gli1egc6jm.apps.googleusercontent.com',
                    callback: this.handleGoogleSignIn.bind(this),
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    prompt_parent_id: 'google-signin-modal'
                });
                AuthService.googleInitialized = true;
                console.log('Google OAuth initialized successfully');
            }

            // Render the Google Sign-In button
            this.renderGoogleSignInButton();
        } catch (error) {
            console.error('Failed to initialize Google Sign-In:', error);
        }
    }

    // Render Google Sign-In button using renderButton() method
    renderGoogleSignInButton() {
        try {
            const signInButton = document.getElementById('google-signin-button');
            if (signInButton && window.google && window.google.accounts && window.google.accounts.id) {
                // Clear the container first
                signInButton.innerHTML = '';
                
                // Render the Google Sign-In button directly
                google.accounts.id.renderButton(signInButton, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: '100%',
                    click_listener: (response) => {
                        console.log('Google Sign-In response received');
                        this.handleGoogleSignIn(response);
                    }
                });
                
                console.log('Google Sign-In button rendered successfully');
            }
        } catch (error) {
            console.error('Failed to render Google Sign-In button:', error);
        }
    }

    // Trigger Google Sign-In using renderButton() method
    triggerGoogleSignIn() {
        try {
            // This method is now handled by the renderButton click_listener
            console.log('Google Sign-In triggered via renderButton');
        } catch (error) {
            console.error('Failed to trigger Google Sign-In:', error);
            this.showAuthError('Failed to start Google Sign-In');
        }
    }

    // Handle Google Sign-In
    async handleGoogleSignIn(response) {
        try {
            console.log('Google Sign-In response received:', response);
            
            // Check if we have a credential
            if (!response.credential) {
                console.log('No credential in response - this is normal for cancelled sign-in');
                // Don't create mock user - just return
                return;
            }
            
            // Decode the JWT token to get user information
            const userInfo = this.decodeJwtToken(response.credential);
            console.log('Decoded user info:', userInfo);
            console.log('Profile picture URL:', userInfo.picture);
            
            // Store the credential as the token
            this.setAuthData(response.credential, userInfo);
            this.onAuthSuccess(userInfo);
            
            console.log('Google Sign-In completed successfully');
        } catch (error) {
            console.error('Google sign-in failed:', error);
            this.onAuthError(error);
        }
    }

    // Decode JWT token to get user information
    decodeJwtToken(token) {
        try {
            // JWT tokens have 3 parts separated by dots
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT token format');
            }
            
            // Decode the payload (second part)
            const payload = parts[1];
            // Add padding if needed
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
            
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Failed to decode JWT token:', error);
            // Return a basic user object if decoding fails
            return {
                sub: 'unknown',
                email: 'unknown@example.com',
                name: 'Unknown User',
                picture: null
            };
        }
    }

    // Set authentication data
    setAuthData(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('bharatsetu_token', token);
        localStorage.setItem('bharatsetu_user', JSON.stringify(user));
    }

    // Clear authentication data
    clearAuthData() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('bharatsetu_token');
        localStorage.removeItem('bharatsetu_user');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }
    
    getUserData() {
        return this.user;
    }

    // Get authentication headers
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // API call with authentication
    async apiCall(endpoint, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        const response = await fetch(`${this.apiBase}${endpoint}`, {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        return response.json();
    }

    // API methods
    async getUserProfile() {
        return this.apiCall('/user/profile');
    }

    async getCompanies() {
        return this.apiCall('/companies');
    }

    async createCompany(companyData) {
        return this.apiCall('/companies', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    }

    async storeEligibilityTest(companyId, testData, results) {
        return this.apiCall('/eligibility-tests', {
            method: 'POST',
            body: JSON.stringify({ companyId, testData, results })
        });
    }

    async getEligibilityTests() {
        return this.apiCall('/eligibility-tests');
    }

    async createApplication(companyId, schemeId, schemeName, documents) {
        return this.apiCall('/applications', {
            method: 'POST',
            body: JSON.stringify({ companyId, schemeId, schemeName, documents })
        });
    }

    async getApplications() {
        return this.apiCall('/applications');
    }

    logout() {
        console.log('Logging out user...');
        this.clearAuthData();
        this.onLogout();
    }

    onAuthSuccess(user) {
        console.log('Authentication successful:', user);
        // Update UI to show authenticated state
        this.updateUIForAuthenticatedUser();
        
        // Trigger auth state change callback
        if (this.onAuthStateChange) {
            this.onAuthStateChange();
        }
    }

    onAuthError(error) {
        console.error('Authentication error:', error);
        // Show error message to user
        this.showAuthError(error.message);
    }

    onLogout() {
        console.log('User logged out');
        // Update UI to show unauthenticated state
        this.updateUIForUnauthenticatedUser();
        
        // Trigger auth state change callback
        if (this.onAuthStateChange) {
            this.onAuthStateChange();
        }
    }

    // UI update methods
    updateUIForAuthenticatedUser() {
        console.log('Updating UI for authenticated user:', this.user);
        
        // Update mobile menu for authenticated state
        if (typeof window.updateMobileMenuForAuth === 'function') {
            window.updateMobileMenuForAuth(true, this.user);
        }
    }

    updateUIForUnauthenticatedUser() {
        console.log('Updating UI for unauthenticated user');
        
        // Update mobile menu for guest state
        if (typeof window.updateMobileMenuForAuth === 'function') {
            window.updateMobileMenuForAuth(false);
        }
    }

    updateUserInfo() {
        if (!this.user) {
            console.log('No user data available for UI update');
            return;
        }

        console.log('Updating user info in UI:', this.user);

        // Update all possible user info elements
        const userNameElements = document.querySelectorAll('#user-name, .user-name, [data-user-name]');
        const userEmailElements = document.querySelectorAll('#user-email, .user-email, [data-user-email]');
        const userPictureElements = document.querySelectorAll('#user-picture, .user-picture, [data-user-picture]');

        // Update name
        userNameElements.forEach(element => {
            element.textContent = this.user.name || 'User';
        });

        // Update email
        userEmailElements.forEach(element => {
            element.textContent = this.user.email || '';
        });

        // Update profile picture
        userPictureElements.forEach(element => {
            if (this.user.picture) {
                element.src = this.user.picture;
                element.style.display = 'block';
                element.onerror = () => {
                    console.log('Failed to load profile picture, showing default');
                    element.style.display = 'none';
                };
            } else {
                console.log('No profile picture available');
                element.style.display = 'none';
            }
        });

        // Update mobile menu user info
        const mobileUserName = document.getElementById('mobile-user-name');
        const mobileUserEmail = document.getElementById('mobile-user-email');
        const mobileUserPicture = document.getElementById('mobile-user-picture');

        if (mobileUserName) mobileUserName.textContent = this.user.name || 'User';
        if (mobileUserEmail) mobileUserEmail.textContent = this.user.email || '';
        if (mobileUserPicture && this.user.picture) {
            mobileUserPicture.src = this.user.picture;
            mobileUserPicture.style.display = 'block';
        }
    }

    showAuthError(message) {
        // Create or update error message element
        let errorElement = document.getElementById('auth-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'auth-error';
            errorElement.className = 'auth-error';
            errorElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f8d7da;
                color: #721c24;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #f5c6cb;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Initialize auth service
console.log('Creating AuthService instance...');
const authService = new AuthService();
console.log('AuthService instance created:', authService);

// Assign to window for global access
window.authService = authService;
console.log('AuthService assigned to window.authService:', !!window.authService);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
} 