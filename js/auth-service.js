// Authentication Service for BharatSetu
class AuthService {
    constructor() {
        console.log('AuthService constructor called');
        this.token = localStorage.getItem('bharatsetu_token');
        this.user = JSON.parse(localStorage.getItem('bharatsetu_user') || 'null');
        this.apiBase = '/api';
        console.log('AuthService constructor completed');
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
                    callback: this.handleGoogleSignIn.bind(this)
                });
                AuthService.googleInitialized = true;
                console.log('Google OAuth initialized successfully');
            }

            // Use prompt() method instead of renderButton() to avoid postMessage errors
            this.renderGoogleSignInButton();
        } catch (error) {
            console.error('Failed to initialize Google Sign-In:', error);
        }
    }

    // Render Google Sign-In button using prompt() method
    renderGoogleSignInButton() {
        try {
            const signInButton = document.getElementById('google-signin-button');
            if (signInButton) {
                // Clear the container first
                signInButton.innerHTML = '';
                
                // Create a custom button that triggers the prompt
                const customButton = document.createElement('button');
                customButton.className = 'btn btn--primary google-signin-custom';
                customButton.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
                customButton.onclick = () => this.triggerGoogleSignIn();
                
                signInButton.appendChild(customButton);
                console.log('Custom Google Sign-In button rendered');
            }
        } catch (error) {
            console.error('Failed to render Google Sign-In button:', error);
        }
    }

    // Trigger Google Sign-In using prompt() method
    triggerGoogleSignIn() {
        try {
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    console.log('Google Sign-In prompt not displayed');
                    this.showAuthError('Google Sign-In not available');
                } else if (notification.isSkippedMoment()) {
                    console.log('Google Sign-In prompt skipped');
                    this.showAuthError('Google Sign-In was skipped');
                } else if (notification.isDismissedMoment()) {
                    console.log('Google Sign-In prompt dismissed');
                    // User dismissed the prompt, no action needed
                } else if (notification.isDisplayed()) {
                    console.log('Google Sign-In prompt displayed');
                }
            });
        } catch (error) {
            console.error('Failed to trigger Google Sign-In:', error);
            this.showAuthError('Failed to start Google Sign-In');
        }
    }

    // Handle Google Sign-In
    async handleGoogleSignIn(response) {
        try {
            const result = await this.authenticateWithGoogle(response.credential);
            this.setAuthData(result.token, result.user);
            this.onAuthSuccess(result.user);
        } catch (error) {
            console.error('Google sign-in failed:', error);
            this.onAuthError(error);
        }
    }

    // Authenticate with Google token
    async authenticateWithGoogle(token) {
        const response = await fetch(`${this.apiBase}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        return await response.json();
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
        return await this.apiCall('/companies');
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
        return await this.apiCall('/eligibility-tests');
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
        return await this.apiCall('/applications');
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
    }

    updateUIForUnauthenticatedUser() {
        const authSection = document.getElementById('auth-section');
        const userSection = document.getElementById('user-section');
        
        if (authSection) authSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
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