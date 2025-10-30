// ===== GRANTSETU COMPONENTS =====
// Reusable Navigation and Footer Components

// ===== NAVIGATION COMPONENT =====
const createNavigation = () => {
    return `
    <nav class="navbar">
        <div class="navbar__container">
            <div class="navbar__logo">
                <a href="index.html">
                    <img src="assets/images/grantsetu-logo.svg" alt="GrantSetu">
                </a>
            </div>
            
            <div class="navbar__nav">
                <a href="index.html">Home</a>
                <a href="schemes-discovery.html">Schemes</a>
                <a href="team.html">Team</a>
                <a href="eligibility-check.html">Check Eligibility</a>
            </div>
            
            
            <button class="navbar__hamburger" id="hamburger-btn">
                <i class="fas fa-bars"></i>
            </button>
        </div>
        
        <div class="mobile-menu" id="mobile-menu">
            <div class="mobile-menu__content">
                <button class="mobile-menu__close" id="mobile-menu-close">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="mobile-menu__nav">
                    <a href="index.html">Home</a>
                    <a href="schemes-discovery.html">Schemes</a>
                    <a href="team.html">Team</a>
                    <a href="eligibility-check.html">Check Eligibility</a>
                    <a href="dashboard.html">Dashboard</a>
                </div>
            </div>
        </div>
    </nav>
    `;
};

// ===== FOOTER COMPONENT =====
const createFooter = () => {
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer__content">
                <div class="footer__main">
                    <div class="footer__info">
                        <div class="footer__logo">
                            <img src="assets/images/grantsetu-logo.svg" alt="GrantSetu" class="footer__logo-img">
                            <p class="footer__tagline">Simplifying Government Applications for Indian MSMEs</p>
                        </div>
                        <div class="footer__contact">
                            <div class="footer__contact-item">
                                <i class="fas fa-phone"></i>
                                <span>+91 7895211541</span>
                            </div>
                            <div class="footer__contact-item">
                                <i class="fas fa-envelope"></i>
                                <span>support@grantsetu.com</span>
                            </div>
                            <div class="footer__contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Gurgaon, Haryana, India</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer__links">
                        <div class="footer__column">
                            <h4>Services</h4>
                            <ul>
                                <li><a href="schemes-discovery.html">Explore Schemes</a></li>
                                <li><a href="eligibility-check.html">Check Eligibility</a></li>
                                <li><a href="dashboard.html">Track Application</a></li>
                                <li><a href="#consultation">Consult with AI</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer__column">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="team.html">Our Team</a></li>
                                <li><a href="#contact">Contact Us</a></li>
                                <li><a href="#privacy">Privacy Policy</a></li>
                                <li><a href="#terms">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="footer__bottom">
                    <div class="footer__bottom-content">
                        <div class="footer__copyright">
                            <p>&copy; 2025 GrantSetu. All rights reserved.</p>
                        </div>
                        <div class="footer__legal">
                            <a href="#terms" class="footer__legal-link">Terms of Service</a>
                            <a href="#privacy" class="footer__legal-link">Privacy Policy</a>
                            <a href="#cookies" class="footer__legal-link">Cookie Policy</a>
                        </div>
                        <div class="footer__social">
                            <a href="/grantsetu" class="footer__social-link">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="/grantsetu" class="footer__social-link">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="/grantsetu" class="footer__social-link">
                                <i class="fab fa-linkedin-in"></i>
                            </a>
                            <a href="/grantsetu" class="footer__social-link">
                                <i class="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    `;
};

// ===== INITIALIZE COMPONENTS =====
const initializeComponents = () => {
    // Render navigation
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = createNavigation();
    }
    
    // Render footer
    const footerContainer = document.getElementById('footer');
    if (footerContainer) {
        footerContainer.innerHTML = createFooter();
    }
    
    // Initialize mobile menu after rendering
    setTimeout(() => {
        initMobileMenu();
        initStartApplicationBtn();
        initHeroStartApplicationBtn();
        
        // Initialize navbar scroll handler immediately after navbar is rendered
        if (window.handleNavbarScroll) {
            // Simple scroll handler without throttle for now
            window.addEventListener('scroll', window.handleNavbarScroll);
            window.handleNavbarScroll(); // Set initial state
        }
    }, 100);
};

// ===== MOBILE MENU HANDLER =====
const initMobileMenu = () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    if (!hamburgerBtn || !mobileMenu) return;
    
    // Open mobile menu
    hamburgerBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close mobile menu
    const closeMenu = () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMenu);
    }
    
    // Close menu when clicking outside
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            closeMenu();
        }
    });
    
    // Close menu when pressing escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
};

// ===== START APPLICATION BUTTON HANDLER =====
const initStartApplicationBtn = () => {
    const startAppBtn = document.getElementById('start-application-btn');
    
    if (startAppBtn) {
        startAppBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if user is already authenticated
            if (window.authService && window.authService.isAuthenticated()) {
                // User is logged in, go directly to eligibility check
                window.location.href = 'eligibility-check.html';
            } else {
                // User not logged in, prompt for Gmail login
                if (window.authFlow) {
                    // Prevent body scroll when modal opens
                    document.body.style.overflow = 'hidden';
                    window.authFlow.showAuthModalForApply();
                } else {
                    // Fallback: redirect to eligibility check (user will be prompted to login there)
                    window.location.href = 'eligibility-check.html';
                }
            }
        });
    }
};

// ===== HERO START APPLICATION BUTTON HANDLER =====
const initHeroStartApplicationBtn = () => {
    const heroStartAppBtn = document.getElementById('hero-start-application-btn');
    
    if (heroStartAppBtn) {
        heroStartAppBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'eligibility-check.html';
        });
    }
};

// ===== EXPORT FOR USE =====
window.GrantSetuComponents = {
    createNavigation,
    createFooter,
    initializeComponents
};

// ===== AUTO-INITIALIZE =====
// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        initializeComponents();
        
        // Ensure scroll handler is attached
        setTimeout(() => {
            if (window.handleNavbarScroll) {
                window.addEventListener('scroll', window.handleNavbarScroll);
                window.handleNavbarScroll(); // Set initial state
            }
        }, 100);
    }, 50);
});