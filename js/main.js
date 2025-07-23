/* ===== BHARATSETU MAIN JAVASCRIPT ===== */
/* Optimized main JavaScript using centralized utilities */

// ===== NAVBAR SCROLL HANDLER =====
const handleNavbarScroll = () => {
    const navbar = $('.navbar');
    if (!navbar) return;
    
    if (window.scrollY > 50) {
        addClass(navbar, 'navbar--scrolled');
        removeClass(navbar, 'navbar--transparent');
    } else {
        addClass(navbar, 'navbar--transparent');
        removeClass(navbar, 'navbar--scrolled');
    }
};

// ===== MOBILE MENU HANDLER =====
const initMobileMenu = () => {
    const hamburgerBtn = $('#hamburger-btn');
    const mobileMenu = $('#mobile-menu');
    const mobileLoginBtn = $('#mobile-login-btn');
    const mobileLogoutBtn = $('#mobile-logout-btn');
    
    if (!hamburgerBtn || !mobileMenu) return;
    
    // Toggle mobile menu
    hamburgerBtn.addEventListener('click', () => {
        toggleClass(hamburgerBtn, 'active');
        toggleClass(mobileMenu, 'active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            removeClass(hamburgerBtn, 'active');
            removeClass(mobileMenu, 'active');
        }
    });
    
    // Handle mobile login/logout
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            // Close mobile menu first
            removeClass(hamburgerBtn, 'active');
            removeClass(mobileMenu, 'active');
            
            // Trigger Google Auth login flow
            if (window.authFlow) {
                window.authFlow.showAuthModal();
            } else if (window.initiateLogin) {
                window.initiateLogin();
            } else {
                // Fallback test login for demo
                const testUserData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    picture: null
                };
                updateMobileMenuForAuth(true, testUserData);
            }
        });
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            // Close mobile menu first
            removeClass(hamburgerBtn, 'active');
            removeClass(mobileMenu, 'active');
            
            // Trigger Google Auth logout flow
            if (window.authService) {
                window.authService.logout();
            } else if (window.logout) {
                window.logout();
            } else {
                // Fallback test logout for demo
                updateMobileMenuForAuth(false);
            }
        });
    }
};

// ===== MOBILE MENU AUTH STATE UPDATER =====
const updateMobileMenuForAuth = (isAuthenticated, userData = null) => {
    const mobileUserPicture = $('#mobile-user-picture');
    const mobileUserName = $('#mobile-user-name');
    const mobileUserEmail = $('#mobile-user-email');
    const mobileLoginBtn = $('#mobile-login-btn');
    const mobileLogoutBtn = $('#mobile-logout-btn');
    
    if (isAuthenticated && userData) {
        // Update user info
        if (mobileUserPicture) {
            // If user has a picture, replace the icon with an image
            if (userData.picture) {
                mobileUserPicture.innerHTML = `<img src="${userData.picture}" alt="${userData.name || 'User'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;
            } else {
                mobileUserPicture.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
        
        if (mobileUserName) {
            mobileUserName.textContent = userData.name || 'User';
        }
        
        if (mobileUserEmail) {
            mobileUserEmail.textContent = userData.email || '';
        }
        
        // Show logout, hide login
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'flex';
        
    } else {
        // Reset to guest state
        if (mobileUserPicture) {
            mobileUserPicture.innerHTML = '<i class="fas fa-user"></i>';
        }
        
        if (mobileUserName) {
            mobileUserName.textContent = 'Guest';
        }
        
        if (mobileUserEmail) {
            mobileUserEmail.textContent = 'Not logged in';
        }
        
        // Show login, hide logout
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'flex';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
    }
};

// ===== SMOOTH SCROLLING =====
const initSmoothScrolling = () => {
    addEventListeners('a[href^="#"]', 'click', (e) => {
        e.preventDefault();
        const target = $(e.target.getAttribute('href'));
        if (target && window.BharatSetuUtils && window.BharatSetuUtils.scroll) {
            window.BharatSetuUtils.scroll.to(target, 80);
        }
    });
};

// ===== ANIMATION ON SCROLL =====
const initScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                addClass(entry.target, 'animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    $$('.problem-card, .consultant-card, .scheme-card, .service-card').forEach(el => {
        observer.observe(el);
    });
};

// ===== FORM VALIDATION =====
const initFormValidation = () => {
    const forms = $$('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const formData = window.BharatSetuUtils?.formUtils?.getFormData(form);
            
            // Basic validation rules
            const rules = {
                email: ['email'],
                phone: ['phone'],
                name: ['required', { validator: 'minLength', message: 'Name must be at least 2 characters', params: [2] }],
                message: ['required', { validator: 'minLength', message: 'Message must be at least 10 characters', params: [10] }]
            };
            
            const errors = window.BharatSetuUtils?.formUtils?.validateForm(form, rules);
            
            if (Object.keys(errors).length > 0) {
                e.preventDefault();
                window.BharatSetuUtils?.formUtils?.showFormErrors(form, errors);
                return false;
            }
            
            window.BharatSetuUtils?.formUtils?.clearFormErrors(form);
        });
        
        // Real-time validation
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => {
                const fieldName = field.name;
                if (!fieldName) return;
                
                const fieldRules = {
                    email: ['email'],
                    phone: ['phone'],
                    name: ['required'],
                    message: ['required']
                };
                
                if (fieldRules[fieldName]) {
                    const errors = window.BharatSetuUtils?.formUtils?.validateForm(form, { [fieldName]: fieldRules[fieldName] });
                    if (errors[fieldName]) {
                        window.BharatSetuUtils?.formUtils?.showFormErrors(form, errors);
                    } else {
                        window.BharatSetuUtils?.formUtils?.clearFormErrors(form);
                    }
                }
            });
        });
    });
};

// ===== LAZY LOADING =====
const initLazyLoading = () => {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    $$('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
};

// ===== PERFORMANCE OPTIMIZATION =====
const initPerformanceOptimizations = () => {
    // Throttle scroll events
    const throttledScrollHandler = throttle(handleNavbarScroll, 16);
    window.addEventListener('scroll', throttledScrollHandler);
    
    // Debounce resize events
    const debouncedResizeHandler = debounce(() => {
        // Handle responsive layout changes
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            addClass(document.body, 'mobile-view');
        } else {
            removeClass(document.body, 'mobile-view');
        }
    }, 250);
    
    window.addEventListener('resize', debouncedResizeHandler);
};

// ===== ACCESSIBILITY IMPROVEMENTS =====
const initAccessibility = () => {
    // Skip to main content
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Keyboard navigation for mobile menu
    const mobileMenu = $('#mobile-menu');
    if (mobileMenu) {
        const focusableElements = mobileMenu.querySelectorAll('a, button, input, textarea, select');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
    
    // ARIA labels for interactive elements
    $$('button[aria-label], a[aria-label]').forEach(element => {
        if (!element.getAttribute('aria-label')) {
            const text = element.textContent.trim();
            if (text) {
                element.setAttribute('aria-label', text);
            }
        }
    });
};

// ===== ERROR HANDLING =====
const initErrorHandling = () => {
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        // Could send to error tracking service here
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        // Could send to error tracking service here
    });
};

// ===== ANALYTICS =====
const initAnalytics = () => {
    // Track page views
    const trackPageView = () => {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    };
    
    // Track events
    const trackEvent = (eventName, parameters = {}) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    };
    
    // Track form submissions
    addEventListeners('form', 'submit', () => {
        trackEvent('form_submit', {
            form_name: 'contact_form',
            page_location: window.location.pathname
        });
    });
    
    // Track button clicks
    addEventListeners('.btn', 'click', (e) => {
        const buttonText = e.target.textContent.trim();
        trackEvent('button_click', {
            button_text: buttonText,
            page_location: window.location.pathname
        });
    });
    
    // Initial page view
    trackPageView();
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initMobileMenu();
    initSmoothScrolling();
    initScrollAnimations();
    initFormValidation();
    initLazyLoading();
    initPerformanceOptimizations();
    initAccessibility();
    initErrorHandling();
    initAnalytics();
    
    // Initial navbar state
    handleNavbarScroll();
    
    // Set initial mobile menu state (guest mode)
    updateMobileMenuForAuth(false);
    
    // Listen for auth state changes
    if (window.authService) {
        // Update mobile menu when auth state changes
        const originalOnAuthSuccess = window.authService.onAuthSuccess.bind(window.authService);
        window.authService.onAuthSuccess = function(user) {
            updateMobileMenuForAuth(true, user);
            originalOnAuthSuccess.call(this, user);
        };
        
        const originalOnLogout = window.authService.onLogout.bind(window.authService);
        window.authService.onLogout = function() {
            updateMobileMenuForAuth(false);
            originalOnLogout.call(this);
        };
    }
    
    // Expose functions for external use
    window.updateMobileMenuForAuth = updateMobileMenuForAuth;
    window.handleNavbarScroll = handleNavbarScroll;
    
    console.log('BharatSetu main.js initialized successfully');
});

// ===== EXPORT FOR MODULE USE =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleNavbarScroll,
        initMobileMenu,
        updateMobileMenuForAuth,
        initSmoothScrolling,
        initScrollAnimations,
        initFormValidation,
        initLazyLoading,
        initPerformanceOptimizations,
        initAccessibility,
        initErrorHandling,
        initAnalytics
    };
} 