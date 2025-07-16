// Eligibility Questionnaire Interface
// Handles the user interface for collecting eligibility data and displaying results

class EligibilityQuestionnaire {
    constructor() {
        this.engine = new EligibilityEngine();
        this.userData = {};
        this.init();
    }

    init() {
        this.createQuestionnaireHTML();
        this.bindEvents();
    }

    createQuestionnaireHTML() {
        // The form HTML is already present in the page, so we don't need to create it
        // Just ensure the form is properly initialized
        const form = document.querySelector('.questionnaire-form');
        if (!form) {
            console.error('Questionnaire form not found');
            return;
        }
        
        // Add form submission handler
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitQuestionnaire();
            });
        }
    }

    bindEvents() {
        // Submit button
        const submitBtn = document.querySelector('.questionnaire-form button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Submit button clicked');
                this.submitQuestionnaire();
            });
        }
        
        console.log('Event listeners bound successfully');
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
        const results = this.engine.checkEligibility(engineData);
        console.log('Eligibility results:', results);
        
        // Calculate benefits
        const benefits = this.engine.calculateBenefits(engineData, results);
        console.log('Benefits:', benefits);
        
        // Display results
        this.displayResults(results, benefits);
    }

    convertToEngineFormat(userData) {
        // Convert form data to the format expected by the eligibility engine
        const engineData = {
            // Basic information
            commercial_production_date: userData['commercial-production-date'],
            electricity_connection_date: userData['electricity-connection-date'],
            
            // Location
            district: userData.district,
            block: userData.block,
            
            // Project details
            project_type: userData['project-type'],
            land_investment: parseFloat(userData['land-investment']) || 0,
            machinery_investment: parseFloat(userData['machinery-investment']) || 0,
            total_project_cost: parseFloat(userData['total-project-cost']) || 0,
            land_purchase_years: parseInt(userData['land-purchase-years']) || 0,
            
            // Financial details
            has_term_loan: userData['has-term-loan'] === 'true',
            term_loan_amount: parseFloat(userData['term-loan-amount']) || 0,
            interest_rate: parseFloat(userData['interest-rate']) || 0,
            annual_turnover: parseFloat(userData['annual-turnover']) || 0,
            export_turnover: parseFloat(userData['export-turnover']) || 0,
            
            // Operational details
            connected_load: parseFloat(userData['connected-load']) || 0,
            annual_electricity_consumption: parseInt(userData['annual-electricity-consumption']) || 0,
            technology_equipment_cost: parseFloat(userData['technology-equipment-cost']) || 0,
            marketing_export_expenses: parseFloat(userData['marketing-export-expenses']) || 0,
            testing_equipment_cost: parseFloat(userData['testing-equipment-cost']) || 0,
            quality_certification_cost: parseFloat(userData['quality-certification-cost']) || 0,
            
            // Employee information
            total_employees: parseInt(userData['total-employees']) || 0,
            sc_st_employees: parseInt(userData['sc-st-employees']) || 0,
            women_employees: parseInt(userData['women-employees']) || 0,
            promoter_category: userData['promoter-category'],
            
            // Enterprise status
            is_startup_registered: userData['is-startup-registered'] === 'true',
            dpiit_recognition: userData['dpiit-recognition'] === 'true',
            cluster_location: userData['cluster-location'],
            rural_area: userData['rural-area'] === 'true',
            requires_listing: userData['requires-listing'] === 'true',
            
            // Sector information
            primary_sector: userData['primary-sector']
        };

        // Calculate MSME type based on investment
        const totalInvestment = engineData.land_investment + engineData.machinery_investment;
        if (totalInvestment <= 1) {
            engineData.msme_type = 'Micro';
        } else if (totalInvestment <= 10) {
            engineData.msme_type = 'Small';
        } else if (totalInvestment <= 50) {
            engineData.msme_type = 'Medium';
        } else {
            engineData.msme_type = 'Large';
        }

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
        const totalBenefits = Object.values(benefits).reduce((sum, benefit) => sum + benefit, 0);

        // Create results HTML
        let resultsHTML = `
            <div class="results-summary">
                <h4>Eligibility Summary</h4>
                <p>You are eligible for <strong>${Object.keys(results).length}</strong> schemes</p>
                <p class="total-benefit">Total potential benefits: <strong>₹${totalBenefits.toLocaleString()}</strong></p>
            </div>
        `;

        // Add eligible schemes
        if (Object.keys(results).length > 0) {
            resultsHTML += '<div class="eligible-schemes"><h4>Eligible Schemes:</h4>';
            
            Object.entries(results).forEach(([schemeId, isEligible]) => {
                if (isEligible) {
                    const benefit = benefits[schemeId] || 0;
                    const scheme = this.engine.getSchemeDetails(schemeId);
                    
                    resultsHTML += `
                        <div class="scheme-result">
                            <h5>${scheme.name}</h5>
                            <p><strong>Benefit:</strong> ₹${benefit.toLocaleString()}</p>
                            <p><strong>Description:</strong> ${scheme.description}</p>
                            <button onclick="applyForScheme('${schemeId}')" class="btn btn--primary">Apply Now</button>
                        </div>
                    `;
                }
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

 