// Company Form Management
class CompanyForm {
    constructor() {
        this.authService = window.authService;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthentication();
    }

    bindEvents() {
        // Initialize auth service
        if (this.authService) {
            this.authService.initGoogleAuth();
        }

        // Form submission
        const form = document.getElementById('company-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitCompany();
            });
        }

        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logout-btn') {
                this.authService.logout();
                window.location.href = 'index.html';
            }
        });
    }

    checkAuthentication() {
        if (!this.authService || !this.authService.isAuthenticated()) {
            // Redirect to login if not authenticated
            window.location.href = 'index.html';
            return;
        }
    }

    async submitCompany() {
        try {
            const formData = this.collectFormData();
            
            if (!this.validateForm(formData)) {
                return;
            }

            // Show loading state
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Adding Company...';
            submitBtn.disabled = true;

            // Create company
            const companyData = {
                name: formData['company-name'],
                registration_number: formData['registration-number'] || '',
                enterprise_type: 'MSME',
                sector: formData['primary-sector'],
                district: formData['district'],
                block: formData['block'],
                block_category: this.getBlockCategory(formData['district'], formData['block']),
                commercial_production_date: formData['commercial-production-date'],
                electricity_connection_date: formData['electricity-connection-date'] || null,
                project_type: formData['project-type'],
                land_investment: parseFloat(formData['land-investment']) || 0,
                machinery_investment: parseFloat(formData['machinery-investment']) || 0,
                total_project_cost: parseFloat(formData['total-project-cost']) || 0,
                has_term_loan: formData['has-term-loan'] === 'true',
                term_loan_amount: parseFloat(formData['term-loan-amount']) || 0,
                interest_rate: parseFloat(formData['interest-rate']) || 0,
                annual_turnover: parseFloat(formData['annual-turnover']) || 0
            };

            const result = await this.authService.createCompany(companyData);
            
            // Show success message
            this.showSuccess('Company added successfully!');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            console.error('Failed to add company:', error);
            this.showError('Failed to add company. Please try again.');
            
            // Reset button
            const submitBtn = document.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Add Company';
            submitBtn.disabled = false;
        }
    }

    collectFormData() {
        const form = document.getElementById('company-form');
        const formData = {};
        
        // Collect all form inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.name] = input.value;
            }
        });
        
        return formData;
    }

    validateForm(formData) {
        const requiredFields = [
            'company-name',
            'primary-sector',
            'district',
            'block',
            'commercial-production-date',
            'project-type',
            'land-investment',
            'machinery-investment',
            'total-project-cost'
        ];

        for (const field of requiredFields) {
            if (!formData[field] || formData[field].trim() === '') {
                this.showError(`Please fill in ${field.replace('-', ' ')}`);
                return false;
            }
        }

        // Validate numeric fields
        const numericFields = ['land-investment', 'machinery-investment', 'total-project-cost'];
        for (const field of numericFields) {
            if (isNaN(parseFloat(formData[field])) || parseFloat(formData[field]) <= 0) {
                this.showError(`Please enter a valid amount for ${field.replace('-', ' ')}`);
                return false;
            }
        }

        return true;
    }

    getBlockCategory(district, block) {
        // This would need to be implemented based on your district-block mapping
        // For now, return a default value
        return 'B';
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize company form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.companyForm = new CompanyForm();
}); 