// TLD Options (TLDS constant is defined in config.js)
let selectedTLD = 'all';
let walletAddress = null;
let walletBalance = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTLDSelector();
    initializeSearch();
    initializeWallet();
});

// TLD Selector
function initializeTLDSelector() {
    const tldButtons = document.querySelectorAll('.tld-btn');
    
    tldButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tldButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTLD = btn.dataset.tld;
        });
    });
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('domain-search');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

async function performSearch() {
    const searchInput = document.getElementById('domain-search');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) return;
    
    // Validate domain name
    if (!validateDomainName(query)) {
        showNotification('Invalid domain name. Use only lowercase letters, numbers, and hyphens.', 'error');
        return;
    }
    
    const searchBtn = document.getElementById('search-btn');
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    
    try {
        // Search on blockchain
        const tldsToSearch = selectedTLD === 'all' ? ['pulse', 'verse', 'cp', 'pv'] : [selectedTLD.replace('.', '')];
        const results = [];
        
        for (const tld of tldsToSearch) {
            try {
                const availability = await blockchainService.checkDomainAvailability(query, tld);
                results.push({
                    name: query,
                    tld: '.' + tld,
                    tldName: tld,
                    available: availability.available,
                    price: formatSOL(REGISTRATION_FEE),
                    domainData: availability.domain
                });
            } catch (error) {
                console.error(`Error checking ${query}.${tld}:`, error);
                // Add as potentially available if check fails
                results.push({
                    name: query,
                    tld: '.' + tld,
                    tldName: tld,
                    available: true,
                    price: formatSOL(REGISTRATION_FEE),
                    domainData: null
                });
            }
        }
        
        displayResults(results);
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed. Please try again.', 'error');
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

function displayResults(results) {
    const resultsSection = document.getElementById('search-results');
    const resultsContainer = document.getElementById('results-container');
    
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    results.forEach(result => {
        const card = createResultCard(result);
        resultsContainer.appendChild(card);
    });
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function createResultCard(result) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    const statusClass = result.available ? 'available' : 'unavailable';
    const statusText = result.available ? 'Available' : 'Already registered';
    
    card.innerHTML = `
        <div class="result-info">
            <div class="status-dot ${statusClass}"></div>
            <div>
                <div class="result-domain">
                    ${escapeHtml(result.name)}<span class="text-primary">${escapeHtml(result.tld)}</span>
                </div>
                <div class="result-status">${statusText}</div>
            </div>
        </div>
        <div class="result-actions">
            <div class="result-price">
                <div class="price-value">${escapeHtml(result.price)} SOL</div>
                <div class="price-label">Registration fee</div>
            </div>
            ${result.available ? 
                `<button class="btn-primary" onclick="registerDomain('${escapeHtml(result.name)}', '${escapeHtml(result.tldName)}', ${result.price})">Register</button>` :
                `<button class="btn-secondary" disabled>Unavailable</button>`
            }
        </div>
    `;
    
    return card;
}

// Domain Registration
async function registerDomain(name, tldName, price) {
    if (!walletAddress) {
        showNotification('Please connect your wallet first!', 'error');
        return;
    }
    
    // Check balance
    if (walletBalance < parseFloat(price)) {
        showNotification('Insufficient SOL balance for registration.', 'error');
        return;
    }
    
    const confirmed = confirm(
        `Register ${name}.${tldName}?\n\n` +
        `Price: ${price} SOL\n` +
        `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    );
    
    if (!confirmed) return;
    
    try {
        showLoading('Registering domain...');
        
        const result = await blockchainService.registerDomain(name, tldName);
        
        hideLoading();
        showNotification(`Domain ${result.domain} registered successfully!`, 'success');
        
        // Refresh search to show updated status
        setTimeout(() => performSearch(), 2000);
        
        // Update balance
        walletBalance = await blockchainService.getBalance(walletAddress);
    } catch (error) {
        hideLoading();
        handleTransactionError(error);
    }
}

// Wallet Integration
async function initializeWallet() {
    const walletButtonContainer = document.getElementById('wallet-button-container');
    
    // Check if Phantom wallet is installed
    const isPhantomInstalled = window.solana && window.solana.isPhantom;
    
    if (!isPhantomInstalled) {
        walletButtonContainer.innerHTML = `
            <a href="https://phantom.app/" target="_blank" class="btn-secondary">
                Install Phantom
            </a>
        `;
        return;
    }
    
    // Create wallet button
    const walletBtn = document.createElement('button');
    walletBtn.className = 'btn-primary';
    walletBtn.textContent = 'Connect Wallet';
    walletBtn.onclick = connectWallet;
    
    walletButtonContainer.appendChild(walletBtn);
    
    // Check if already connected
    try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        walletAddress = response.publicKey.toString();
        updateWalletButton(walletBtn);
    } catch (err) {
        // Not connected yet
    }
}

async function connectWallet() {
    try {
        showLoading('Connecting wallet...');
        
        const response = await window.solana.connect();
        walletAddress = response.publicKey.toString();
        
        // Initialize blockchain service with wallet
        await blockchainService.connectWallet(window.solana);
        
        // Get wallet balance
        walletBalance = await blockchainService.getBalance(walletAddress);
        
        const walletBtn = document.querySelector('#wallet-button-container button');
        updateWalletButton(walletBtn);
        
        hideLoading();
        showNotification('Wallet connected successfully!', 'success');
        console.log('Connected to wallet:', walletAddress);
    } catch (err) {
        hideLoading();
        console.error('Failed to connect wallet:', err);
        showNotification('Failed to connect wallet. Please try again.', 'error');
    }
}

function updateWalletButton(btn) {
    if (walletAddress) {
        btn.textContent = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
        btn.onclick = disconnectWallet;
    }
}

async function disconnectWallet() {
    try {
        await window.solana.disconnect();
        walletAddress = null;
        
        const walletBtn = document.querySelector('#wallet-button-container button');
        walletBtn.textContent = 'Connect Wallet';
        walletBtn.onclick = connectWallet;
        
        console.log('Disconnected wallet');
    } catch (err) {
        console.error('Failed to disconnect wallet:', err);
    }
}

// Listen for wallet changes
if (window.solana) {
    window.solana.on('connect', (publicKey) => {
        walletAddress = publicKey.toString();
        console.log('Wallet connected:', walletAddress);
    });
    
    window.solana.on('disconnect', () => {
        walletAddress = null;
        console.log('Wallet disconnected');
    });
}

