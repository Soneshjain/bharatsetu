const fs = require('fs');
const path = require('path');

// Scheme data
const schemes = [
    {
        name: 'padma-cluster',
        title: 'PADMA Cluster Development',
        description: 'Get cluster-specific benefits and technology upgradation support under PADMA scheme',
        keywords: 'PADMA cluster, Haryana MSME, cluster development, technology upgradation, industrial cluster',
        benefit: 'Cluster-specific benefits',
        type: 'Haryana State'
    },
    {
        name: 'haryana-startup-policy',
        title: 'Haryana Startup Policy Benefits',
        description: 'Get startup-specific incentives and mentorship support under Haryana startup policy',
        keywords: 'Haryana startup policy, DPIIT recognition, startup incentives, mentorship support',
        benefit: 'Startup-specific incentives',
        type: 'Haryana State'
    },
    {
        name: 'testing-equipment',
        title: 'Testing & Measuring Equipment',
        description: 'Get 50% refund up to Rs. 20L on testing and measuring equipment for quality improvement',
        keywords: 'testing equipment, measuring equipment, quality improvement, MSME equipment subsidy',
        benefit: '50% up to Rs. 20L',
        type: 'National'
    },
    {
        name: 'zero-defect',
        title: 'Zero Defect Production',
        description: 'Get 50% support up to Rs. 5L for quality certifications to ensure zero defect production',
        keywords: 'zero defect, quality certification, ISO certification, quality management',
        benefit: '50% up to Rs. 5L',
        type: 'National'
    },
    {
        name: 'technology-adoption',
        title: 'Technology Adoption',
        description: 'Get 50% support up to Rs. 1Cr for adopting technology from national institutes',
        keywords: 'technology adoption, national institutes, innovation support, MSME technology',
        benefit: '50% up to Rs. 1Cr',
        type: 'National'
    },
    {
        name: 'quality-certifications',
        title: 'Quality Certifications',
        description: 'Get 50% support up to Rs. 6L for obtaining multiple quality certifications',
        keywords: 'quality certifications, ISO, international standards, MSME quality',
        benefit: '50% up to Rs. 6L',
        type: 'National'
    },
    {
        name: 'productivity-improvement',
        title: 'Productivity Improvement',
        description: 'Get 90-100% support for productivity tools and lean manufacturing',
        keywords: 'productivity improvement, lean manufacturing, process optimization, MSME productivity',
        benefit: '90-100% support',
        type: 'National'
    },
    {
        name: 'barcode-implementation',
        title: 'Barcode Implementation',
        description: 'Get up to 80% support for implementing barcodes and digital transformation',
        keywords: 'barcode implementation, digital transformation, supply chain, MSME digitalization',
        benefit: 'Up to 80% support',
        type: 'National'
    },
    {
        name: 'patent-filing',
        title: 'Patent Filing Support',
        description: 'Get 50% assistance for patent filing costs, up to 10L for domestic patents',
        keywords: 'patent filing, IP protection, domestic patents, international patents, MSME innovation',
        benefit: '50% assistance',
        type: 'National'
    },
    {
        name: 'design-centre',
        title: 'Design Centre Establishment',
        description: 'Get up to Rs. 40L support for establishing design centres and creative innovation',
        keywords: 'design centre, creative industry, design innovation, MSME design',
        benefit: 'Up to Rs. 40L',
        type: 'National'
    },
    {
        name: 'exhibition-support',
        title: 'Exhibition Support',
        description: 'Get up to Rs. 3L for domestic exhibitions and Rs. 5L for foreign exhibitions',
        keywords: 'exhibition support, domestic exhibitions, foreign exhibitions, market expansion',
        benefit: 'Up to Rs. 3L/5L',
        type: 'National'
    },
    {
        name: 'sme-exchange',
        title: 'SME Exchange Equity',
        description: 'Get support for listing on SME exchanges and capital market access',
        keywords: 'SME exchange, capital market, investor relations, MSME listing',
        benefit: 'Listing support',
        type: 'National'
    }
];

// Template function
function generateSchemePage(scheme) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${scheme.title} - BharatSetu | Government Subsidies for MSMEs</title>
    <meta name="description" content="${scheme.description}">
    <meta name="keywords" content="${scheme.keywords}">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="${scheme.title} - BharatSetu">
    <meta property="og:description" content="${scheme.description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://bharatsetu.com/schemes/${scheme.name}">
    <meta property="og:image" content="https://bharatsetu.com/images/${scheme.name}-scheme.jpg">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${scheme.title} - BharatSetu">
    <meta name="twitter:description" content="${scheme.description}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://bharatsetu.com/schemes/${scheme.name}">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="../css/auth.css">
    <link rel="stylesheet" href="../css/scheme-detail.css">
    
    <!-- Google OAuth -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="container">
            <div class="navbar__content">
                <div class="navbar__logo">
                    <a href="../index.html">
                        <i class="fas fa-bridge"></i>
                        <span class="navbar__logo-text">BharatSetu</span>
                    </a>
                </div>
                <div class="navbar__cta">
                    <!-- Authentication Section -->
                    <div id="auth-section" style="display: none;">
                        <div id="google-signin-button"></div>
                    </div>
                    
                    <!-- User Section -->
                    <div id="user-section" style="display: none;">
                        <div class="user-info">
                            <img id="user-picture" class="user-picture" style="display: none;" alt="User">
                            <span id="user-name"></span>
                            <button id="logout-btn" class="btn btn--secondary">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Scheme Hero Section -->
    <section class="scheme-hero">
        <div class="container">
            <div class="scheme-hero__content">
                <div class="scheme-hero__badge">
                    <i class="fas fa-${scheme.type === 'Haryana State' ? 'map-marker-alt' : 'flag'}"></i>
                    ${scheme.type} Scheme
                </div>
                <h1 class="scheme-hero__title">${scheme.title}</h1>
                <p class="scheme-hero__subtitle">${scheme.description}</p>
                
                <div class="scheme-hero__benefits">
                    <div class="benefit-card">
                        <i class="fas fa-percentage"></i>
                        <h3>${scheme.benefit}</h3>
                        <p>Maximum benefit available under this scheme</p>
                    </div>
                    <div class="benefit-card">
                        <i class="fas fa-calendar-alt"></i>
                        <h3>Quick Processing</h3>
                        <p>Fast-track application processing and approval</p>
                    </div>
                    <div class="benefit-card">
                        <i class="fas fa-industry"></i>
                        <h3>All MSMEs Eligible</h3>
                        <p>Micro, Small, and Medium enterprises</p>
                    </div>
                </div>
                
                <div class="scheme-hero__cta">
                    <a href="../eligibility-check.html" class="btn btn--primary">
                        Check Your Eligibility <i class="fas fa-arrow-right"></i>
                    </a>
                    <a href="#apply-now" class="btn btn--secondary">
                        Apply Now
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Scheme Details -->
    <main class="scheme-main">
        <div class="container">
            <!-- Quick Overview -->
            <section class="scheme-overview">
                <h2>Scheme Overview</h2>
                <div class="overview-grid">
                    <div class="overview-card">
                        <h3><i class="fas fa-money-bill-wave"></i> Maximum Benefit</h3>
                        <p>${scheme.benefit} support under this scheme</p>
                    </div>
                    <div class="overview-card">
                        <h3><i class="fas fa-clock"></i> Processing Time</h3>
                        <p>3-6 months from application submission</p>
                    </div>
                    <div class="overview-card">
                        <h3><i class="fas fa-users"></i> Target Beneficiaries</h3>
                        <p>All MSMEs in India (Micro, Small, Medium)</p>
                    </div>
                    <div class="overview-card">
                        <h3><i class="fas fa-map-marker-alt"></i> Coverage</h3>
                        <p>${scheme.type === 'Haryana State' ? 'All districts in Haryana' : 'All states in India'}</p>
                    </div>
                </div>
            </section>

            <!-- Eligibility Criteria -->
            <section class="scheme-eligibility">
                <h2>Eligibility Criteria</h2>
                <div class="eligibility-list">
                    <div class="eligibility-item">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <h3>MSME Registration</h3>
                            <p>Must be registered as Micro, Small, or Medium enterprise under MSME Act</p>
                        </div>
                    </div>
                    <div class="eligibility-item">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <h3>Udyam Registration</h3>
                            <p>Must have valid Udyam registration certificate</p>
                        </div>
                    </div>
                    <div class="eligibility-item">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <h3>Commercial Production</h3>
                            <p>Must have started commercial production</p>
                        </div>
                    </div>
                    <div class="eligibility-item">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <h3>GST Registration</h3>
                            <p>Must have valid GST registration</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Application Process -->
            <section class="scheme-process">
                <h2>Application Process</h2>
                <div class="process-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Check Eligibility</h3>
                            <p>Use our eligibility checker to verify your qualification for the scheme</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Prepare Documents</h3>
                            <p>Gather all required documents as per the checklist</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Submit Application</h3>
                            <p>Submit your application through our platform or directly to authorities</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h3>Track Progress</h3>
                            <p>Monitor your application status and receive updates</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Apply Now Section -->
            <section id="apply-now" class="scheme-apply">
                <h2>Ready to Apply?</h2>
                <p>Check your eligibility and start your application process</p>
                <div class="apply-actions">
                    <a href="../eligibility-check.html" class="btn btn--primary">
                        Check Eligibility <i class="fas fa-search"></i>
                    </a>
                    <a href="../dashboard.html" class="btn btn--secondary">
                        Go to Dashboard <i class="fas fa-tachometer-alt"></i>
                    </a>
                </div>
            </section>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer__content">
                <div class="footer__info">
                    <div class="footer__logo">
                        <i class="fas fa-bridge"></i>
                        <span>BharatSetu</span>
                    </div>
                    <div class="footer__contact">
                        <span><i class="fas fa-phone"></i> 7895211541</span><br>
                        <span><i class="fas fa-map-marker-alt"></i> Gurgaon, India</span>
                    </div>
                    <p class="footer__desc">
                        Simplifying government applications for Indian SMEs. One platform, multiple benefits, maximum success.
                    </p>
                </div>
                
                <div class="footer__links">
                    <div class="footer__column">
                        <h4>Services</h4>
                        <a href="../index.html#subsidies">Government Subsidies</a>
                        <a href="../index.html#subsidies">Collateral-Free Loans</a>
                        <a href="../index.html#subsidies">Payment Recovery</a>
                        <a href="../index.html#subsidies">Financial Grants</a>
                    </div>
                    <div class="footer__column">
                        <h4>Company</h4>
                        <a href="../index.html#problems">Problems We Solve</a>
                        <a href="../index.html#success">Success Stories</a>
                        <a href="../index.html#contact">Contact</a>
                        <a href="../index.html#about">About</a>
                    </div>
                    <div class="footer__column">
                        <h4>Support</h4>
                        <a href="../index.html#help">Help Center</a>
                        <a href="../index.html#tracking">Application Tracking</a>
                        <a href="../index.html#contact">Get Support</a>
                        <a href="../index.html#faq">FAQs</a>
                    </div>
                </div>
            </div>
            
            <div class="footer__bottom">
                <p>&copy; 2025 BharatSetu. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="../js/auth-service.js"></script>
    <script src="../js/utils.js"></script>
    <script src="../js/scheme-detail.js"></script>
</body>
</html>`;
}

// Generate all scheme pages
schemes.forEach(scheme => {
    const filePath = path.join(__dirname, 'schemes', `${scheme.name}.html`);
    const content = generateSchemePage(scheme);
    
    fs.writeFileSync(filePath, content);
    console.log(`Generated: ${scheme.name}.html`);
});

console.log('All scheme pages generated successfully!'); 