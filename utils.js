// Shared Utilities for Digital Pulse TLD

// Global wallet state management
let walletAddress = null;

// DOM Element Cache
const DOMCache = {
    elements: new Map(),
    
    get(selector) {
        if (!this.elements.has(selector)) {
            this.elements.set(selector, document.querySelector(selector));
        }
        return this.elements.get(selector);
    },
    
    getAll(selector) {
        if (!this.elements.has(selector)) {
            this.elements.set(selector, document.querySelectorAll(selector));
        }
        return this.elements.get(selector);
    },
    
    clear() {
        this.elements.clear();
    }
};

// Constants
const CONSTANTS = {
    TLDS: ['.pulse', '.verse', '.cp', '.pv'],
    MARKETPLACE_FEE_PERCENT: 5,
    RENEWAL_FEE: 0.15,
    REGISTRATION_FEE: 0.25,
    SEARCH_DEBOUNCE_MS: 300,
    API_DELAY_MS: 800,
    EXPIRY_WARNING_DAYS: 30
};

// Debounce utility
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Date formatting utility
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Calculate days until date
function daysUntil(date) {
    return Math.floor((date - new Date()) / (1000 * 60 * 60 * 24));
}

// Marketplace fee calculation
function calculateMarketplaceFee(price, feePercent = CONSTANTS.MARKETPLACE_FEE_PERCENT) {
    const fee = price * (feePercent / 100);
    const sellerReceives = price - fee;
    return {
        fee: parseFloat(fee.toFixed(3)),
        sellerReceives: parseFloat(sellerReceives.toFixed(3)),
        feePercent
    };
}

// Format wallet address for display
function formatWalletAddress(address, startChars = 4, endChars = 4) {
    if (!address || address.length < startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// Simulate API delay (for demo purposes)
function simulateDelay(ms = CONSTANTS.API_DELAY_MS) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if domain is expiring soon
function isExpiringSoon(expiryDate, warningDays = CONSTANTS.EXPIRY_WARNING_DAYS) {
    const days = daysUntil(expiryDate);
    return days < warningDays && days > 0;
}

// Validate Solana wallet address (basic validation)
function isValidSolanaAddress(address) {
    return address && typeof address === 'string' && address.length >= 32 && address.length <= 44;
}

// Validate price input
function isValidPrice(price) {
    return !isNaN(price) && parseFloat(price) > 0;
}

// Safe JSON stringify for onclick handlers
function escapeForOnClick(obj) {
    return JSON.stringify(obj).replace(/"/g, '&quot;');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        walletAddress,
        DOMCache,
        CONSTANTS,
        debounce,
        formatDate,
        daysUntil,
        calculateMarketplaceFee,
        formatWalletAddress,
        simulateDelay,
        isExpiringSoon,
        isValidSolanaAddress,
        isValidPrice,
        escapeForOnClick
    };
}
