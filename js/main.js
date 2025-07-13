// Initialize Swiper carousels
document.addEventListener('DOMContentLoaded', function() {
    // State Schemes Swiper
    const stateSwiper = new Swiper('.state-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.state-swiper .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 4,
            },
        }
    });

    // Sector Schemes Swiper
    const sectorSwiper = new Swiper('.sector-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.sector-swiper .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 4,
            },
        }
    });

    // Problem Focused Schemes Swiper
    const problemSwiper = new Swiper('.problem-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.problem-swiper .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 4,
            },
        }
    });

    // Mobile Navigation Toggle
    const navbarToggle = document.querySelector('.navbar__toggle');
    const navbarMenu = document.querySelector('.navbar__menu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
            navbarToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.navbar__link, .btn[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission handling
    const contactForm = document.querySelector('.contact__form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const companyName = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const phone = this.querySelector('input[type="tel"]').value;
            const service = this.querySelector('select').value;
            const message = this.querySelector('textarea').value;
            
            // Basic validation
            if (!companyName || !email || !phone || !service || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Phone validation
            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!phoneRegex.test(phone)) {
                alert('Please enter a valid phone number.');
                return;
            }
            
            // Simulate form submission
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                alert('Thank you! Your application has been submitted. We will contact you within 24 hours.');
                this.reset();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }

    // === Eligibility Checker Modal Logic ===
    const eligibilityCta = document.getElementById('eligibility-cta');
    const eligibilityModal = document.getElementById('eligibility-modal');
    const eligibilityModalClose = document.getElementById('eligibility-modal-close');
    const eligibilityForm = document.getElementById('eligibility-form');
    const eligibilityResults = document.getElementById('eligibility-results');

    if (eligibilityCta && eligibilityModal && eligibilityModalClose) {
        eligibilityCta.addEventListener('click', () => {
            eligibilityModal.style.display = 'flex';
            eligibilityResults.innerHTML = '';
            eligibilityForm.reset();
        });
        eligibilityModalClose.addEventListener('click', () => {
            eligibilityModal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === eligibilityModal) {
                eligibilityModal.style.display = 'none';
            }
        });
    }

    // Sample schemes data for MVP
    const schemes = [
      {
        name: 'Electricity Duty Reimbursement',
        eligibility: {
          msme_type: ['Micro', 'Small', 'Medium'],
          block: ['A', 'B', 'C', 'D'],
          commercial_production_after: '2019-02-26',
          new_connection_after: '2019-02-26'
        },
        benefit: '100% reimbursement for 7 years',
        reference: 'https://cdnbbsr.s3waas.gov.in/s3f48c04ffab49ff0e5d1176244fdfb65c/uploads/2021/01/2021010172.pdf'
      },
      {
        name: 'Stamp Duty Refund',
        eligibility: {
          msme_type: ['Micro', 'Small'],
          block: ['A', 'B', 'C', 'D'],
          land_purchase_within_years: 5
        },
        benefit: '100% refund in D, 75% in C, 50% in A/B blocks',
        reference: 'https://cdnbbsr.s3waas.gov.in/s3f48c04ffab49ff0e5d1176244fdfb65c/uploads/2020/08/2020081089.pdf'
      }
    ];

    if (eligibilityForm) {
        eligibilityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            eligibilityResults.innerHTML = '';
            const msmeType = document.getElementById('msme-type').value;
            const block = document.getElementById('block').value;
            const prodDate = document.getElementById('prod-date').value;
            const elecDate = document.getElementById('elec-date').value;

            // Eligibility logic for MVP
            const eligibleSchemes = schemes.filter(scheme => {
                // Electricity Duty Reimbursement
                if (scheme.name === 'Electricity Duty Reimbursement') {
                    const afterProd = !scheme.eligibility.commercial_production_after || (prodDate && prodDate >= scheme.eligibility.commercial_production_after);
                    const afterElec = !scheme.eligibility.new_connection_after || (elecDate && elecDate >= scheme.eligibility.new_connection_after);
                    return scheme.eligibility.msme_type.includes(msmeType) && scheme.eligibility.block.includes(block) && afterProd && afterElec;
                }
                // Stamp Duty Refund (for demo, just check type and block)
                if (scheme.name === 'Stamp Duty Refund') {
                    return scheme.eligibility.msme_type.includes(msmeType) && scheme.eligibility.block.includes(block);
                }
                return false;
            });

            if (eligibleSchemes.length === 0) {
                eligibilityResults.innerHTML = '<div class="alert alert-warning">No eligible schemes found for the provided details. Please check your inputs or contact us for more guidance.</div>';
            } else {
                eligibilityResults.innerHTML = '<h3>Eligible Schemes:</h3>' + eligibleSchemes.map(s => `
                    <div class="scheme-result">
                        <h4>${s.name}</h4>
                        <p><strong>Benefit:</strong> ${s.benefit}</p>
                        <a href="${s.reference}" target="_blank">View Details</a>
                    </div>
                `).join('');
            }
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .problem-card, .success-card, .subsidy-card');
    animateElements.forEach(el => observer.observe(el));

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .navbar__menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .navbar__toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .navbar__toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .navbar__toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .service-card, .problem-card, .success-card, .subsidy-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .service-card.animate-in, .problem-card.animate-in, .success-card.animate-in, .subsidy-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    body:not(.loaded) {
        opacity: 0;
    }
    
    body.loaded {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
    
    @media (max-width: 768px) {
        .navbar__menu {
            display: none;
        }
    }
`;
document.head.appendChild(style); 