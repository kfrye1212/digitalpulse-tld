// DigitalPulse TLD Utility Functions

/**
 * HTML Escaping for XSS Prevention
 * Escapes HTML special characters to prevent XSS attacks
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Validate domain name
 * Returns true if domain name is valid
 */
function validateDomainName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }
    
    // Check length (1-63 characters)
    if (name.length < 1 || name.length > 63) {
        return false;
    }
    
    // Check for valid characters (alphanumeric and hyphens, but not starting/ending with hyphen)
    const validPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return validPattern.test(name.toLowerCase());
}

/**
 * Format SOL amount from lamports
 */
function formatSOL(lamports) {
    return (lamports / 1_000_000_000).toFixed(2);
}

/**
 * Convert SOL to lamports
 */
function solToLamports(sol) {
    return Math.floor(sol * 1_000_000_000);
}

/**
 * Format wallet address for display
 */
function formatAddress(address, startChars = 4, endChars = 4) {
    if (!address) return '';
    const addrStr = address.toString();
    if (addrStr.length <= startChars + endChars) {
        return addrStr;
    }
    return `${addrStr.slice(0, startChars)}...${addrStr.slice(-endChars)}`;
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Calculate days until expiration
 */
function daysUntilExpiration(expiresAt) {
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = expiresAt - now;
    return Math.floor(secondsLeft / (24 * 60 * 60));
}

/**
 * Check if domain is expired
 */
function isDomainExpired(expiresAt) {
    const now = Math.floor(Date.now() / 1000);
    return expiresAt < now;
}

/**
 * Get PDA for service account
 */
async function getServicePDA(programId) {
    const { PublicKey } = window.solanaWeb3;
    const [pda] = await PublicKey.findProgramAddress(
        [Buffer.from('service')],
        new PublicKey(programId)
    );
    return pda;
}

/**
 * Get PDA for TLD account
 */
async function getTLDPDA(tldName, programId) {
    const { PublicKey } = window.solanaWeb3;
    const [pda] = await PublicKey.findProgramAddress(
        [Buffer.from('tld'), Buffer.from(tldName)],
        new PublicKey(programId)
    );
    return pda;
}

/**
 * Get PDA for domain account
 */
async function getDomainPDA(domainName, tldName, programId) {
    const { PublicKey } = window.solanaWeb3;
    const [pda] = await PublicKey.findProgramAddress(
        [Buffer.from('domain'), Buffer.from(domainName), Buffer.from(tldName)],
        new PublicKey(programId)
    );
    return pda;
}

/**
 * Show loading indicator
 */
function showLoading(message = 'Processing...') {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        const messageEl = loader.querySelector('.loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        loader.style.display = 'flex';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Handle transaction errors
 */
function handleTransactionError(error) {
    console.error('Transaction error:', error);
    
    let message = 'Transaction failed. Please try again.';
    
    if (error.message) {
        if (error.message.includes('User rejected')) {
            message = 'Transaction cancelled by user.';
        } else if (error.message.includes('insufficient')) {
            message = 'Insufficient SOL balance for this transaction.';
        } else if (error.message.includes('already in use')) {
            message = 'This domain is already registered.';
        } else {
            message = error.message;
        }
    }
    
    showNotification(message, 'error');
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        validateDomainName,
        formatSOL,
        solToLamports,
        formatAddress,
        formatDate,
        daysUntilExpiration,
        isDomainExpired,
        getServicePDA,
        getTLDPDA,
        getDomainPDA,
        showLoading,
        hideLoading,
        showNotification,
        handleTransactionError
    };
}
