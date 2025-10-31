// Digital Pulse TLD dApp - Main JavaScript

// State
let walletConnected = false;
let walletAddress = null;

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const domainSearchInput = document.getElementById('domainSearch');
const tldSelect = document.getElementById('tldSelect');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const resultDomain = document.getElementById('resultDomain');
const resultStatus = document.getElementById('resultStatus');
const registerBtn = document.getElementById('registerBtn');

// Wallet Connection
if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', async () => {
        try {
            // Check if Phantom wallet is installed
            const { solana } = window;
            
            if (solana && solana.isPhantom) {
                const response = await solana.connect();
                walletAddress = response.publicKey.toString();
                walletConnected = true;
                
                connectWalletBtn.textContent = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
                connectWalletBtn.classList.add('glow-pulse');
                
                showNotification('Wallet connected successfully!', 'success');
            } else {
                showNotification('Please install Phantom wallet', 'error');
                window.open('https://phantom.app/', '_blank');
            }
        } catch (err) {
            console.error('Wallet connection error:', err);
            showNotification('Failed to connect wallet', 'error');
        }
    });
}

// Domain Search
if (searchBtn) {
    searchBtn.addEventListener('click', searchDomain);
    
    domainSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchDomain();
        }
    });
}

// TLD Card Clicks
document.querySelectorAll('.tld-card').forEach(card => {
    card.addEventListener('click', () => {
        const tld = card.dataset.tld;
        tldSelect.value = tld;
        domainSearchInput.focus();
    });
});

function searchDomain() {
    const domainName = domainSearchInput.value.trim().toLowerCase();
    const tld = tldSelect.value;
    
    if (!domainName) {
        showNotification('Please enter a domain name', 'error');
        return;
    }
    
    // Validate domain name (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(domainName)) {
        showNotification('Domain name can only contain letters, numbers, and hyphens', 'error');
        return;
    }
    
    if (domainName.length < 1 || domainName.length > 50) {
        showNotification('Domain name must be between 1 and 50 characters', 'error');
        return;
    }
    
    const fullDomain = domainName + tld;
    
    // Show loading
    searchBtn.textContent = 'Searching...';
    searchBtn.disabled = true;
    
    // Simulate blockchain query (replace with actual Solana query when contract is deployed)
    setTimeout(() => {
        const isAvailable = Math.random() > 0.3; // 70% chance available (for demo)
        
        resultDomain.textContent = fullDomain;
        
        if (isAvailable) {
            resultStatus.innerHTML = '<span class="status-badge status-available">✓ Available</span>';
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register Domain →';
        } else {
            resultStatus.innerHTML = '<span class="status-badge status-taken">✗ Already Registered</span>';
            registerBtn.disabled = true;
            registerBtn.textContent = 'Domain Unavailable';
        }
        
        searchResults.classList.remove('hidden');
        searchBtn.textContent = 'Search';
        searchBtn.disabled = false;
        
        // Scroll to results
        searchResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1000);
}

// Domain Registration
if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        if (!walletConnected) {
            showNotification('Please connect your wallet first', 'error');
            connectWalletBtn.click();
            return;
        }
        
        const domain = resultDomain.textContent;
        
        // Show confirmation
        if (!confirm(`Register ${domain} for 0.25 SOL?`)) {
            return;
        }
        
        registerBtn.textContent = 'Processing...';
        registerBtn.disabled = true;
        
        // Simulate registration (replace with actual Solana transaction when contract is deployed)
        setTimeout(() => {
            showNotification(`${domain} registered successfully! 🎉`, 'success');
            registerBtn.textContent = 'Registered ✓';
            
            // Redirect to My Domains after 2 seconds
            setTimeout(() => {
                window.location.href = 'my-domains.html';
            }, 2000);
        }, 2000);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
        type === 'success' ? 'bg-green-500/20 border border-green-500 text-green-400' :
        type === 'error' ? 'bg-red-500/20 border border-red-500 text-red-400' :
        'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Auto-connect wallet if previously connected
window.addEventListener('load', async () => {
    const { solana } = window;
    
    if (solana && solana.isPhantom) {
        try {
            const response = await solana.connect({ onlyIfTrusted: true });
            walletAddress = response.publicKey.toString();
            walletConnected = true;
            
            if (connectWalletBtn) {
                connectWalletBtn.textContent = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
                connectWalletBtn.classList.add('glow-pulse');
            }
        } catch (err) {
            // User hasn't approved auto-connect
            console.log('Auto-connect not approved');
        }
    }
});

// Note: This is a preview version. When the Solana smart contract is deployed to mainnet,
// these placeholder functions will be replaced with actual blockchain interactions using
// @solana/web3.js and @project-serum/anchor libraries.

