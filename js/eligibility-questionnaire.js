// Eligibility Questionnaire Interface
// Handles the user interface for collecting eligibility data and displaying results

// District-Block Mapping for Haryana
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
    
    console.log('updateBlocks function called');
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

// Function to apply for a specific scheme
function applyForScheme(schemeId) {
    console.log('Applying for scheme:', schemeId);
    
    // Check if user is authenticated
    if (window.authService && window.authService.isAuthenticated()) {
        // User is logged in, redirect to dashboard with scheme pre-selected
        window.location.href = `dashboard.html?scheme=${schemeId}`;
    } else {
        // User not logged in, show auth modal
        if (window.authFlow) {
            window.authFlow.showAuthModalForApply();
        } else {
            alert('Please log in to apply for this scheme.');
            // Fallback: redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }
}

// Make the function globally available
window.applyForScheme = applyForScheme;

class EligibilityQuestionnaire {
    constructor() {
        this.userData = {};
        this.engine = new EligibilityEngine();
        this.init();
    }

    init() {
        this.createQuestionnaireHTML();
        this.bindEvents();
        this.initProgressTracking();
        this.initFormAnimations();
    }

    createQuestionnaireHTML() {
        const container = document.querySelector('.eligibility-questionnaire');
        if (!container) return;

        // Add progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress';
        progressBar.innerHTML = '<div class="form-progress-bar"></div>';
        document.body.appendChild(progressBar);

        // Add animation order to form groups
        const formGroups = container.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            group.style.setProperty('--animation-order', index);
        });
    }

    bindEvents() {
        // Form submission
        const form = document.querySelector('.questionnaire-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuestionnaire();
            });
        }

        // Land ownership conditional logic
        this.initLandOwnershipLogic();

        // Real-time validation and progress tracking
        this.initRealTimeValidation();
        this.initAutoSave();
    }

    initLandOwnershipLogic() {
        const landOwnershipRadios = document.querySelectorAll('input[name="land-ownership"]');
        const ownLandQuestions = document.getElementById('own-land-questions');
        const leasedLandQuestions = document.getElementById('leased-land-questions');

        if (!landOwnershipRadios.length || !ownLandQuestions || !leasedLandQuestions) {
            console.warn('Land ownership elements not found');
            return;
        }

        landOwnershipRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                
                // Hide both sections initially
                ownLandQuestions.style.display = 'none';
                leasedLandQuestions.style.display = 'none';
                
                // Show relevant section based on selection
                if (selectedValue === 'own') {
                    ownLandQuestions.style.display = 'block';
                    // Make own land fields required
                    ownLandQuestions.querySelectorAll('input').forEach(input => {
                        input.required = true;
                    });
                    // Make leased land fields not required
                    leasedLandQuestions.querySelectorAll('input').forEach(input => {
                        input.required = false;
                    });
                } else if (selectedValue === 'leased') {
                    leasedLandQuestions.style.display = 'block';
                    // Make leased land fields required
                    leasedLandQuestions.querySelectorAll('input').forEach(input => {
                        input.required = true;
                    });
                    // Make own land fields not required
                    ownLandQuestions.querySelectorAll('input').forEach(input => {
                        input.required = false;
                    });
                }
            });
        });
    }

    initProgressTracking() {
        const form = document.querySelector('.questionnaire-form');
        const progressBar = document.querySelector('.form-progress-bar');
        
        if (!form || !progressBar) return;

        const updateProgress = () => {
            const inputs = form.querySelectorAll('input, select, textarea');
            const requiredInputs = Array.from(inputs).filter(input => input.hasAttribute('required'));
            const filledInputs = requiredInputs.filter(input => input.value.trim() !== '');
            const progress = (filledInputs.length / requiredInputs.length) * 100;
            
            progressBar.style.width = `${progress}%`;
        };

        // Update progress on any input change
        form.addEventListener('input', updateProgress);
        form.addEventListener('change', updateProgress);
        
        // Initial progress update
        updateProgress();
    }

    initFormAnimations() {
        // Add intersection observer for form sections
        const sections = document.querySelectorAll('.form-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            observer.observe(section);
        });
    }

    initRealTimeValidation() {
        const form = document.querySelector('.questionnaire-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        // Remove existing error/success states
        field.classList.remove('error', 'success');
        
        // Check if required field is empty
        if (isRequired && !value) {
            field.classList.add('error');
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Validate specific field types
        if (field.type === 'number' && value) {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                field.classList.add('error');
                this.showFieldError(field, 'Please enter a valid positive number');
                return false;
            }
        }
        
        // Add success state for valid fields
        if (value) {
            field.classList.add('success');
        }
        
        return true;
    }

    showFieldError(field, message) {
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    initAutoSave() {
        const form = document.querySelector('.questionnaire-form');
        if (!form) return;

        // Auto-save form data to localStorage
        const saveFormData = () => {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            localStorage.setItem('eligibilityFormData', JSON.stringify(data));
        };

        // Load saved form data
        const loadFormData = () => {
            const savedData = localStorage.getItem('eligibilityFormData');
            if (savedData) {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) {
                        field.value = data[key];
                        if (field.type === 'radio') {
                            const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                            if (radio) radio.checked = true;
                        }
                    }
                });
            }
        };

        // Auto-save on input change
        form.addEventListener('input', saveFormData);
        form.addEventListener('change', saveFormData);
        
        // Load saved data on page load
        loadFormData();
    }

    validateForm() {
        const form = document.querySelector('.questionnaire-form');
        console.log('Validating form');
        
        if (!form) {
            console.error('Form not found');
            return false;
        }
        
        const requiredFields = form.querySelectorAll('[required]');
        console.log('Required fields found:', requiredFields.length);
        
        let isValid = true;
        requiredFields.forEach(field => {
            console.log('Checking field:', field.name, 'Value:', field.value);
            if (!field.value) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields before proceeding.');
        }

        console.log('Validation result:', isValid);
        return isValid;
    }

    collectFormData() {
        const form = document.querySelector('.questionnaire-form');
        
        // Manually collect form data since we're using divs, not forms
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name && input.value) {
                // For radio buttons, only save the checked one
                if (input.type === 'radio') {
                    if (input.checked) {
                        this.userData[input.name] = input.value;
                    }
                } else {
                    this.userData[input.name] = input.value;
                }
            }
        });

        // Handle checkbox groups
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            const name = checkbox.name;
            if (!this.userData[name]) {
                this.userData[name] = [];
            }
            this.userData[name].push(checkbox.value);
        });

        console.log('Collected user data:', this.userData);
        return this.userData;
    }

    async submitQuestionnaire() {
        console.log('Submitting questionnaire...');
        
        if (!this.validateForm()) {
            return;
        }

        const userData = this.collectFormData();
        if (!userData) {
            console.error('Failed to collect form data');
            return;
        }

        try {
            await this.processResults(userData);
        } catch (error) {
            console.error('Error processing results:', error);
            alert('An error occurred while processing your eligibility. Please try again.');
        }
    }

    async processResults(userData) {
        console.log('Processing results for user data:', userData);
        
        // Convert user data to engine format
        const engineData = this.convertToEngineFormat(userData);
        console.log('Engine data:', engineData);
        
        // Get eligibility results
        const results = this.engine.checkAllEligibility(engineData);
        console.log('Eligibility results:', results);
        
        // Calculate benefits
        const benefits = this.engine.calculateTotalBenefits(results.eligible_schemes, engineData);
        console.log('Benefits:', benefits);
        
        // Display results
        this.displayResults(results, benefits);
    }

    convertToEngineFormat(userData) {
        // Convert form data to the format expected by the eligibility engine
        const engineData = {
            // Basic information
            commercial_production_date: userData['commercial-production-month'],
            electricity_connection_date: userData['electricity-connection-date'],
            
            // Location
            district: userData.district,
            block: userData.block,
            block_category: getBlockCategory(userData.district),
            
            // Project details - Convert Lakhs to Cr for engine compatibility
            project_type: userData['project-type'],
            land_ownership: userData['land-ownership'],
            land_investment: parseFloat(userData['land-investment']) || 0,
            machinery_investment: parseFloat(userData['machinery-investment']) || 0,
            total_project_cost: parseFloat(userData['total-project-cost']) || 0,
            
            // Land-specific details
            land_purchase_month: userData['land-purchase-month'],
            stamp_duty_paid: parseFloat(userData['stamp-duty-paid']) || 0,
            monthly_rent: parseFloat(userData['monthly-rent']) || 0,
            
            // Financial details - Convert Lakhs to Cr for engine compatibility
            has_term_loan: false, // Removed from form, default to false
            term_loan_amount: 0, // Removed from form, default to 0
            interest_rate: parseFloat(userData['interest-rate']) || 0,
            annual_turnover: parseFloat(userData['annual-turnover']) || 0,
            export_turnover: parseFloat(userData['export-turnover']) || 0,
            
            // Operational details - Convert Lakhs to Cr for engine compatibility
            connected_load: parseFloat(userData['connected-load']) || 0,
            annual_electricity_consumption: parseInt(userData['annual-electricity-consumption']) || 0,
            
            // FY25-26 Cost details - Convert Lakhs to Cr for engine compatibility
            domestic_exhibition_cost: parseFloat(userData['domestic-exhibition-cost']) || 0,
            international_exhibition_cost: parseFloat(userData['international-exhibition-cost']) || 0,
            international_airfare: parseFloat(userData['international-airfare']) || 0,
            energy_audit_cost: parseFloat(userData['energy-audit-cost']) || 0,
            water_conservation_audit_cost: parseFloat(userData['water-conservation-audit-cost']) || 0,
            energy_efficient_equipment_cost: parseFloat(userData['energy-efficient-equipment-cost']) || 0,
            quality_certification_cost: parseFloat(userData['quality-certification-cost']) || 0,
            erp_implementation_cost: parseFloat(userData['erp-implementation-cost']) || 0,
            testing_measuring_equipment_cost: parseFloat(userData['testing-measuring-equipment-cost']) || 0,
            barcoding_implementation_cost: parseFloat(userData['barcoding-implementation-cost']) || 0,
            international_patent_filing_cost: parseFloat(userData['international-patent-filing-cost']) || 0,
            national_patent_filing_cost: parseFloat(userData['national-patent-filing-cost']) || 0,
            copyright_trademark_filing_cost: parseFloat(userData['copyright-trademark-filing-cost']) || 0,
            haryana_domicile_employees: parseInt(userData['haryana-domicile-employees']) || 0,
            
            // Employee information
            total_employees: parseInt(userData['total-employees']) || 0,
            sc_st_employees: parseInt(userData['sc-st-employees']) || 0,
            women_employees: parseInt(userData['women-employees']) || 0,
            promoter_category: userData['promoter-category'],
            
            // Enterprise status - Handle new consolidated startup question
            is_startup_registered: userData['startup-status'] === 'yes' || userData['startup-status'] === 'applied',
            dpiit_recognition: userData['startup-status'] === 'yes',
            cluster_location: userData['cluster-location'],
            requires_listing: userData['requires-listing'] === 'true',
            
            // Sector information
            primary_sector: userData['primary-sector'],
            sector: userData['primary-sector'], // Map primary-sector to sector
            
            // Demo-friendly defaults (for eligibility checker)
            has_urc: true, // Assume URC for demo
            has_hum: true, // Assume HUM for demo
            has_udyam: true, // Assume Udyam registration for demo
            age_above_18: true, // Assume age requirement met
            technology_upgradation: true, // Assume technology upgradation
            requires_cloud_erp: true, // Assume cloud ERP for ICT schemes
            has_spv: false, // SPV not required for most schemes
            number_of_units: 1, // Default to 1 unit
        };

        // Map project type values to engine format
        if (engineData.project_type === 'upgrade') {
            engineData.project_type = 'modernization'; // Map upgrade to modernization for engine compatibility
        } else if (engineData.project_type === 'expansion') {
            engineData.project_type = 'expansion'; // Keep expansion as is
        }

        // Calculate MSME type based on investment (convert Lakhs to Cr for calculation)
        const totalInvestment = engineData.land_investment + engineData.machinery_investment;
        if (totalInvestment <= 1) {
            engineData.msme_type = 'micro';
            engineData.enterprise_type = 'micro';
        } else if (totalInvestment <= 10) {
            engineData.msme_type = 'small';
            engineData.enterprise_type = 'small';
        } else if (totalInvestment <= 50) {
            engineData.msme_type = 'medium';
            engineData.enterprise_type = 'medium';
        } else {
            engineData.msme_type = 'large';
            engineData.enterprise_type = 'large';
        }

        // Set demo-friendly values for calculations (convert Lakhs to Cr)
        if (engineData.total_project_cost === 0) {
            engineData.total_project_cost = 0.05; // Default 5 Lakhs = 0.05 Cr for demo
        }
        if (engineData.annual_turnover === 0) {
            engineData.annual_turnover = 0.1; // Default 10 Lakhs = 0.1 Cr annual turnover
        }
        if (engineData.interest_rate === 0) {
            engineData.interest_rate = 12; // Default 12% interest rate
        }
        if (engineData.total_employees === 0) {
            engineData.total_employees = 10; // Default 10 employees
        }
        // Demo-friendly defaults for new cost fields (convert Lakhs to Cr)
        if (engineData.domestic_exhibition_cost === 0) {
            engineData.domestic_exhibition_cost = 0.01; // Default 1 Lakh = 0.01 Cr
        }
        if (engineData.international_exhibition_cost === 0) {
            engineData.international_exhibition_cost = 0.05; // Default 5 Lakhs = 0.05 Cr
        }
        if (engineData.international_airfare === 0) {
            engineData.international_airfare = 0.02; // Default 2 Lakhs = 0.02 Cr
        }
        if (engineData.energy_audit_cost === 0) {
            engineData.energy_audit_cost = 0.005; // Default 0.5 Lakhs = 0.005 Cr
        }
        if (engineData.water_conservation_audit_cost === 0) {
            engineData.water_conservation_audit_cost = 0.003; // Default 0.3 Lakhs = 0.003 Cr
        }
        if (engineData.energy_efficient_equipment_cost === 0) {
            engineData.energy_efficient_equipment_cost = 0.03; // Default 3 Lakhs = 0.03 Cr
        }
        if (engineData.quality_certification_cost === 0) {
            engineData.quality_certification_cost = 0.003; // Default 0.3 Lakhs = 0.003 Cr
        }
        if (engineData.erp_implementation_cost === 0) {
            engineData.erp_implementation_cost = 0.05; // Default 5 Lakhs = 0.05 Cr
        }
        if (engineData.testing_measuring_equipment_cost === 0) {
            engineData.testing_measuring_equipment_cost = 0.008; // Default 0.8 Lakhs = 0.008 Cr
        }
        if (engineData.barcoding_implementation_cost === 0) {
            engineData.barcoding_implementation_cost = 0.002; // Default 0.2 Lakhs = 0.002 Cr
        }
        if (engineData.international_patent_filing_cost === 0) {
            engineData.international_patent_filing_cost = 0.015; // Default 1.5 Lakhs = 0.015 Cr
        }
        if (engineData.national_patent_filing_cost === 0) {
            engineData.national_patent_filing_cost = 0.008; // Default 0.8 Lakhs = 0.008 Cr
        }
        if (engineData.copyright_trademark_filing_cost === 0) {
            engineData.copyright_trademark_filing_cost = 0.005; // Default 0.5 Lakhs = 0.005 Cr
        }
        if (engineData.haryana_domicile_employees === 0) {
            engineData.haryana_domicile_employees = 5; // Default 5 employees
        }

        if (engineData.land_investment === 0) {
            engineData.land_investment = 0.02; // Default 2 Lakhs = 0.02 Cr land investment
        }
        if (engineData.machinery_investment === 0) {
            engineData.machinery_investment = 0.03; // Default 3 Lakhs = 0.03 Cr machinery investment
        }

        console.log('Converted engine data:', engineData);
        return engineData;
    }

    displayResults(results, benefits) {
        const resultsContainer = document.getElementById('eligibility-results');
        if (!resultsContainer) {
            console.error('Results container not found');
            return;
        }

        // Show results container
        resultsContainer.style.display = 'block';

        // Calculate total benefits
        const totalBenefits = benefits.total_value || 0;

        // Create results HTML
        let resultsHTML = `
            <div class="results-summary">
                <h4>Eligibility Summary</h4>
                <p>You are eligible for <strong>${results.total_eligible}</strong> out of <strong>${results.total_schemes}</strong> schemes</p>
                <p class="total-benefit">Total potential benefits: <strong>₹${totalBenefits.toLocaleString()}</strong></p>
            </div>
        `;

        // Add eligible schemes
        if (results.eligible_schemes && results.eligible_schemes.length > 0) {
            resultsHTML += '<div class="eligible-schemes"><h4>Eligible Schemes:</h4>';
            
            results.eligible_schemes.forEach((eligibleScheme, index) => {
                const benefit = benefits.benefits_breakdown[index] || { 
                    scheme_name: eligibleScheme.scheme.name,
                    benefit_description: 'Benefit calculation pending',
                    estimated_value: 0
                };
                
                resultsHTML += `
                    <div class="scheme-result">
                        <h5>${eligibleScheme.scheme.name}</h5>
                        <p><strong>Benefit:</strong> ₹${benefit.estimated_value.toLocaleString()}</p>
                        <p><strong>Description:</strong> ${benefit.benefit_description}</p>
                        <p><strong>Documents Required:</strong> ${eligibleScheme.documents ? eligibleScheme.documents.join(', ') : 'Standard documents'}</p>
                        <button onclick="applyForScheme('${eligibleScheme.scheme.id}')" class="btn btn--primary">Apply Now</button>
                    </div>
                `;
            });
            
            resultsHTML += '</div>';
        } else {
            resultsHTML += '<p>No eligible schemes found for your current profile. Please check your inputs or contact us for guidance.</p>';
        }

        resultsContainer.innerHTML = resultsHTML;
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the questionnaire when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new EligibilityQuestionnaire();
});

 