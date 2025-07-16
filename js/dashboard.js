// Dashboard Management
class Dashboard {
    constructor() {
        this.authService = window.authService;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDashboardData();
    }

    bindEvents() {
        // Initialize auth service
        if (this.authService) {
            this.authService.initGoogleAuth();
        }

        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logout-btn') {
                this.authService.logout();
                window.location.href = 'index.html';
            }
        });
    }

    async loadDashboardData() {
        if (!this.authService || !this.authService.isAuthenticated()) {
            // Redirect to login if not authenticated
            window.location.href = 'index.html';
            return;
        }

        try {
            // Load companies
            await this.loadCompanies();
            
            // Load recent activity
            await this.loadRecentActivity();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadCompanies() {
        try {
            const companies = await this.authService.getCompanies();
            const companiesList = document.getElementById('companies-list');
            
            console.log('Companies response:', companies);
            
            // Check if companies is an array
            if (!Array.isArray(companies)) {
                console.error('Companies is not an array:', companies);
                companiesList.innerHTML = '<p>No companies added yet. <a href="add-company.html">Add your first company</a> to get started!</p>';
                return;
            }
            
            if (companies.length === 0) {
                companiesList.innerHTML = '<p>No companies added yet. <a href="add-company.html">Add your first company</a> to get started!</p>';
                return;
            }

            const companiesHTML = companies.map(company => `
                <div class="company-card">
                    <h4>${company.name}</h4>
                    <p><strong>Sector:</strong> ${company.sector}</p>
                    <p><strong>District:</strong> ${company.district}</p>
                    <p><strong>Block:</strong> ${company.block}</p>
                    <p><strong>Project Cost:</strong> ₹${(company.total_project_cost / 10000000).toFixed(2)} Cr</p>
                    <div class="company-actions">
                        <a href="edit-company.html?id=${company.id}" class="btn btn--secondary btn--small">Edit</a>
                        <a href="eligibility-check.html?company=${company.id}" class="btn btn--primary btn--small">Check Eligibility</a>
                    </div>
                </div>
            `).join('');

            companiesList.innerHTML = companiesHTML;
        } catch (error) {
            console.error('Failed to load companies:', error);
            document.getElementById('companies-list').innerHTML = '<p>Failed to load companies. Please try again.</p>';
        }
    }

    async loadRecentActivity() {
        try {
            const activity = document.getElementById('recent-activity');
            
            // Load eligibility tests
            const tests = await this.authService.getEligibilityTests();
            const applications = await this.authService.getApplications();
            
            let activityHTML = '';
            
            if (tests && tests.length > 0) {
                activityHTML += '<h4>Recent Eligibility Tests</h4>';
                tests.slice(0, 3).forEach(test => {
                    activityHTML += `
                        <div class="activity-item">
                            <i class="fas fa-search"></i>
                            <div class="activity-content">
                                <p><strong>Eligibility Test</strong> - ${test.results.total_eligible} schemes eligible</p>
                                <small>${new Date(test.created_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    `;
                });
            }
            
            if (applications && applications.length > 0) {
                activityHTML += '<h4>Recent Applications</h4>';
                applications.slice(0, 3).forEach(app => {
                    activityHTML += `
                        <div class="activity-item">
                            <i class="fas fa-file-alt"></i>
                            <div class="activity-content">
                                <p><strong>${app.scheme_name}</strong> - ${app.status}</p>
                                <small>${new Date(app.created_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    `;
                });
            }
            
            if (!activityHTML) {
                activityHTML = '<p>No recent activity. Start by adding a company or checking eligibility!</p>';
            }
            
            activity.innerHTML = activityHTML;
        } catch (error) {
            console.error('Failed to load recent activity:', error);
            document.getElementById('recent-activity').innerHTML = '<p>Failed to load recent activity.</p>';
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
}); 