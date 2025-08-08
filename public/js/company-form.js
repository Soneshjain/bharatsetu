// Company Form Management
// Handles company registration and profile management

// District-Block Mapping for Haryana (shared with eligibility questionnaire)
const DISTRICT_BLOCK_MAPPING = {
    'ambala': ['Ambala', 'Barara', 'Naraingarh'],
    'bhiwani': ['Bhiwani', 'Tosham', 'Siwani', 'Loharu'],
    'charkhi-dadri': ['Charkhi Dadri', 'Badhra', 'Bawani Khera'],
    'faridabad': ['Faridabad', 'Ballabgarh', 'Badkhal'],
    'fatehabad': ['Fatehabad', 'Ratia', 'Tohana', 'Jakhal'],
    'gurugram': ['Gurugram', 'Pataudi', 'Sohna', 'Farrukhnagar'],
    'hisar': ['Hisar', 'Adampur', 'Narnaund', 'Hansi'],
    'jhajjar': ['Jhajjar', 'Beri', 'Matanhail'],
    'jind': ['Jind', 'Narwana', 'Julana', 'Safidon'],
    'kaithal': ['Kaithal', 'Guhla', 'Kalayat'],
    'karnal': ['Karnal', 'Gharaunda', 'Nilokheri', 'Indri'],
    'kurukshetra': ['Kurukshetra', 'Ladwa', 'Pehowa', 'Shahbad'],
    'mahendragarh': ['Mahendragarh', 'Narnaul', 'Ateli', 'Kanina'],
    'mewat': ['Mewat', 'Nuh', 'Firozpur Jhirka', 'Punahana'],
    'palwal': ['Palwal', 'Hodal', 'Hathin'],
    'panchkula': ['Panchkula', 'Kalka', 'Pinjore'],
    'panipat': ['Panipat', 'Samalkha', 'Israna'],
    'rewari': ['Rewari', 'Bawal', 'Jatusana'],
    'rohtak': ['Rohtak', 'Sampla', 'Lakhanmajra'],
    'sirsa': ['Sirsa', 'Ellenabad', 'Dabwali', 'Rania'],
    'sonipat': ['Sonipat', 'Gohana', 'Kharkhauda', 'Ganaur'],
    'yamunanagar': ['Yamunanagar', 'Jagadhri', 'Chhachhrauli', 'Bilaspur']
};

// Block Category Mapping for Haryana
const BLOCK_CATEGORY_MAPPING = {
    // Block A (Most developed areas)
    'gurugram': 'A',
    'faridabad': 'A',
    'panchkula': 'A',
    'panipat': 'A',
    'sonipat': 'A',
    'rohtak': 'A',
    
    // Block B (Moderately developed areas)
    'ambala': 'B',
    'karnal': 'B',
    'hisar': 'B',
    'jind': 'B',
    'kaithal': 'B',
    'kurukshetra': 'B',
    'rewari': 'B',
    'bhiwani': 'B',
    'jhajjar': 'B',
    'palwal': 'B',
    'mahendragarh': 'B',
    
    // Block C (Less developed areas)
    'fatehabad': 'C',
    'sirsa': 'C',
    'yamunanagar': 'C',
    'charkhi-dadri': 'C',
    
    // Block D (Least developed areas)
    'mewat': 'D'
};

// Function to get block category based on district
function getBlockCategory(district) {
    return BLOCK_CATEGORY_MAPPING[district] || 'B'; // Default to B if not found
}

// Make the function globally available
window.getBlockCategory = getBlockCategory;

// Function to update blocks based on selected district
function updateBlocks() {
    const districtSelect = document.getElementById('district');
    const blockSelect = document.getElementById('block');
    
    console.log('updateBlocks function called (company form)');
    console.log('District select element:', districtSelect);
    console.log('Block select element:', blockSelect);
    
    if (!districtSelect || !blockSelect) {
        console.error('District or Block select elements not found');
        return;
    }
    
    const selectedDistrict = districtSelect.value;
    console.log('Selected district:', selectedDistrict);
    
    // Clear existing options
    blockSelect.innerHTML = '<option value="">Select Block</option>';
    
    if (selectedDistrict && DISTRICT_BLOCK_MAPPING[selectedDistrict]) {
        // Add blocks for the selected district
        DISTRICT_BLOCK_MAPPING[selectedDistrict].forEach(block => {
            const option = document.createElement('option');
            option.value = block.toLowerCase().replace(/\s+/g, '-');
            option.textContent = block;
            blockSelect.appendChild(option);
        });
        
        console.log(`Updated blocks for district: ${selectedDistrict}`);
        console.log('Available blocks:', DISTRICT_BLOCK_MAPPING[selectedDistrict]);
    } else {
        console.log('No blocks found for district:', selectedDistrict);
    }
}

// Make the function globally available
window.updateBlocks = updateBlocks;

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
                block_category: getBlockCategory(formData['district']),
                commercial_production_date: formData['commercial-production-month'],
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
                window.location.href = '/user-dashboard.html';
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
            'commercial-production-month',
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