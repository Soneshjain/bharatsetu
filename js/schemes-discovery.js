// ===== SCHEMES DISCOVERY PAGE FUNCTIONALITY =====

class SchemesDiscovery {
    constructor() {
        this.schemes = [];
        this.filteredSchemes = [];
        this.currentPage = 1;
        this.schemesPerPage = 8;
        this.currentFilters = {
            search: '',
            state: 'all',
            industry: 'all',
            grant: 'all',
            type: 'all',
            investment: 'all',
            status: 'all',
            category: 'all'
        };
        
        this.init();
    }
    
    init() {
        this.loadSchemes();
        this.setupEventListeners();
        this.setupHeroAnimations();
        this.renderSchemes();
        this.initFiltersDrawer();
    }
    
    loadSchemes() {
        // Sample scheme data reflecting DB fields
        this.schemes = [
            {
                scheme_id: 'HR-ICT-001',
                scheme_name: 'ICT Promotion Scheme',
                ministry: 'Ministry of MSME',
                department: 'Department of Industries, Haryana',
                launch_date: '2023-04-01',
                last_updated: '2025-02-15',
                status: 'open',
                short_description: 'ERP/ICT adoption support for MSMEs.',
                long_description: 'Financial support to adopt ERP and ICT solutions to enhance productivity and competitiveness for MSMEs in Haryana.',
                objectives: 'Promote technology adoption',
                scheme_type: 'subsidy',
                category: 'technology',
                budget_allocation: '₹200 Cr',
                max_benefit_amount: '₹50 Lakh',
                benefit_percentage: 50,
                coverage_type: 'state',
                states_covered: ['haryana'],
                districts_covered: [],
                official_website: 'https://haryana.gov.in/ict',
                application_portal: 'https://apply.haryana.gov.in',
                guidelines_pdf_url: 'https://haryana.gov.in/ict-guidelines.pdf',
                source_url: 'https://haryana.gov.in/ict-source',
                last_verified_date: '2025-02-15',
                data_quality_score: 0.92,
                created_at: '2023-04-01',
                updated_at: '2025-02-15'
            },
            {
                scheme_id: 'IN-SFURTI-002',
                scheme_name: 'Mini-SFURTI',
                ministry: 'Ministry of MSME',
                department: 'SFURTI Division',
                launch_date: '2022-07-01',
                last_updated: '2025-01-10',
                status: 'open',
                short_description: 'Traditional industries cluster development.',
                long_description: 'Support for traditional industries to form clusters, improve infrastructure, and enhance market access.',
                objectives: 'Boost traditional clusters',
                scheme_type: 'subsidy',
                category: 'manufacturing',
                budget_allocation: '₹500 Cr',
                max_benefit_amount: '₹5 Cr',
                benefit_percentage: 75,
                coverage_type: 'national',
                states_covered: ['national'],
                districts_covered: [],
                official_website: 'https://msme.gov.in/sfurti',
                application_portal: 'https://sfurti.msme.gov.in',
                guidelines_pdf_url: 'https://msme.gov.in/sfurti-guidelines.pdf',
                source_url: 'https://msme.gov.in/sfurti',
                last_verified_date: '2025-01-10',
                data_quality_score: 0.88,
                created_at: '2022-07-01',
                updated_at: '2025-01-10'
            },
            {
                scheme_id: 'HR-ENERGY-003',
                scheme_name: 'Electricity Duty Reimbursement',
                ministry: 'State Energy Department',
                department: 'Haryana Energy',
                launch_date: '2021-01-01',
                last_updated: '2024-12-01',
                status: 'year-round',
                short_description: '100% electricity duty reimbursement for 7 years.',
                long_description: 'Reimbursement to eligible industrial units on electricity duty paid for 7 years from date of commercial production.',
                objectives: 'Reduce power cost burden',
                scheme_type: 'reimbursement',
                category: 'energy',
                budget_allocation: '₹150 Cr',
                max_benefit_amount: '—',
                benefit_percentage: 100,
                coverage_type: 'state',
                states_covered: ['haryana'],
                districts_covered: [],
                official_website: 'https://haryana.gov.in/energy',
                application_portal: 'https://apply.haryana.gov.in',
                guidelines_pdf_url: 'https://haryana.gov.in/energy-guidelines.pdf',
                source_url: 'https://haryana.gov.in/energy-source',
                last_verified_date: '2024-12-01',
                data_quality_score: 0.9,
                created_at: '2021-01-01',
                updated_at: '2024-12-01'
            }
        ];
        
        this.filteredSchemes = [...this.schemes];
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('scheme-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        // Filter selects
        const filterSelects = [
            'state-filter',
            'industry-filter',
            'grant-filter',
            'type-filter',
            'investment-filter',
            'status-filter'
        ];
        
        filterSelects.forEach(filterId => {
            const select = document.getElementById(filterId);
            if (select) {
                select.addEventListener('change', (e) => {
                    const filterKey = filterId.replace('-filter', '');
                    this.currentFilters[filterKey] = e.target.value;
                    this.applyFilters();
                });
            }
        });
        
        // Removed filter tabs (quick pills)
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
        
        // Apply filters button
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        // Sort select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortSchemes(e.target.value);
            });
        }
        
        // Pagination buttons
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousPage();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextPage();
            });
        }
        
        // Hero CTA buttons
        const heroStartSearchBtn = document.getElementById('hero-start-search');
        const heroWatchDemoBtn = document.getElementById('hero-watch-demo');
        
        if (heroStartSearchBtn) {
            heroStartSearchBtn.addEventListener('click', () => {
                this.scrollToFilters();
            });
        }
        
        if (heroWatchDemoBtn) {
            heroWatchDemoBtn.addEventListener('click', () => {
                this.showDemoModal();
            });
        }
        
        // Scroll indicator
        const scrollIndicator = document.querySelector('.schemes-hero__scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                this.scrollToFilters();
            });
        }
    }
    
    initFiltersDrawer() {
        const openBtn = document.getElementById('open-filters-drawer');
        const drawer = document.getElementById('filters-drawer');
        const closeBtn = document.getElementById('filters-drawer-close');
        
        if (!openBtn || !drawer) return;
        
        const openDrawer = () => {
            drawer.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        
        const closeDrawer = () => {
            drawer.classList.remove('active');
            document.body.style.overflow = '';
        };
        
        openBtn.addEventListener('click', openDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        
        drawer.addEventListener('click', (e) => {
            if (e.target === drawer) closeDrawer();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('active')) {
                closeDrawer();
            }
        });
        
        const applyBtn = document.getElementById('apply-filters');
        if (applyBtn) applyBtn.addEventListener('click', closeDrawer);
    }
    
    applyFilters() {
        this.filteredSchemes = this.schemes.filter(scheme => {
            // Search over meaningful fields
            if (this.currentFilters.search) {
                const q = this.currentFilters.search;
                const haystack = [
                    scheme.scheme_name,
                    scheme.short_description,
                    scheme.long_description,
                    scheme.ministry,
                    scheme.department
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            
            // State filter via states_covered, allow 'national'
            if (this.currentFilters.state !== 'all') {
                const states = Array.isArray(scheme.states_covered) ? scheme.states_covered : [];
                if (!(states.includes(this.currentFilters.state) || states.includes('national'))) return false;
            }
            
            // Industry filter (map to category)
            if (this.currentFilters.industry !== 'all' && scheme.category !== this.currentFilters.industry) {
                return false;
            }
            
            // Grant filter mapped to benefit percentage or fixed amount
            if (this.currentFilters.grant !== 'all') {
                const pct = Number(scheme.benefit_percentage || 0);
                const hasFixed = !!(scheme.max_benefit_amount && scheme.max_benefit_amount !== '—');
                const r = this.currentFilters.grant;
                const inRange = (
                    (r === 'fixed-amount' && hasFixed && !pct) ||
                    (r === '0-25' && pct > 0 && pct <= 25) ||
                    (r === '25-50' && pct > 25 && pct <= 50) ||
                    (r === '50-75' && pct > 50 && pct <= 75) ||
                    (r === '75-100' && pct > 75 && pct <= 100) ||
                    (r === '100' && pct === 100)
                );
                if (!inRange) return false;
            }
            
            // Type filter
            if (this.currentFilters.type !== 'all' && scheme.scheme_type !== this.currentFilters.type) {
                return false;
            }
            
            // Investment filter (not available in sample data) -> skip or fail if requested
            if (this.currentFilters.investment !== 'all') {
                // No investment granularity yet; do not filter out by default
            }
            
            // Status filter
            if (this.currentFilters.status !== 'all' && scheme.status !== this.currentFilters.status) {
                return false;
            }
            
            // Category filter
            if (this.currentFilters.category !== 'all' && scheme.category !== this.currentFilters.category) {
                return false;
            }
            
            return true;
        });
        
        this.currentPage = 1;
        this.renderSchemes();
        this.updateResultsCount();
    }
    
    clearFilters() {
        this.currentFilters = {
            search: '',
            state: 'all',
            industry: 'all',
            grant: 'all',
            type: 'all',
            investment: 'all',
            status: 'all',
            category: 'all'
        };
        
        // Reset form elements
        const searchInput = document.getElementById('scheme-search');
        if (searchInput) searchInput.value = '';
        
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.value = 'all';
        });
        
        // Removed quick pills; ensure category stays 'all'
        
        this.applyFilters();
    }
    
    sortSchemes(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredSchemes.sort((a, b) => (a.scheme_name || '').localeCompare(b.scheme_name || ''));
                break;
            case 'benefit':
                this.filteredSchemes.sort((a, b) => {
                    const pctA = Number(a.benefit_percentage || 0);
                    const pctB = Number(b.benefit_percentage || 0);
                    return pctB - pctA;
                });
                break;
            case 'deadline':
                // Use last_updated as proxy for freshness
                this.filteredSchemes.sort((a, b) => new Date(b.last_updated || 0) - new Date(a.last_updated || 0));
                break;
            case 'popular':
                // Keep original order for now
                break;
        }
        
        this.renderSchemes();
    }
    
    extractBenefitNumber(benefit) {
        const match = benefit.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }
    
    renderSchemes() {
        const grid = document.getElementById('schemes-grid');
        if (!grid) return;
        
        const startIndex = (this.currentPage - 1) * this.schemesPerPage;
        const endIndex = startIndex + this.schemesPerPage;
        const schemesToShow = this.filteredSchemes.slice(startIndex, endIndex);
        
        grid.innerHTML = schemesToShow.map(scheme => this.createSchemeCard(scheme)).join('');
        
        this.updatePagination();
        this.wireCardToggles();
    }
    
    createSchemeCard(scheme) {
        const coverage = scheme.coverage_type === 'national' ? 'National' : this.formatStateName((scheme.states_covered?.[0]) || 'national');
        const benefitPrimary = scheme.max_benefit_amount && scheme.max_benefit_amount !== '—' ? scheme.max_benefit_amount : (scheme.benefit_percentage ? `${scheme.benefit_percentage}%` : 'Benefit');
        const verified = scheme.last_verified_date ? `Verified: ${scheme.last_verified_date}` : '';
        const portalLink = scheme.application_portal ? `<a href="${scheme.application_portal}" target="_blank" rel="noopener" class="scheme-card__action btn btn--primary">Apply</a>` : '';
        const guideLink = scheme.guidelines_pdf_url ? `<a href="${scheme.guidelines_pdf_url}" target="_blank" rel="noopener" class="scheme-card__link">Guidelines</a>` : '';
        return `
            <div class="scheme-card scheme-card--expandable" data-scheme-id="${scheme.scheme_id}">
                <div class="scheme-card__header">
                    <div class="scheme-card__title">${scheme.scheme_name}</div>
                    <div class="scheme-card__meta-row">
                        <span class="scheme-card__chip">${this.formatTypeName(scheme.scheme_type)}</span>
                        <span class="scheme-card__chip">${coverage}</span>
                        <span class="scheme-card__chip scheme-card__chip--status">${this.formatStatus(scheme.status)}</span>
                        ${verified ? `<span class="scheme-card__chip scheme-card__chip--muted">${verified}</span>` : ''}
                    </div>
                    <div class="scheme-card__desc">${scheme.short_description || ''}</div>
                    <div class="scheme-card__benefit">
                        <span class="scheme-card__benefit-label">Benefit</span>
                        <span class="scheme-card__benefit-value">${benefitPrimary}</span>
                    </div>
                </div>
                <div class="scheme-card__footer">
                    <button class="scheme-card__toggle btn btn--secondary" data-toggle>View details</button>
                    <div class="scheme-card__actions">
                        ${portalLink}
                        ${guideLink}
                    </div>
                </div>
                <div class="scheme-card__details" hidden>
                    <div class="details__grid">
                        <div class="details__item"><span>Ministry</span><strong>${scheme.ministry || '-'}</strong></div>
                        <div class="details__item"><span>Department</span><strong>${scheme.department || '-'}</strong></div>
                        <div class="details__item"><span>Launched</span><strong>${this.formatDate(scheme.launch_date)}</strong></div>
                        <div class="details__item"><span>Updated</span><strong>${this.formatDate(scheme.last_updated)}</strong></div>
                        <div class="details__item"><span>Budget</span><strong>${scheme.budget_allocation || '-'}</strong></div>
                        <div class="details__item"><span>Coverage</span><strong>${scheme.coverage_type || '-'}</strong></div>
                        ${scheme.benefit_percentage ? `<div class="details__item"><span>Benefit %</span><strong>${scheme.benefit_percentage}%</strong></div>` : ''}
                    </div>
                    ${scheme.long_description ? `<div class="details__long">${scheme.long_description}</div>` : ''}
                    ${scheme.objectives ? `<div class="details__objectives"><span>Objectives</span><p>${scheme.objectives}</p></div>` : ''}
                    <div class="details__links">
                        ${scheme.official_website ? `<a href="${scheme.official_website}" target="_blank" rel="noopener">Official site</a>` : ''}
                        ${scheme.source_url ? `<a href="${scheme.source_url}" target="_blank" rel="noopener">Source</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    formatStatus(status) {
        const map = { open: 'Open', 'year-round': 'Year Round', upcoming: 'Upcoming', closed: 'Closed' };
        return map[status] || status || '-';
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
        try { const d = new Date(dateStr); return d.toLocaleDateString(); } catch { return dateStr; }
    }
    
    formatStateName(state) {
        const stateNames = {
            'haryana': 'Haryana',
            'delhi': 'Delhi',
            'punjab': 'Punjab',
            'rajasthan': 'Rajasthan',
            'uttar-pradesh': 'Uttar Pradesh',
            'maharashtra': 'Maharashtra',
            'karnataka': 'Karnataka',
            'tamil-nadu': 'Tamil Nadu',
            'gujarat': 'Gujarat',
            'national': 'National'
        };
        return stateNames[state] || state;
    }
    
    formatTypeName(type) {
        const typeNames = {
            'subsidy': 'Subsidy',
            'grant': 'Grant',
            'reimbursement': 'Reimbursement',
            'incentive': 'Incentive',
            'loan': 'Loan Support',
            'exemption': 'Tax Exemption'
        };
        return typeNames[type] || type;
    }
    
    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `Showing ${this.filteredSchemes.length} Government Schemes`;
        }
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredSchemes.length / this.schemesPerPage) || 1;
        const currentPageEl = document.getElementById('current-page');
        const totalPagesEl = document.getElementById('total-pages');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (currentPageEl) currentPageEl.textContent = this.currentPage;
        if (totalPagesEl) totalPagesEl.textContent = totalPages;
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderSchemes();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredSchemes.length / this.schemesPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderSchemes();
        }
    }
    
    setupHeroAnimations() {
        // Animate stats on scroll into view
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        const statsContainer = document.querySelector('.schemes-hero__stats');
        if (statsContainer) {
            observer.observe(statsContainer);
        }
        
        // Add scroll effect to hero
        window.addEventListener('scroll', () => {
            this.handleHeroScroll();
        });
    }
    
    animateStats() {
        const statNumbers = document.querySelectorAll('.stat__number[data-count]');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const suffix = stat.nextElementSibling;
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                if (target >= 1000) {
                    stat.textContent = Math.floor(current / 1000) + 'K';
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 16);
        });
    }
    
    handleHeroScroll() {
        const hero = document.querySelector('.schemes-hero');
        if (!hero) return;
        
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        const opacity = Math.max(0, 1 - (scrollY / heroHeight));
        
        // Parallax effect
        const particles = document.querySelector('.schemes-hero__particles');
        if (particles) {
            particles.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
        
        // Fade out scroll indicator
        const scrollIndicator = document.querySelector('.schemes-hero__scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.opacity = opacity;
        }
    }
    
    scrollToFilters() {
        const filtersSection = document.querySelector('.schemes-filter');
        if (filtersSection) {
            filtersSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Focus on search input after scrolling
            setTimeout(() => {
                const searchInput = document.getElementById('scheme-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 800);
        }
    }

    // After render, wire expand/collapse handlers
    wireCardToggles() {
        document.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.scheme-card--expandable');
                const details = card?.querySelector('.scheme-card__details');
                if (!details) return;
                const isHidden = details.hasAttribute('hidden');
                if (isHidden) {
                    details.removeAttribute('hidden');
                    btn.textContent = 'Hide details';
                } else {
                    details.setAttribute('hidden', '');
                    btn.textContent = 'View details';
                }
            });
        });
    }
    
    showDemoModal() {
        // Create and show demo modal
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        modal.innerHTML = `
            <div class="demo-modal__overlay">
                <div class="demo-modal__content">
                    <button class="demo-modal__close">&times;</button>
                    <div class="demo-modal__video">
                        <div class="demo-modal__placeholder">
                            <i class="fas fa-play-circle"></i>
                            <h3>How to Find Your Perfect Scheme</h3>
                            <p>Watch this 2-minute demo to learn how to use our advanced filters and find the best government schemes for your business.</p>
                            <button class="btn btn--primary">
                                <i class="fas fa-play"></i>
                                Start Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.demo-modal__close');
        const overlay = modal.querySelector('.demo-modal__overlay');
        
        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        };
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SchemesDiscovery();
});
