/* ===== BHARATSETU UTILITIES ===== */
/* Centralized utility functions for the entire application */

// ===== DOM UTILITIES =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ===== EVENT UTILITIES =====
const addEventListeners = (elements, event, handler) => {
    if (typeof elements === 'string') {
        elements = $$(elements);
    }
    if (!Array.isArray(elements)) {
        elements = [elements];
    }
    elements.forEach(element => {
        if (element && typeof element.addEventListener === 'function') {
            element.addEventListener(event, handler);
        }
    });
};

const removeEventListeners = (elements, event, handler) => {
    if (typeof elements === 'string') {
        elements = $$(elements);
    }
    if (!Array.isArray(elements)) {
        elements = [elements];
    }
    elements.forEach(element => {
        if (element && typeof element.removeEventListener === 'function') {
            element.removeEventListener(event, handler);
        }
    });
};

// ===== CLASS UTILITIES =====
const addClass = (element, className) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.add(className);
    }
};

const removeClass = (element, className) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.remove(className);
    }
};

const toggleClass = (element, className) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.toggle(className);
    }
};

const hasClass = (element, className) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    return element ? element.classList.contains(className) : false;
};

// ===== STORAGE UTILITIES =====
const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// ===== VALIDATION UTILITIES =====
const validators = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    phone: (phone) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    },
    
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    minLength: (value, min) => {
        return value && value.toString().length >= min;
    },
    
    maxLength: (value, max) => {
        return value && value.toString().length <= max;
    },
    
    numeric: (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    url: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// ===== FORM UTILITIES =====
const formUtils = {
    getFormData: (form) => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        return data;
    },
    
    validateForm: (form, rules) => {
        const errors = {};
        const formData = formUtils.getFormData(form);
        
        Object.keys(rules).forEach(fieldName => {
            const fieldRules = rules[fieldName];
            const fieldValue = formData[fieldName];
            
            fieldRules.forEach(rule => {
                if (typeof rule === 'string') {
                    if (!validators[rule](fieldValue)) {
                        errors[fieldName] = `${fieldName} is invalid`;
                    }
                } else if (typeof rule === 'object') {
                    const { validator, message, params } = rule;
                    if (!validators[validator](fieldValue, ...params)) {
                        errors[fieldName] = message;
                    }
                }
            });
        });
        
        return errors;
    },
    
    showFormErrors: (form, errors) => {
        // Clear previous errors
        form.querySelectorAll('.form__error').forEach(error => error.remove());
        form.querySelectorAll('.form__input.error, .form__textarea.error, .form__select.error')
            .forEach(field => removeClass(field, 'error'));
        
        // Show new errors
        Object.keys(errors).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                addClass(field, 'error');
                const errorElement = document.createElement('div');
                errorElement.className = 'form__error';
                errorElement.textContent = errors[fieldName];
                field.parentNode.appendChild(errorElement);
            }
        });
    },
    
    clearFormErrors: (form) => {
        form.querySelectorAll('.form__error').forEach(error => error.remove());
        form.querySelectorAll('.form__input.error, .form__textarea.error, .form__select.error')
            .forEach(field => removeClass(field, 'error'));
    }
};

// ===== API UTILITIES =====
const api = {
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    get: (url, options = {}) => api.request(url, { ...options, method: 'GET' }),
    
    post: (url, data, options = {}) => api.request(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    put: (url, data, options = {}) => api.request(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    delete: (url, options = {}) => api.request(url, { ...options, method: 'DELETE' }),
};

// ===== ANIMATION UTILITIES =====
const animation = {
    fadeIn: (element, duration = 300) => {
        if (typeof element === 'string') {
            element = $(element);
        }
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    fadeOut: (element, duration = 300) => {
        if (typeof element === 'string') {
            element = $(element);
        }
        if (!element) return;
        
        let start = null;
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(initialOpacity - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    slideDown: (element, duration = 300) => {
        if (typeof element === 'string') {
            element = $(element);
        }
        if (!element) return;
        
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const height = Math.min((progress / duration) * targetHeight, targetHeight);
            
            element.style.height = height + 'px';
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    slideUp: (element, duration = 300) => {
        if (typeof element === 'string') {
            element = $(element);
        }
        if (!element) return;
        
        const targetHeight = element.scrollHeight;
        element.style.height = targetHeight + 'px';
        element.style.overflow = 'hidden';
        
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const height = Math.max(targetHeight - (progress / duration) * targetHeight, 0);
            
            element.style.height = height + 'px';
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// ===== SCROLL UTILITIES =====
const scroll = {
    to: (element, offset = 0, duration = 500) => {
        if (typeof element === 'string') {
            element = $(element);
        }
        if (!element) return;
        
        const targetPosition = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        const animate = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    },
    
    toTop: (duration = 500) => {
        scroll.to(document.body, 0, duration);
    },
    
    isInViewport: (element) => {
        if (typeof element === 'string') {
            element = $(element);
        }
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Easing function for smooth scrolling
const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

// ===== DEBOUNCE & THROTTLE =====
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ===== STRING UTILITIES =====
const stringUtils = {
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    truncate: (str, length, suffix = '...') => {
        return str.length > length ? str.substring(0, length) + suffix : str;
    },
    
    slugify: (str) => {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    
    formatCurrency: (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    },
    
    formatNumber: (number) => {
        return new Intl.NumberFormat('en-IN').format(number);
    }
};

// ===== DATE UTILITIES =====
const dateUtils = {
    format: (date, format = 'DD/MM/YYYY') => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year);
    },
    
    isToday: (date) => {
        const today = new Date();
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
    },
    
    isYesterday: (date) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const d = new Date(date);
        return d.toDateString() === yesterday.toDateString();
    },
    
    timeAgo: (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    }
};

// ===== EXPORT UTILITIES =====
window.BharatSetuUtils = {
    $,
    $$,
    addEventListeners,
    removeEventListeners,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    storage,
    validators,
    formUtils,
    api,
    animation,
    scroll,
    debounce,
    throttle,
    stringUtils,
    dateUtils
}; 