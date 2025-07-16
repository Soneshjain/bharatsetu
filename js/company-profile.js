// Company Profile Management
class CompanyProfile {
    constructor() {
        this.authService = window.authService;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Add profile management to user menu
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUserMenu();
        });
    }

    updateUserMenu() {
        const userSection = document.getElementById('user-section');
        if (userSection && this.authService && this.authService.isAuthenticated()) {
            // Add profile management button
            const profileBtn = document.createElement('button');
            profileBtn.className = 'btn btn--secondary';
            profileBtn.textContent = 'My Profile';
            profileBtn.onclick = () => this.showProfileModal();
            
            const userInfo = userSection.querySelector('.user-info');
            if (userInfo) {
                userInfo.appendChild(profileBtn);
            }
        }
    }

    async showProfileModal() {
        try {
            // Get user's companies
            const companies = await this.authService.getCompanies();
            
            const modal = document.createElement('div');
            modal.id = 'profile-modal';
            modal.className = 'modal';
            modal.style.display = 'flex';
            
            modal.innerHTML = `
                <div class="modal-content profile-modal">
                    <span class="modal-close" id="profile-modal-close">&times;</span>
                    <div class="profile-modal-content">
                        <h2>My Profile</h2>
                        <p>Welcome, ${this.authService.user.name}!</p>
                        
                        <div class="profile-sections">
                            <div class="profile-section">
                                <h3>My Companies</h3>
                                <div id="companies-list">
                                    ${this.renderCompaniesList(companies)}
                                </div>
                                <button class="btn btn--primary" onclick="companyProfile.addNewCompany()">
                                    Add New Company
                                </button>
                            </div>
                            
                            <div class="profile-section">
                                <h3>Recent Eligibility Tests</h3>
                                <div id="eligibility-tests">
                                    ${await this.renderEligibilityTests()}
                                </div>
                            </div>
                            
                            <div class="profile-section">
                                <h3>My Applications</h3>
                                <div id="applications">
                                    ${await this.renderApplications()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Close modal functionality
            const closeBtn = modal.querySelector('#profile-modal-close');
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        } catch (error) {
            console.error('Failed to show profile modal:', error);
            this.showError('Failed to load profile data');
        }
    }

    renderCompaniesList(companies) {
        if (!companies || companies.length === 0) {
            return '<p>No companies added yet. Add your first company to get started!</p>';
        }

        return companies.map(company => `
            <div class="company-card">
                <h4>${company.name}</h4>
                <p><strong>Sector:</strong> ${company.sector}</p>
                <p><strong>District:</strong> ${company.district}</p>
                <p><strong>Block:</strong> ${company.block}</p>
                <p><strong>Project Cost:</strong> ₹${(company.total_project_cost / 10000000).toFixed(2)} Cr</p>
                <button class="btn btn--secondary btn--small" onclick="companyProfile.editCompany('${company.id}')">
                    Edit
                </button>
            </div>
        `).join('');
    }

    async renderEligibilityTests() {
        try {
            const tests = await this.authService.getEligibilityTests();
            if (!tests || tests.length === 0) {
                return '<p>No eligibility tests completed yet.</p>';
            }

            return tests.slice(0, 5).map(test => `
                <div class="test-card">
                    <h4>Test on ${new Date(test.created_at).toLocaleDateString()}</h4>
                    <p><strong>Eligible Schemes:</strong> ${test.results.total_eligible}</p>
                    <p><strong>Total Value:</strong> ₹${(test.results.total_value / 10000000).toFixed(2)} Cr</p>
                    <button class="btn btn--secondary btn--small" onclick="companyProfile.viewTestDetails('${test.id}')">
                        View Details
                    </button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load eligibility tests:', error);
            return '<p>Failed to load eligibility tests.</p>';
        }
    }

    async renderApplications() {
        try {
            const applications = await this.authService.getApplications();
            if (!applications || applications.length === 0) {
                return '<p>No applications submitted yet.</p>';
            }

            return applications.slice(0, 5).map(app => `
                <div class="application-card">
                    <h4>${app.scheme_name}</h4>
                    <p><strong>Status:</strong> ${app.status}</p>
                    <p><strong>Submitted:</strong> ${new Date(app.created_at).toLocaleDateString()}</p>
                    <button class="btn btn--secondary btn--small" onclick="companyProfile.viewApplication('${app.id}')">
                        View Details
                    </button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load applications:', error);
            return '<p>Failed to load applications.</p>';
        }
    }

    addNewCompany() {
        // Close profile modal
        const modal = document.getElementById('profile-modal');
        if (modal) modal.remove();
        
        // Open eligibility modal to add new company
        const eligibilityModal = document.getElementById('eligibility-modal');
        if (eligibilityModal) {
            eligibilityModal.style.display = 'flex';
        }
        
        // Initialize eligibility questionnaire
        if (!window.eligibilityQuestionnaire) {
            window.eligibilityQuestionnaire = new EligibilityQuestionnaire();
        }
    }

    editCompany(companyId) {
        // TODO: Implement company editing
        console.log('Edit company:', companyId);
        this.showError('Company editing coming soon!');
    }

    viewTestDetails(testId) {
        // TODO: Implement test details view
        console.log('View test details:', testId);
        this.showError('Test details view coming soon!');
    }

    viewApplication(applicationId) {
        // TODO: Implement application details view
        console.log('View application:', applicationId);
        this.showError('Application details view coming soon!');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize company profile when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.companyProfile = new CompanyProfile();
}); 