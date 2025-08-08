// Scheme Detail Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    initializeAuth();
    
    // Initialize FAQ functionality
    initializeFAQ();
    
    // Initialize smooth scrolling for anchor links
    initializeSmoothScrolling();
    
    // Initialize scheme-specific features
    initializeSchemeFeatures();
});

// Initialize authentication
function initializeAuth() {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (token && userInfo.email) {
        showUserSection(userInfo);
    } else {
        showAuthSection();
    }
    
    // Initialize Google Sign-In
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
                            client_id: '450190082724-3knmlhpjkog7gdktivlsa3gli1egc6jm.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });
        
        google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { 
                theme: 'outline', 
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular'
            }
        );
    }
}

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const credential = response.credential;
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    // Store user info
    const userInfo = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub
    };
    
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('authToken', credential);
    
    showUserSection(userInfo);
    
    // Redirect to dashboard or show success message
    showNotification('Successfully logged in!', 'success');
}

// Show authentication section
function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
}

// Show user section
function showUserSection(userInfo) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
    
    if (userInfo.name) {
        document.getElementById('user-name').textContent = userInfo.name;
    }
    
    if (userInfo.picture) {
        document.getElementById('user-picture').src = userInfo.picture;
        document.getElementById('user-picture').style.display = 'block';
    }
}

// Handle logout
document.addEventListener('click', function(e) {
    if (e.target.id === 'logout-btn') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        showAuthSection();
        showNotification('Successfully logged out!', 'info');
    }
});

// Initialize FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize scheme-specific features
function initializeSchemeFeatures() {
    // Add scheme-specific tracking
    const schemeName = getSchemeNameFromURL();
    if (schemeName) {
        trackSchemeView(schemeName);
    }
    
    // Initialize benefit calculator if present
    initializeBenefitCalculator();
    
    // Initialize document checklist
    initializeDocumentChecklist();
}

// Get scheme name from URL
function getSchemeNameFromURL() {
    const path = window.location.pathname;
    const schemeMatch = path.match(/\/schemes\/([^\/]+)/);
    return schemeMatch ? schemeMatch[1] : null;
}

// Track scheme view
function trackSchemeView(schemeName) {
    // Send analytics data
    const analyticsData = {
        event: 'scheme_view',
        scheme: schemeName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    // Store in localStorage for now (can be sent to analytics service later)
    const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
    analytics.push(analyticsData);
    localStorage.setItem('analytics', JSON.stringify(analytics));
}

// Initialize benefit calculator
function initializeBenefitCalculator() {
    const calculator = document.getElementById('benefit-calculator');
    if (!calculator) return;
    
    const calculateBtn = calculator.querySelector('.calculate-btn');
    const resultDiv = calculator.querySelector('.calculator-result');
    
    if (calculateBtn && resultDiv) {
        calculateBtn.addEventListener('click', function() {
            const inputs = calculator.querySelectorAll('input[type="number"]');
            const values = {};
            
            inputs.forEach(input => {
                values[input.name] = parseFloat(input.value) || 0;
            });
            
            const result = calculateBenefit(values);
            displayBenefitResult(result, resultDiv);
        });
    }
}

// Calculate benefit based on scheme
function calculateBenefit(values) {
    const schemeName = getSchemeNameFromURL();
    
    switch(schemeName) {
        case 'electricity-duty-reimbursement':
            return calculateElectricityDutyBenefit(values);
        case 'stamp-duty-refund':
            return calculateStampDutyBenefit(values);
        case 'power-tariff-subsidy':
            return calculatePowerTariffBenefit(values);
        default:
            return { amount: 0, message: 'Benefit calculation not available for this scheme.' };
    }
}

// Calculate electricity duty benefit
function calculateElectricityDutyBenefit(values) {
    const { annualElectricityBill, dutyPercentage = 10 } = values;
    const annualDuty = (annualElectricityBill * dutyPercentage) / 100;
    const sevenYearBenefit = annualDuty * 7;
    
    return {
        amount: sevenYearBenefit,
        breakdown: {
            annualDuty: annualDuty,
            sevenYearBenefit: sevenYearBenefit
        },
        message: `Based on your annual electricity bill of ₹${annualElectricityBill.toLocaleString()}, you could receive ₹${sevenYearBenefit.toLocaleString()} in electricity duty reimbursement over 7 years.`
    };
}

// Calculate stamp duty benefit
function calculateStampDutyBenefit(values) {
    const { propertyValue, blockType } = values;
    let refundPercentage = 0;
    
    switch(blockType) {
        case 'D':
            refundPercentage = 100;
            break;
        case 'C':
            refundPercentage = 75;
            break;
        case 'A':
        case 'B':
            refundPercentage = 50;
            break;
        default:
            refundPercentage = 50;
    }
    
    const stampDuty = propertyValue * 0.05; // 5% stamp duty
    const refundAmount = (stampDuty * refundPercentage) / 100;
    
    return {
        amount: refundAmount,
        breakdown: {
            stampDuty: stampDuty,
            refundPercentage: refundPercentage,
            refundAmount: refundAmount
        },
        message: `For a property worth ₹${propertyValue.toLocaleString()} in ${blockType} block, you could receive ₹${refundAmount.toLocaleString()} in stamp duty refund (${refundPercentage}% of stamp duty).`
    };
}

// Calculate power tariff benefit
function calculatePowerTariffBenefit(values) {
    const { connectedLoad, isRural = false } = values;
    const maxSubsidy = isRural ? 2000000 : 1500000; // 20L for rural, 15L for urban
    const subsidyPerKW = 5000; // ₹5000 per KW
    const calculatedSubsidy = connectedLoad * subsidyPerKW;
    const finalSubsidy = Math.min(calculatedSubsidy, maxSubsidy);
    
    return {
        amount: finalSubsidy,
        breakdown: {
            connectedLoad: connectedLoad,
            subsidyPerKW: subsidyPerKW,
            calculatedSubsidy: calculatedSubsidy,
            maxSubsidy: maxSubsidy,
            finalSubsidy: finalSubsidy
        },
        message: `With ${connectedLoad} KW connected load${isRural ? ' in rural area' : ''}, you could receive up to ₹${finalSubsidy.toLocaleString()} in power tariff subsidy.`
    };
}

// Display benefit calculation result
function displayBenefitResult(result, resultDiv) {
    resultDiv.innerHTML = `
        <div class="calculator-result-content">
            <h3>Estimated Benefit</h3>
            <div class="benefit-amount">₹${result.amount.toLocaleString()}</div>
            <p class="benefit-message">${result.message}</p>
            ${result.breakdown ? `
                <div class="benefit-breakdown">
                    <h4>Breakdown:</h4>
                    <ul>
                        ${Object.entries(result.breakdown).map(([key, value]) => 
                            `<li><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ₹${typeof value === 'number' ? value.toLocaleString() : value}</li>`
                        ).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    resultDiv.style.display = 'block';
}

// Initialize document checklist
function initializeDocumentChecklist() {
    const checkboxes = document.querySelectorAll('.document-checklist input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateChecklistProgress();
        });
    });
}

// Update checklist progress
function updateChecklistProgress() {
    const checkboxes = document.querySelectorAll('.document-checklist input[type="checkbox"]');
    const checkedBoxes = document.querySelectorAll('.document-checklist input[type="checkbox"]:checked');
    const progress = (checkedBoxes.length / checkboxes.length) * 100;
    
    const progressBar = document.querySelector('.checklist-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    const progressText = document.querySelector('.checklist-progress-text');
    if (progressText) {
        progressText.textContent = `${checkedBoxes.length} of ${checkboxes.length} documents ready`;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification__close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification__close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: 0.5rem;
    }
    
    .notification__content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style); 