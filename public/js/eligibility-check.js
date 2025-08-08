// Eligibility Check Page JavaScript
// Handles the eligibility check page functionality

class EligibilityCheck {
    constructor() {
        this.init();
    }

    init() {
        console.log('Eligibility Check page initialized');
        
        // Check if user is authenticated
        this.checkAuthentication();
        
        // Initialize company selection if user is logged in
        this.initCompanySelection();
    }

    checkAuthentication() {
        if (window.authService && window.authService.isAuthenticated()) {
            console.log('User is authenticated, showing company selection');
            this.showCompanySelection();
        } else {
            console.log('User not authenticated, showing eligibility form directly');
            this.showEligibilityForm();
        }
    }

    showCompanySelection() {
        const companySelection = document.getElementById('company-selection');
        const eligibilityModal = document.getElementById('eligibility-modal');
        
        if (companySelection) {
            companySelection.style.display = 'block';
        }
        
        if (eligibilityModal) {
            eligibilityModal.style.display = 'none';
        }
        
        // Load user's companies
        this.loadUserCompanies();
    }

    showEligibilityForm() {
        const companySelection = document.getElementById('company-selection');
        const eligibilityModal = document.getElementById('eligibility-modal');
        
        if (companySelection) {
            companySelection.style.display = 'none';
        }
        
        if (eligibilityModal) {
            eligibilityModal.style.display = 'block';
        }
    }

    async loadUserCompanies() {
        try {
            // This would typically fetch from the server
            // For now, we'll show a demo company
            const companiesDropdown = document.getElementById('selected-company');
            if (companiesDropdown) {
                companiesDropdown.innerHTML = `
                    <option value="">Select a company</option>
                    <option value="demo-company">Demo Company (Food Processing)</option>
                `;
            }
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    }

    initCompanySelection() {
        const startButton = document.querySelector('#company-selection .btn--primary');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startEligibilityCheck();
            });
        }
    }

    startEligibilityCheck() {
        const selectedCompany = document.getElementById('selected-company');
        if (selectedCompany && selectedCompany.value) {
            console.log('Starting eligibility check for company:', selectedCompany.value);
            this.showEligibilityForm();
        } else {
            alert('Please select a company first');
        }
    }
}

// Global function for the onclick handler
function startEligibilityCheck() {
    if (window.eligibilityCheck) {
        window.eligibilityCheck.startEligibilityCheck();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.eligibilityCheck = new EligibilityCheck();
}); 