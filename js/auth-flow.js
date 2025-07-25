// Authentication Flow Handler for BharatSetu
class AuthFlow {
    constructor() {
        this.authService = window.authService;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateApplyButtons();
    }

    bindEvents() {
        // Bind only buttons that should show auth modal (those without proper href)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn--primary[href="#contact"]') || 
                e.target.matches('.btn--primary[href="#"]') ||
                (e.target.classList.contains('btn--primary') && 
                 e.target.textContent.includes('Sign In to Apply'))) {
                e.preventDefault();
                this.handleApplyNow();
            }
        });

        // Listen for authentication state changes
        if (this.authService) {
            this.authService.onAuthStateChange = () => {
                this.updateApplyButtons();
            };
        }
    }

    handleApplyNow() {
        if (!this.authService || !this.authService.isAuthenticated()) {
            this.showAuthModal();
        } else {
            this.showApplicationForm();
        }
    }

    showAuthModal() {
        // Create authentication modal
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content auth-modal">
                <span class="modal-close" id="auth-modal-close">&times;</span>
                <div class="auth-modal-content">
                    <h2>Sign In to Continue</h2>
                    <p>Please sign in with your Google account to access our application services.</p>
                    
                    <div class="auth-options">
                        <div id="google-signin-modal">
                            <!-- Fallback button if Google Sign-In doesn't load -->
                            <button class="btn btn--primary google-signin-fallback" style="display: none;">
                                <i class="fab fa-google"></i> Sign in with Google
                            </button>
                        </div>
                        <div class="auth-divider">
                            <span>or</span>
                        </div>
                        <button class="btn btn--secondary" onclick="authFlow.showEligibilityFirst()">
                            Check Eligibility First
                        </button>
                    </div>
                    
                    <div class="auth-benefits">
                        <h3>Why Sign In?</h3>
                        <ul>
                            <li><i class="fas fa-shield-alt"></i> Secure application tracking</li>
                            <li><i class="fas fa-save"></i> Save your eligibility results</li>
                            <li><i class="fas fa-chart-line"></i> Track application progress</li>
                            <li><i class="fas fa-bell"></i> Get notified about updates</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        console.log('Auth modal created and added to DOM');

        // Wait for Google OAuth to be initialized before rendering modal button
        this.waitForGoogleAuthAndRenderModal();
        
        // Also set a timeout to show fallback if Google doesn't load
        setTimeout(() => {
            const modalButton = document.getElementById('google-signin-modal');
            if (modalButton && modalButton.children.length === 0) {
                console.log('Google button not rendered after timeout, showing fallback');
                this.showFallbackButton(modalButton);
            }
        }, 3000);

        // Close modal functionality
        const closeBtn = modal.querySelector('#auth-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async handleModalSignIn(response) {
        try {
            console.log('Modal sign-in response received:', response);
            
            // Handle the Google Sign-In response
            await this.authService.handleGoogleSignIn(response);
            
            // Close auth modal
            const modal = document.getElementById('auth-modal');
            if (modal) modal.remove();
            
            // Wait a moment for authentication to complete, then show success
            setTimeout(() => {
                if (this.authService && this.authService.isAuthenticated()) {
                    this.showSuccessMessage();
                } else {
                    console.log('Authentication not completed yet');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Modal sign-in failed:', error);
            this.showAuthError('Sign-in failed. Please try again.');
        }
    }

    showSuccessMessage() {
        // Create a simple success message
        const successDiv = document.createElement('div');
        successDiv.className = 'auth-success';
        successDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
                        text-align: center; z-index: 10000;">
                <h3 style="color: #10b981; margin-bottom: 15px;">✅ Login Successful!</h3>
                <p style="color: #6b7280; margin-bottom: 20px;">You are now logged in successfully!</p>
                <button onclick="this.parentElement.remove()" 
                        style="background: #10b981; color: white; border: none; padding: 10px 20px; 
                               border-radius: 6px; cursor: pointer;">Close</button>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 5000);
    }

    showApplicationForm() {
        // Create application form modal
        const modal = document.createElement('div');
        modal.id = 'application-modal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content application-modal">
                <span class="modal-close" id="application-modal-close">&times;</span>
                <div class="application-modal-content">
                    <h2>Start Your Application</h2>
                    <p>Welcome, <span id="user-name-display"></span>! Let's get started with your application.</p>
                    
                    <div class="application-steps">
                        <div class="step active" data-step="1">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h3>Check Eligibility</h3>
                                <p>First, let's check which schemes you're eligible for</p>
                                <button class="btn btn--primary" onclick="authFlow.startEligibilityCheck()">
                                    Check Eligibility
                                </button>
                            </div>
                        </div>
                        
                        <div class="step" data-step="2">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h3>Company Information</h3>
                                <p>Provide your company details for application</p>
                                <button class="btn btn--secondary" disabled>
                                    Coming Next
                                </button>
                            </div>
                        </div>
                        
                        <div class="step" data-step="3">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h3>Document Upload</h3>
                                <p>Upload required documents for schemes</p>
                                <button class="btn btn--secondary" disabled>
                                    Coming Next
                                </button>
                            </div>
                        </div>
                        
                        <div class="step" data-step="4">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <h3>Application Review</h3>
                                <p>Review and submit your application</p>
                                <button class="btn btn--secondary" disabled>
                                    Coming Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Update user name display
        const userNameDisplay = modal.querySelector('#user-name-display');
        if (this.authService && this.authService.user) {
            userNameDisplay.textContent = this.authService.user.name;
        }

        // Close modal functionality
        const closeBtn = modal.querySelector('#application-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    startEligibilityCheck() {
        // Close application modal
        const modal = document.getElementById('application-modal');
        if (modal) modal.remove();
        
        // Navigate to eligibility check page
        window.location.href = 'eligibility-check.html';
    }

    showEligibilityFirst() {
        // Close auth modal
        const modal = document.getElementById('auth-modal');
        if (modal) modal.remove();
        
        // Navigate to eligibility check page
        window.location.href = 'eligibility-check.html';
    }

    updateApplyButtons() {
        const isAuthenticated = this.authService && this.authService.isAuthenticated();
        // Only update buttons that don't have proper href attributes
        const applyButtons = document.querySelectorAll('.btn--primary[href="#contact"], .btn--primary[href="#"]');
        
        applyButtons.forEach(button => {
            // Don't update buttons that already have proper href attributes
            if (button.href === '#' || button.href === '#contact') {
                if (isAuthenticated) {
                    button.textContent = 'Apply Now';
                    button.href = '#';
                } else {
                    button.textContent = 'Sign In to Apply';
                    button.href = '#';
                }
            }
        });
    }

    waitForGoogleAuthAndRenderModal() {
        console.log('Starting to wait for Google Auth...');
        console.log('AuthService.googleInitialized:', AuthService.googleInitialized);
        console.log('window.google available:', !!window.google);
        
        const checkAndRender = () => {
            // Check if Google OAuth is initialized
            if (window.google && window.google.accounts && window.google.accounts.id && AuthService.googleInitialized) {
                console.log('Google Auth is ready, rendering modal button...');
                this.initializeGoogleSignInForModal();
            } else {
                console.log('Google Auth not ready yet, waiting...');
                // Wait a bit more and try again
                setTimeout(checkAndRender, 100);
            }
        };
        
        checkAndRender();
    }

    initializeGoogleSignInForModal() {
        try {
            const modalButton = document.getElementById('google-signin-modal');
            console.log('Modal button element:', modalButton);
            
            if (modalButton && window.google && window.google.accounts && window.google.accounts.id) {
                // Clear any existing content
                modalButton.innerHTML = '';
                
                // Render the Google Sign-In button directly
                google.accounts.id.renderButton(modalButton, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: 400,
                    click_listener: (response) => {
                        console.log('Google Sign-In response received:', response);
                        this.handleModalSignIn(response);
                    }
                });
                
                console.log('Modal Google Sign-In button rendered successfully');
            } else {
                console.log('Modal button or Google library not ready, showing fallback...');
                this.showFallbackButton(modalButton);
            }
        } catch (error) {
            console.error('Failed to render modal Google Sign-In button:', error);
            this.showFallbackButton(modalButton);
        }
    }

    triggerModalGoogleSignIn() {
        try {
            // First, try to use the renderButton approach which is more reliable
            const modalButton = document.getElementById('google-signin-modal');
            if (modalButton && window.google && window.google.accounts && window.google.accounts.id) {
                // Clear the container
                modalButton.innerHTML = '';
                
                // Render the Google Sign-In button directly
                google.accounts.id.renderButton(modalButton, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: 400,
                    click_listener: (response) => {
                        console.log('Google Sign-In response received:', response);
                        this.handleModalSignIn(response);
                    }
                });
                
                console.log('Google Sign-In button rendered successfully');
            } else {
                // Fallback to prompt method
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
            }
        } catch (error) {
            console.error('Failed to trigger modal Google Sign-In:', error);
            this.showAuthError('Failed to start Google Sign-In');
        }
    }

    showFallbackButton(container) {
        if (container) {
            container.innerHTML = `
                <button class="btn btn--primary google-signin-fallback" onclick="authFlow.handleFallbackSignIn()">
                    <i class="fab fa-google"></i> Sign in with Google
                </button>
            `;
            console.log('Fallback Google Sign-In button shown');
        }
    }

    handleFallbackSignIn() {
        // For now, just show an alert - in production this would redirect to Google OAuth
        alert('Google Sign-In is not available. Please try refreshing the page or contact support.');
    }

    showAuthError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showAuthModalForApply() {
        this.showAuthModal();
        
        // Override the success callback to redirect to dashboard
        const originalOnAuthSuccess = this.authService.onAuthSuccess;
        this.authService.onAuthSuccess = (user) => {
            console.log('Authentication successful for Apply Now, redirecting to dashboard');
            
            // Show success message
            this.showSuccessMessage();
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
            // Restore original callback
            this.authService.onAuthSuccess = originalOnAuthSuccess;
        };
    }

    showAuthModalForResults() {
        this.showAuthModal();
        
        // Override the success callback to show results
        const originalOnAuthSuccess = this.authService.onAuthSuccess;
        this.authService.onAuthSuccess = (user) => {
            console.log('Authentication successful for results, showing eligibility results');
            
            // Show success message
            this.showSuccessMessage();
            
            // Show eligibility results (this will be handled by eligibility-check.html)
            if (window.showEligibilityResults) {
                window.showEligibilityResults();
            }
            
            // Restore original callback
            this.authService.onAuthSuccess = originalOnAuthSuccess;
        };
    }
}

// Initialize auth flow when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authFlow = new AuthFlow();
}); 