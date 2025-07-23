// Scheme Service - Frontend API client for scheme management

class SchemeService {
    constructor() {
        this.baseUrl = '/api/schemes';
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
    }

    // Get auth headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: this.getHeaders(),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get all schemes
    async getAllSchemes() {
        return await this.makeRequest(this.baseUrl);
    }

    // Get scheme by ID
    async getSchemeById(schemeId) {
        return await this.makeRequest(`${this.baseUrl}/${schemeId}`);
    }

    // Get schemes by type (Haryana State or National)
    async getSchemesByType(type) {
        return await this.makeRequest(`${this.baseUrl}/type/${type}`);
    }

    // Get schemes by category
    async getSchemesByCategory(categoryId) {
        return await this.makeRequest(`${this.baseUrl}/category/${categoryId}`);
    }

    // Search schemes
    async searchSchemes(query) {
        return await this.makeRequest(`${this.baseUrl}/search/${encodeURIComponent(query)}`);
    }

    // Get all categories
    async getCategories() {
        return await this.makeRequest(`${this.baseUrl.replace('/schemes', '')}/categories`);
    }

    // Get application statuses
    async getApplicationStatuses() {
        return await this.makeRequest(`${this.baseUrl.replace('/schemes', '')}/application-statuses`);
    }

    // Create application
    async createApplication(applicationData) {
        return await this.makeRequest(`${this.baseUrl.replace('/schemes', '')}/applications`, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    // Get user applications
    async getUserApplications(userId) {
        return await this.makeRequest(`${this.baseUrl.replace('/schemes', '')}/applications/user/${userId}`);
    }

    // Update application status
    async updateApplicationStatus(applicationId, statusId) {
        return await this.makeRequest(`${this.baseUrl.replace('/schemes', '')}/applications/${applicationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status_id: statusId })
        });
    }

    // Get scheme statistics
    async getSchemeStats(schemeId) {
        return await this.makeRequest(`${this.baseUrl}/${schemeId}/stats`);
    }

    // Utility methods for frontend

    // Get scheme by URL slug
    async getSchemeBySlug(slug) {
        const schemes = await this.getAllSchemes();
        return schemes.data.find(scheme => scheme.scheme_id === slug);
    }

    // Get schemes for homepage display
    async getHomepageSchemes() {
        const [haryanaSchemes, nationalSchemes] = await Promise.all([
            this.getSchemesByType('Haryana State'),
            this.getSchemesByType('National')
        ]);

        return {
            haryana: haryanaSchemes.data.slice(0, 3), // Show first 3 Haryana schemes
            national: nationalSchemes.data.slice(0, 6) // Show first 6 National schemes
        };
    }

    // Get related schemes
    async getRelatedSchemes(schemeId, limit = 3) {
        const currentScheme = await this.getSchemeById(schemeId);
        const allSchemes = await this.getAllSchemes();
        
        // Filter out current scheme and get schemes of same type
        const related = allSchemes.data
            .filter(scheme => scheme.scheme_id !== schemeId && scheme.scheme_type === currentScheme.data.scheme_type)
            .slice(0, limit);
        
        return related;
    }

    // Format scheme data for display
    formatSchemeForDisplay(scheme) {
        return {
            id: scheme.scheme_id,
            name: scheme.scheme_name,
            type: scheme.scheme_type,
            benefit: scheme.quantum_of_assistance,
            maxAmount: scheme.max_benefit_amount,
            percentage: scheme.benefit_percentage,
            authority: scheme.competent_authority,
            eligibility: scheme.eligibility_criteria,
            documents: scheme.required_documents || [],
            forms: scheme.forms || [],
            categories: scheme.categories || []
        };
    }

    // Check if user is eligible for a scheme
    async checkEligibility(schemeId, userData) {
        const scheme = await this.getSchemeById(schemeId);
        const eligibilityCriteria = scheme.data.eligibility_criteria;
        
        const results = {
            eligible: true,
            reasons: [],
            missingRequirements: []
        };

        // Basic eligibility checks
        if (!userData.msmeRegistration) {
            results.eligible = false;
            results.missingRequirements.push('MSME Registration');
        }

        if (!userData.udyamRegistration) {
            results.eligible = false;
            results.missingRequirements.push('Udyam Registration');
        }

        if (!userData.gstRegistration) {
            results.eligible = false;
            results.missingRequirements.push('GST Registration');
        }

        // Scheme-specific checks
        if (scheme.data.scheme_type === 'Haryana State') {
            if (!userData.location || !userData.location.includes('Haryana')) {
                results.eligible = false;
                results.reasons.push('Scheme is only available for units in Haryana');
            }
        }

        return results;
    }

    // Generate application form data
    generateFormData(schemeId) {
        return {
            scheme_id: schemeId,
            form_data: {},
            documents: [],
            status: 'draft'
        };
    }

    // Validate form data
    validateFormData(formData, schemeFields) {
        const errors = [];
        
        schemeFields.forEach(field => {
            if (field.required && (!formData[field.field_name] || formData[field.field_name].trim() === '')) {
                errors.push(`${field.field_name} is required`);
            }
            
            // Add more validation rules based on field type
            if (field.field_type === 'email' && formData[field.field_name]) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData[field.field_name])) {
                    errors.push(`${field.field_name} must be a valid email address`);
                }
            }
            
            if (field.field_type === 'number' && formData[field.field_name]) {
                if (isNaN(formData[field.field_name])) {
                    errors.push(`${field.field_name} must be a valid number`);
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Calculate potential benefit
    calculateBenefit(scheme, userData) {
        let benefit = 0;
        
        switch (scheme.scheme_id) {
            case 'electricity-duty-reimbursement':
                const annualBill = userData.annualElectricityBill || 0;
                const dutyPercentage = 10; // Assuming 10% duty
                const annualDuty = (annualBill * dutyPercentage) / 100;
                benefit = annualDuty * 7; // 7 years
                break;
                
            case 'stamp-duty-refund':
                const propertyValue = userData.propertyValue || 0;
                const blockType = userData.blockType || 'A';
                let refundPercentage = 50;
                
                switch (blockType) {
                    case 'D': refundPercentage = 100; break;
                    case 'C': refundPercentage = 75; break;
                    case 'A':
                    case 'B': refundPercentage = 50; break;
                }
                
                const stampDuty = propertyValue * 0.05; // 5% stamp duty
                benefit = (stampDuty * refundPercentage) / 100;
                break;
                
            case 'power-tariff-subsidy':
                const connectedLoad = userData.connectedLoad || 0;
                const isRural = userData.ruralArea || false;
                const maxSubsidy = isRural ? 2000000 : 1500000;
                const subsidyPerKW = 5000;
                const calculatedSubsidy = connectedLoad * subsidyPerKW;
                benefit = Math.min(calculatedSubsidy, maxSubsidy);
                break;
                
            default:
                // For other schemes, use percentage or fixed amount
                if (scheme.benefit_percentage && userData.projectCost) {
                    benefit = (userData.projectCost * scheme.benefit_percentage) / 100;
                } else if (scheme.max_benefit_amount) {
                    benefit = scheme.max_benefit_amount;
                }
                break;
        }
        
        return Math.min(benefit, scheme.max_benefit_amount || Infinity);
    }
}

// Create global instance
window.schemeService = new SchemeService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchemeService;
} 