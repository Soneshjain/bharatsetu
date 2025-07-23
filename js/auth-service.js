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
                    client_id: '314061526138-r8gk1vfcan1rm93p0otk93cvtmdcohev.apps.googleusercontent.com',
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
                console.log('No credential in response, creating mock user');
                const mockUser = {
                    sub: 'mock_user',
                    email: 'user@example.com',
                    name: 'Test User',
                    picture: null
                };
                this.setAuthData('mock_token', mockUser);
                this.onAuthSuccess(mockUser);
                return;
            }
            
            // Decode the JWT token to get user information
            const userInfo = this.decodeJwtToken(response.credential);
            console.log('Decoded user info:', userInfo);
            
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

        if (response.status === 401) {
            this.clearAuthData();
            this.onAuthError(new Error('Session expired'));
            throw new Error('Session expired');
        }

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        return await response.json();
    }

    // Get user profile
    async getUserProfile() {
        return await this.apiCall('/user/profile');
    }

    // Get user's companies
    async getCompanies() {
        const response = await this.apiCall('/companies');
        return response.companies || [];
    }

    // Create new company
    async createCompany(companyData) {
        return await this.apiCall('/companies', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    }

    // Store eligibility test result
    async storeEligibilityTest(companyId, testData, results) {
        return await this.apiCall('/eligibility-tests', {
            method: 'POST',
            body: JSON.stringify({
                companyId,
                testData,
                results
            })
        });
    }

    // Get eligibility test history
    async getEligibilityTests() {
        const response = await this.apiCall('/eligibility-tests');
        return response.tests || [];
    }

    // Create scheme application
    async createApplication(companyId, schemeId, schemeName, documents) {
        return await this.apiCall('/applications', {
            method: 'POST',
            body: JSON.stringify({
                companyId,
                schemeId,
                schemeName,
                documents
            })
        });
    }

    // Get applications
    async getApplications() {
        const response = await this.apiCall('/applications');
        return response.applications || [];
    }

    // Logout
    logout() {
        this.clearAuthData();
        this.onLogout();
    }

    // Event handlers (can be overridden)
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
        const authSection = document.getElementById('auth-section');
        const userSection = document.getElementById('user-section');
        
        if (authSection) authSection.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'block';
            this.updateUserInfo();
        }
        
        // Update mobile menu for authenticated state
        if (typeof window.updateMobileMenuForAuth === 'function') {
            window.updateMobileMenuForAuth(true, this.user);
        }
    }

    updateUIForUnauthenticatedUser() {
        const authSection = document.getElementById('auth-section');
        const userSection = document.getElementById('user-section');
        
        if (authSection) authSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
        
        // Update mobile menu for guest state
        if (typeof window.updateMobileMenuForAuth === 'function') {
            window.updateMobileMenuForAuth(false);
        }
    }

    updateUserInfo() {
        if (!this.user) return;

        const userNameElement = document.getElementById('user-name');
        const userEmailElement = document.getElementById('user-email');
        const userPictureElement = document.getElementById('user-picture');

        if (userNameElement) userNameElement.textContent = this.user.name;
        if (userEmailElement) userEmailElement.textContent = this.user.email;
        if (userPictureElement && this.user.picture) {
            userPictureElement.src = this.user.picture;
            userPictureElement.style.display = 'block';
        }
    }

    showAuthError(message) {
        // Create or update error message element
        let errorElement = document.getElementById('auth-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'auth-error';
            errorElement.className = 'auth-error';
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