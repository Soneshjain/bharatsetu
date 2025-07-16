// Utility functions shared across multiple pages

// Global functions for form interactions
function updateBlocks() {
    const district = document.getElementById('district').value;
    const blockSelect = document.getElementById('block');
    
    // Clear existing options
    blockSelect.innerHTML = '<option value="">Select Block</option>';
    
    if (!district) return;
    
    // Block options for each district (simplified)
    const blocks = ['A', 'B', 'C', 'D'];
    blocks.forEach(block => {
        const option = document.createElement('option');
        option.value = block;
        option.textContent = `Block ${block}`;
        blockSelect.appendChild(option);
    });
}

// Function to apply for schemes (redirect to dashboard with scheme parameter)
function applyForScheme(schemeId) {
    // Redirect to application form or dashboard
    window.location.href = `dashboard.html?scheme=${schemeId}`;
}

// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Function to validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Function to validate phone number
function validatePhone(phone) {
    const re = /^[0-9+\-\s()]+$/;
    return re.test(phone);
} 