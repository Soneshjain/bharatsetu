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
        const modal = document.getElementById('eligibility-modal');
        if (!modal) return;

        // Replace the existing form with our comprehensive single-step questionnaire
        modal.innerHTML = `
            <div class="modal-content eligibility-questionnaire">
                <span class="modal-close" id="eligibility-modal-close">&times;</span>
                
                <div class="questionnaire-form">
                    <h2>MSME Eligibility Check</h2>
                    <p class="form-description">Fill in your details to check eligibility for Haryana and National MSME schemes</p>
                    
                    <!-- Basic Information -->
                    <div class="form-section">
                        <h3>Basic Information</h3>
                        
                        <div class="form-group">
                            <label for="commercial-production-date">Date of Commercial Production *</label>
                            <input type="date" id="commercial-production-date" name="commercial-production-date" required>
                            <small>Date when commercial production started</small>
                        </div>
                    </div>

                    <!-- Location Information -->
                    <div class="form-section">
                        <h3>Location Information</h3>
                        
                        <div class="form-group">
                            <label for="district">District *</label>
                            <select id="district" name="district" required onchange="updateBlocks()">
                                <option value="">Select District</option>
                                <option value="ambala">Ambala</option>
                                <option value="bhiwani">Bhiwani</option>
                                <option value="charkhi-dadri">Charkhi Dadri</option>
                                <option value="faridabad">Faridabad</option>
                                <option value="fatehabad">Fatehabad</option>
                                <option value="gurugram">Gurugram</option>
                                <option value="hisar">Hisar</option>
                                <option value="jhajjar">Jhajjar</option>
                                <option value="jind">Jind</option>
                                <option value="kaithal">Kaithal</option>
                                <option value="karnal">Karnal</option>
                                <option value="kurukshetra">Kurukshetra</option>
                                <option value="mahendragarh">Mahendragarh</option>
                                <option value="mewat">Mewat</option>
                                <option value="palwal">Palwal</option>
                                <option value="panchkula">Panchkula</option>
                                <option value="panipat">Panipat</option>
                                <option value="rewari">Rewari</option>
                                <option value="rohtak">Rohtak</option>
                                <option value="sirsa">Sirsa</option>
                                <option value="sonipat">Sonipat</option>
                                <option value="yamunanagar">Yamunanagar</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="block">Block *</label>
                            <select id="block" name="block" required>
                                <option value="">First select a district</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="electricity-connection-date">Date of Electricity Connection</label>
                            <input type="date" id="electricity-connection-date" name="electricity-connection-date">
                            <small>Required for electricity duty reimbursement schemes</small>
                        </div>
                    </div>

                    <!-- Sector Information -->
                    <div class="form-section">
                        <h3>Sector Information</h3>
                        
                        <div class="form-group">
                            <label for="primary-sector">Primary Sector *</label>
                            <select id="primary-sector" name="primary-sector" required>
                                <option value="">Select Primary Sector</option>
                                <option value="textile">Textile & Apparel</option>
                                <option value="food-processing">Food Processing</option>
                                <option value="renewable-energy">Renewable Energy</option>
                                <option value="ict">Information & Communication Technology</option>
                                <option value="traditional">Traditional Industries</option>
                                <option value="general">General Manufacturing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <!-- Project Information -->
                    <div class="form-section">
                        <h3>Project Information</h3>
                        
                        <div class="form-group">
                            <label for="project-type">Project Type *</label>
                            <select id="project-type" name="project-type" required>
                                <option value="">Select Project Type</option>
                                <option value="new">New Unit</option>
                                <option value="expansion">Expansion</option>
                                <option value="diversification">Diversification</option>
                                <option value="modernization">Modernization</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="land-investment">Land Investment (INR Cr.) *</label>
                            <input type="number" id="land-investment" name="land-investment" step="0.01" required>
                            <small>Investment in land and building</small>
                        </div>

                        <div class="form-group">
                            <label for="machinery-investment">Machinery & Plant Setup (INR Cr.) *</label>
                            <input type="number" id="machinery-investment" name="machinery-investment" step="0.01" required>
                            <small>Investment in plant and machinery</small>
                        </div>

                        <div class="form-group">
                            <label for="total-project-cost">Total Project Cost (INR Cr.) *</label>
                            <input type="number" id="total-project-cost" name="total-project-cost" step="0.01" required>
                            <small>Total project cost (land + machinery + other expenses)</small>
                        </div>

                        <div class="form-group">
                            <label for="land-purchase-years">Years since land purchase</label>
                            <input type="number" id="land-purchase-years" name="land-purchase-years" min="0" max="50">
                            <small>Required for stamp duty refund schemes</small>
                        </div>

                        <div class="form-group">
                            <label for="has-term-loan">Do you have a term loan from bank/financial institution?</label>
                            <div class="radio-group">
                                <label><input type="radio" name="has-term-loan" value="true"> Yes</label>
                                <label><input type="radio" name="has-term-loan" value="false"> No</label>
                            </div>
                            <small>Required for interest subsidy schemes</small>
                        </div>

                        <div class="form-group">
                            <label for="term-loan-amount">Term Loan Amount (INR)</label>
                            <input type="number" id="term-loan-amount" name="term-loan-amount" step="0.01" min="0">
                            <small>Enter amount in rupees (e.g., 500000 for ₹5L)</small>
                        </div>

                        <div class="form-group">
                            <label for="interest-rate">Interest Rate on Term Loan (%)</label>
                            <input type="number" id="interest-rate" name="interest-rate" step="0.1" min="0" max="20">
                            <small>Required for interest subsidy calculations</small>
                        </div>

                        <div class="form-group">
                            <label for="requires-listing">Are you planning to list on SME Exchange?</label>
                            <div class="radio-group">
                                <label><input type="radio" name="requires-listing" value="true"> Yes</label>
                                <label><input type="radio" name="requires-listing" value="false"> No</label>
                            </div>
                            <small>Required for SME Exchange Equity Scheme</small>
                        </div>
                    </div>

                    <!-- Financial & Operational Details -->
                    <div class="form-section">
                        <h3>Financial & Operational Details</h3>
                        
                        <div class="form-group">
                            <label for="annual-turnover">Annual Turnover (INR Cr.)</label>
                            <input type="number" id="annual-turnover" name="annual-turnover" step="0.01" min="0">
                            <small>For schemes with turnover-based calculations</small>
                        </div>

                        <div class="form-group">
                            <label for="export-turnover">Export Turnover (INR)</label>
                            <input type="number" id="export-turnover" name="export-turnover" step="0.01" min="0">
                            <small>Enter amount in rupees (e.g., 1000000 for ₹10L)</small>
                        </div>

                        <div class="form-group">
                            <label for="connected-load">Connected Load (KW)</label>
                            <input type="number" id="connected-load" name="connected-load" step="0.1" min="0">
                            <small>For power tariff subsidy calculations</small>
                        </div>

                        <div class="form-group">
                            <label for="annual-electricity-consumption">Annual Electricity Consumption (Units)</label>
                            <input type="number" id="annual-electricity-consumption" name="annual-electricity-consumption" min="0">
                            <small>For electricity duty and power tariff schemes</small>
                        </div>

                        <div class="form-group">
                            <label for="technology-equipment-cost">Technology/Equipment Cost (INR)</label>
                            <input type="number" id="technology-equipment-cost" name="technology-equipment-cost" step="0.01" min="0">
                            <small>Enter amount in rupees (e.g., 500000 for ₹5L)</small>
                        </div>

                        <div class="form-group">
                            <label for="marketing-export-expenses">Marketing/Export Expenses (INR)</label>
                            <input type="number" id="marketing-export-expenses" name="marketing-export-expenses" step="0.01" min="0">
                            <small>Enter amount in rupees (e.g., 200000 for ₹2L)</small>
                        </div>

                        <div class="form-group">
                            <label for="testing-equipment-cost">Testing Equipment Cost (INR)</label>
                            <input type="number" id="testing-equipment-cost" name="testing-equipment-cost" step="0.01" min="0">
                            <small>Enter amount in rupees (e.g., 100000 for ₹1L)</small>
                        </div>

                        <div class="form-group">
                            <label for="quality-certification-cost">Quality Certification Cost (INR)</label>
                            <input type="number" id="quality-certification-cost" name="quality-certification-cost" step="0.01" min="0">
                            <small>Enter amount in rupees (e.g., 50000 for ₹50K)</small>
                        </div>
                    </div>

                    <!-- Employee Information -->
                    <div class="form-section">
                        <h3>Employee Information</h3>
                        
                        <div class="form-group">
                            <label for="total-employees">Total Number of Employees</label>
                            <input type="number" id="total-employees" name="total-employees" min="0">
                            <small>For employment generation schemes</small>
                        </div>

                        <div class="form-group">
                            <label for="sc-st-employees">Number of SC/ST Employees</label>
                            <input type="number" id="sc-st-employees" name="sc-st-employees" min="0">
                            <small>For higher benefits in employment schemes</small>
                        </div>

                        <div class="form-group">
                            <label for="women-employees">Number of Women Employees</label>
                            <input type="number" id="women-employees" name="women-employees" min="0">
                            <small>For women-specific benefits</small>
                        </div>

                        <div class="form-group">
                            <label for="promoter-category">Promoter Category</label>
                            <select id="promoter-category" name="promoter-category">
                                <option value="">Select Category</option>
                                <option value="general">General</option>
                                <option value="sc">SC</option>
                                <option value="st">ST</option>
                                <option value="women">Women</option>
                                <option value="shg">SHG</option>
                            </select>
                            <small>Affects benefit percentages in many schemes</small>
                        </div>
                    </div>

                    <!-- Enterprise Status -->
                    <div class="form-section">
                        <h3>Enterprise Status</h3>
                        
                        <div class="form-group">
                            <label for="is-startup-registered">Are you a registered startup?</label>
                            <div class="radio-group">
                                <label><input type="radio" name="is-startup-registered" value="true"> Yes</label>
                                <label><input type="radio" name="is-startup-registered" value="false"> No</label>
                            </div>
                            <small>For startup-specific schemes</small>
                        </div>

                        <div class="form-group">
                            <label for="dpiit-recognition">Do you have DPIIT startup recognition?</label>
                            <div class="radio-group">
                                <label><input type="radio" name="dpiit-recognition" value="true"> Yes</label>
                                <label><input type="radio" name="dpiit-recognition" value="false"> No</label>
                            </div>
                            <small>Required for Haryana startup policy benefits</small>
                        </div>

                        <div class="form-group">
                            <label for="cluster-location">Are you located inside a PADMA cluster?</label>
                            <div class="radio-group">
                                <label><input type="radio" name="cluster-location" value="inside"> Inside Cluster</label>
                                <label><input type="radio" name="cluster-location" value="outside"> Outside Cluster</label>
                                <label><input type="radio" name="cluster-location" value="unknown"> Don't Know</label>
                            </div>
                            <small>Affects PADMA scheme benefit amounts</small>
                        </div>

                        <div class="form-group">
                            <label for="rural-area">Is your enterprise in a rural area?</label>
                            <div class="radio-group">
                                <label><input type="radio" name="rural-area" value="true"> Yes</label>
                                <label><input type="radio" name="rural-area" value="false"> No</label>
                            </div>
                            <small>For rural development schemes</small>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="form-actions">
                        <button type="button" id="submit-btn" class="btn btn--primary">Check Eligibility</button>
                    </div>
                </div>

                <!-- Results Section -->
                <div id="eligibility-results" style="display: none;">
                    <h3>Your Eligibility Results</h3>
                    <div id="results-content"></div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Submit button
        const submitBtn = document.getElementById('submit-btn');
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                console.log('Submit button clicked');
                this.submitQuestionnaire();
            });
        }

        // Close modal
        const closeBtn = document.getElementById('eligibility-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('eligibility-modal').style.display = 'none';
            });
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('eligibility-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
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
            if (Array.isArray(this.userData[name])) {
                this.userData[name].push(checkbox.value);
            }
        });
        
        // Special handling for block category
        const blockSelect = document.getElementById('block');
        if (blockSelect && blockSelect.value) {
            const selectedOption = blockSelect.options[blockSelect.selectedIndex];
            const blockCategory = selectedOption.getAttribute('data-category');
            if (blockCategory) {
                this.userData['block-category'] = blockCategory;
            }
        }
        
        console.log('Collected form data:', this.userData);
    }

    async submitQuestionnaire() {
        if (this.validateForm()) {
            this.collectFormData();
            await this.processResults();
        }
    }

    async processResults() {
        // Convert form data to engine format
        const engineData = this.convertToEngineFormat(this.userData);
        
        // Check eligibility
        const results = this.engine.checkAllEligibility(engineData);
        const benefits = this.engine.calculateTotalBenefits(results.eligible_schemes, engineData);
        
        // Store results in database if user is authenticated
        if (window.authService && window.authService.isAuthenticated()) {
            try {
                // Create or get company
                const companyData = {
                    name: this.userData['company-name'] || 'MSME Unit',
                    registration_number: this.userData['registration-number'] || '',
                    enterprise_type: 'MSME',
                    sector: this.userData['primary-sector'],
                    district: this.userData['district'],
                    block: this.userData['block'],
                    block_category: this.userData['block-category'],
                    commercial_production_date: this.userData['commercial-production-date'],
                    electricity_connection_date: this.userData['electricity-connection-date'],
                    project_type: this.userData['project-type'],
                    land_investment: parseFloat(this.userData['land-investment']) || 0,
                    machinery_investment: parseFloat(this.userData['machinery-investment']) || 0,
                    total_project_cost: parseFloat(this.userData['total-project-cost']) || 0,
                    land_purchase_years: parseInt(this.userData['land-purchase-years']) || 0,
                    has_term_loan: this.userData['has-term-loan'] === 'true',
                    term_loan_amount: parseFloat(this.userData['term-loan-amount']) || 0,
                    interest_rate: parseFloat(this.userData['interest-rate']) || 0,
                    requires_listing: this.userData['requires-listing'] === 'true',
                    annual_turnover: parseFloat(this.userData['annual-turnover']) || 0,
                    export_turnover: parseFloat(this.userData['export-turnover']) || 0,
                    connected_load: parseFloat(this.userData['connected-load']) || 0,
                    annual_electricity_consumption: parseInt(this.userData['annual-electricity-consumption']) || 0,
                    technology_equipment_cost: parseFloat(this.userData['technology-equipment-cost']) || 0,
                    marketing_export_expenses: parseFloat(this.userData['marketing-export-expenses']) || 0,
                    testing_equipment_cost: parseFloat(this.userData['testing-equipment-cost']) || 0,
                    quality_certification_cost: parseFloat(this.userData['quality-certification-cost']) || 0,
                    total_employees: parseInt(this.userData['total-employees']) || 0,
                    sc_st_employees: parseInt(this.userData['sc-st-employees']) || 0,
                    women_employees: parseInt(this.userData['women-employees']) || 0,
                    promoter_category: this.userData['promoter-category'] || '',
                    is_startup_registered: this.userData['is-startup-registered'] === 'true',
                    dpiit_recognition: this.userData['dpiit-recognition'] === 'true',
                    cluster_location: this.userData['cluster-location'] || '',
                    rural_area: this.userData['rural-area'] === 'true'
                };

                // Create company first
                const companyResult = await window.authService.createCompany(companyData);
                
                // Store eligibility test result
                await window.authService.storeEligibilityTest(
                    companyResult.companyId,
                    this.userData,
                    {
                        total_eligible: results.eligible_schemes.length,
                        total_value: benefits.total_value,
                        benefits_breakdown: benefits.benefits_breakdown
                    }
                );

                console.log('Eligibility test results stored in database');
            } catch (error) {
                console.error('Failed to store results in database:', error);
                // Continue with displaying results even if database storage fails
            }
        }
        
        // Display results
        this.displayResults(results, benefits);
    }

    convertToEngineFormat(userData) {
        return {
            enterprise_type: 'micro', // Default to micro, all MSMEs are eligible
            investment_plant_machinery: parseFloat(userData['machinery-investment']),
            turnover: 0, // Not used in eligibility checks
            has_urc: true, // Assume URC is available
            has_hum: true, // Assume HUM is available
            has_udyam: true, // Assume Udyam registration is available
            commercial_production_date: userData['commercial-production-date'],
            district: userData['district'],
            block_category: userData['block-category'] || 'b', // Use actual block category
            is_padma_block: false, // Default to false since we're not determining PADMA blocks
            electricity_connection_date: userData['electricity-connection-date'],
            sector: userData['primary-sector'],
            has_spv: false, // Default to false since we removed cluster questions
            project_type: userData['project-type'],
            project_cost: parseFloat(userData['total-project-cost']),
            land_investment: parseFloat(userData['land-investment']),
            machinery_investment: parseFloat(userData['machinery-investment']),
            land_purchase_years: parseInt(userData['land-purchase-years']) || 0, // Default to 0 if not provided
            has_term_loan: userData['has-term-loan'] === 'true',
            requires_listing: userData['requires-listing'] === 'true',
            promoter_category: userData['promoter-category'] || [],
            is_startup_registered: userData['is-startup-registered'] === 'true',
            dpiit_recognition: userData['dpiit-recognition'] === 'true',
            cluster_location: userData['cluster-location'],
            rural_area: userData['rural-area'] === 'true',
            // Financial & Operational Details
            annual_turnover: parseFloat(userData['annual-turnover']) || 0,
            export_turnover: parseFloat(userData['export-turnover']) || 0,
            connected_load: parseFloat(userData['connected-load']) || 0,
            annual_electricity_consumption: parseInt(userData['annual-electricity-consumption']) || 0,
            technology_equipment_cost: parseFloat(userData['technology-equipment-cost']) || 0,
            marketing_export_expenses: parseFloat(userData['marketing-export-expenses']) || 0,
            testing_equipment_cost: parseFloat(userData['testing-equipment-cost']) || 0,
            quality_certification_cost: parseFloat(userData['quality-certification-cost']) || 0,
            // Employee Information
            total_employees: parseInt(userData['total-employees']) || 0,
            sc_st_employees: parseInt(userData['sc-st-employees']) || 0,
            women_employees: parseInt(userData['women-employees']) || 0,
            // National scheme defaults
            age_above_18: true, // Assume applicant is above 18
            technology_upgradation: false, // Default to false since we removed specific activities
            non_farm_sector: true // Assume non-farm sector
        };
    }

    displayResults(results, benefits) {
        const formDiv = document.querySelector('.questionnaire-form');
        const resultsDiv = document.getElementById('eligibility-results');
        const contentDiv = document.getElementById('results-content');
        
        // Hide questionnaire form
        if (formDiv) {
            formDiv.style.display = 'none';
        }

        // Show results
        resultsDiv.style.display = 'block';

        let resultsHTML = `
            <div class="results-summary">
                <h4>🎉 Congratulations! You are eligible for ${results.total_eligible} schemes</h4>
                <p class="total-benefit">Total Potential Benefits: <strong>Upto ₹${(benefits.total_value / 10000000).toFixed(2)} Cr</strong></p>
            </div>
        `;

        if (results.eligible_schemes.length > 0) {
            resultsHTML += `
                <div class="eligible-schemes">
                    <h4>Eligible Schemes:</h4>
                    <div class="schemes-grid">
            `;

            results.eligible_schemes.forEach(scheme => {
                const benefit = benefits.benefits_breakdown.find(b => b.scheme_name === scheme.scheme.name);
                const maxValue = benefit ? (benefit.estimated_value / 100000).toFixed(2) : 'Varies';
                resultsHTML += `
                    <div class="scheme-card">
                        <h5>${scheme.scheme.name}</h5>
                        <p><strong>Benefit:</strong> ${benefit ? benefit.benefit_description : 'Varies by project'}</p>
                        <p><strong>Maximum Value:</strong> Upto ₹${maxValue} L</p>
                        <p><strong>Documents Required:</strong> ${scheme.documents.join(', ')}</p>
                        <button class="btn btn--primary btn--small" onclick="applyForScheme('${scheme.scheme.id}')">Apply Now</button>
                    </div>
                `;
            });

            resultsHTML += `
                    </div>
                </div>
            `;
        }

        contentDiv.innerHTML = resultsHTML;
    }
}

// District-Block mapping data
const districtBlockMapping = {
    'faridabad': [
        { name: 'Faridabad', category: 'A' },
        { name: 'Ballabgarh', category: 'A' }
    ],
    'gurugram': [
        { name: 'Gurgaon', category: 'A' },
        { name: 'Sohna', category: 'A' },
        { name: 'Pataudi', category: 'A' },
        { name: 'Farukh Nagar', category: 'A' }
    ],
    'panipat': [
        { name: 'Panipat', category: 'A' },
        { name: 'Samalkha', category: 'B' },
        { name: 'Israna', category: 'C' },
        { name: 'Madlauda & HSIIDC, Indl. Estate Near Refinery Panipat', category: 'C' },
        { name: 'Bapauli', category: 'C' },
        { name: 'Sanauli Khurd', category: 'C' }
    ],
    'sonipat': [
        { name: 'Rai', category: 'A' },
        { name: 'Sonepat', category: 'A' },
        { name: 'Ganaur', category: 'B' },
        { name: 'Kharkhoda', category: 'B' },
        { name: 'Murthal', category: 'B' },
        { name: 'Mundlana', category: 'C' },
        { name: 'Gohana', category: 'C' },
        { name: 'Kathura', category: 'D' }
    ],
    'jhajjar': [
        { name: 'Bahadurgarh', category: 'A' },
        { name: 'Jhajjar', category: 'B' },
        { name: 'Matenhail', category: 'B' },
        { name: 'Beri', category: 'C' },
        { name: 'Badli', category: 'C' },
        { name: 'Sahalwas', category: 'D' }
    ],
    'rewari': [
        { name: 'Bawal', category: 'A' },
        { name: 'Rewari', category: 'B' },
        { name: 'Khol at Rewari', category: 'C' },
        { name: 'Jatusana', category: 'C' },
        { name: 'Dahina', category: 'C' },
        { name: 'Nahar', category: 'D' }
    ],
    'palwal': [
        { name: 'Palwal', category: 'A' },
        { name: 'Prithla', category: 'A' },
        { name: 'Hodel', category: 'B' },
        { name: 'Hassanpur', category: 'C' },
        { name: 'Hathin', category: 'C' },
        { name: 'Badoli', category: 'C' }
    ],
    'ambala': [
        { name: 'Ambala-I', category: 'B' },
        { name: 'Ambala-II', category: 'B' },
        { name: 'Saha', category: 'B' },
        { name: 'Barara', category: 'C' },
        { name: 'Naraingarh', category: 'C' },
        { name: 'Shehzadpur', category: 'C' }
    ],
    'bhiwani': [
        { name: 'Bhiwani', category: 'B' },
        { name: 'Tosham', category: 'C' },
        { name: 'Loharu', category: 'D' },
        { name: 'Bawani-Khera', category: 'D' },
        { name: 'Kairu', category: 'D' },
        { name: 'Siwani', category: 'D' },
        { name: 'Bahal', category: 'D' }
    ],
    'hisar': [
        { name: 'Hisar-I', category: 'B' },
        { name: 'Hisar-II', category: 'B' },
        { name: 'Hansi-I', category: 'C' },
        { name: 'Hansi-II', category: 'C' },
        { name: 'Adampur', category: 'D' },
        { name: 'Barwala', category: 'D' },
        { name: 'Narnaund', category: 'D' },
        { name: 'Uklana', category: 'D' },
        { name: 'Agroha', category: 'D' }
    ],
    'karnal': [
        { name: 'Karnal', category: 'B' },
        { name: 'Gharaunda', category: 'B' },
        { name: 'Nilokheri', category: 'B' },
        { name: 'Assandh', category: 'C' },
        { name: 'Indri', category: 'C' },
        { name: 'Nissing at Chirao', category: 'C' },
        { name: 'Kunjpura', category: 'C' },
        { name: 'Munak', category: 'C' }
    ],
    'mewat': [
        { name: 'Taoru', category: 'B' },
        { name: 'Nuh', category: 'C' },
        { name: 'Indri', category: 'C' },
        { name: 'Nagina', category: 'D' },
        { name: 'Ferozepur Jhirka', category: 'D' },
        { name: 'Punhana', category: 'D' },
        { name: 'Pingwan', category: 'D' }
    ],
    'panchkula': [
        { name: 'Barwala', category: 'B' },
        { name: 'Pinjore', category: 'B' },
        { name: 'Raipur Rani', category: 'D' },
        { name: 'Morni', category: 'D' }
    ],
    'fatehabad': [
        { name: 'Fatehabad', category: 'C' },
        { name: 'Tohana', category: 'C' },
        { name: 'Ratia', category: 'C' },
        { name: 'Nagpur', category: 'C' },
        { name: 'Bhattu Kalan', category: 'D' },
        { name: 'Jakhal', category: 'D' },
        { name: 'Bhuna', category: 'D' }
    ],
    'jind': [
        { name: 'Jind', category: 'C' },
        { name: 'Narwana', category: 'C' },
        { name: 'Ujhana', category: 'C' },
        { name: 'Safidon', category: 'D' },
        { name: 'Julana', category: 'D' },
        { name: 'Pillu Khera', category: 'D' },
        { name: 'Uchana', category: 'D' },
        { name: 'Alewa', category: 'D' }
    ],
    'kaithal': [
        { name: 'Guhla at Cheeka', category: 'C' },
        { name: 'Kaithal', category: 'C' },
        { name: 'Pundri', category: 'C' },
        { name: 'Dhand', category: 'C' },
        { name: 'Kalayat', category: 'D' },
        { name: 'Rajound', category: 'D' },
        { name: 'Siwan', category: 'D' }
    ],
    'kurukshetra': [
        { name: 'Pehowa', category: 'C' },
        { name: 'Thanesar', category: 'C' },
        { name: 'Ladwa', category: 'C' },
        { name: 'Shahabad', category: 'C' },
        { name: 'Babain', category: 'C' },
        { name: 'Ismailabad', category: 'C' },
        { name: 'Pipli', category: 'C' }
    ],
    'mahendragarh': [
        { name: 'Narnaul', category: 'C' },
        { name: 'Ateli Nangal', category: 'D' },
        { name: 'Kanina', category: 'D' },
        { name: 'Nangal Chaudhary', category: 'D' },
        { name: 'Mahendragarh', category: 'D' },
        { name: 'Sihma', category: 'D' },
        { name: 'Nizampur', category: 'D' },
        { name: 'Satnali', category: 'D' }
    ],
    'rohtak': [
        { name: 'Rohtak and IMT, Rohtak', category: 'B' },
        { name: 'Meham', category: 'C' },
        { name: 'Kalanaur', category: 'C' },
        { name: 'Lakhan Majra', category: 'C' },
        { name: 'Sampla', category: 'C' }
    ],
    'sirsa': [
        { name: 'Sirsa', category: 'C' },
        { name: 'Dabwali', category: 'D' },
        { name: 'Rania', category: 'D' },
        { name: 'Baragudha', category: 'D' },
        { name: 'Ellanabad', category: 'D' },
        { name: 'Odhan', category: 'D' },
        { name: 'Nathusari Chopta', category: 'D' }
    ],
    'yamunanagar': [
        { name: 'Jagadhri', category: 'B' },
        { name: 'Bilaspur', category: 'C' },
        { name: 'Chhachhrauli', category: 'C' },
        { name: 'Radaur', category: 'C' },
        { name: 'Mustafabad', category: 'C' },
        { name: 'Khizrabad', category: 'C' },
        { name: 'Sadhaura', category: 'D' }
    ],
    'charkhi-dadri': [
        { name: 'Charki Dadri', category: 'D' },
        { name: 'Badhra', category: 'D' },
        { name: 'Bond Kalan', category: 'D' },
        { name: 'Jhojhu Kalan', category: 'D' }
    ]
};

// Function to update blocks based on selected district
function updateBlocks() {
    const districtSelect = document.getElementById('district');
    const blockSelect = document.getElementById('block');
    
    if (!districtSelect || !blockSelect) return;
    
    const selectedDistrict = districtSelect.value;
    blockSelect.innerHTML = '<option value="">Select Block</option>';
    
    if (selectedDistrict && districtBlockMapping[selectedDistrict]) {
        districtBlockMapping[selectedDistrict].forEach(block => {
            const option = document.createElement('option');
            option.value = block.name;
            option.textContent = `${block.name} (Block ${block.category})`;
            option.setAttribute('data-category', block.category);
            blockSelect.appendChild(option);
        });
    }
}

// Global function for applying to schemes
function applyForScheme(schemeId) {
    // This will be implemented when we create the application flow
    alert(`Application flow for ${schemeId} will be implemented next.`);
}

// Initialize questionnaire when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the questionnaire when the eligibility modal is opened
    const eligibilityCta = document.getElementById('eligibility-cta');
    if (eligibilityCta) {
        eligibilityCta.addEventListener('click', () => {
            // Always create a new instance to ensure fresh state
            window.eligibilityQuestionnaire = new EligibilityQuestionnaire();
        });
    }
}); 