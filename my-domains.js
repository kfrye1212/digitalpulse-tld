// My Domains - Blockchain Integration
let walletAddress = null;
let walletBalance = 0;

document.addEventListener('DOMContentLoaded', () => {
    initializeWallet();
    
    // Listen for wallet changes
    if (window.solana) {
        window.solana.on('connect', async (publicKey) => {
            walletAddress = publicKey.toString();
            await checkWalletAndLoadDomains();
        });
        
        window.solana.on('disconnect', () => {
            walletAddress = null;
            showConnectPrompt();
        });
    }
});

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
        showConnectPrompt();
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
        await checkWalletAndLoadDomains();
    } catch (err) {
        // Not connected yet
        showConnectPrompt();
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
        
        await checkWalletAndLoadDomains();
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
        
        showConnectPrompt();
    } catch (err) {
        console.error('Failed to disconnect wallet:', err);
    }
}

async function checkWalletAndLoadDomains() {
    if (walletAddress) {
        await loadUserDomains();
    } else {
        showConnectPrompt();
    }
}

function showConnectPrompt() {
    const connectPrompt = document.getElementById('connect-prompt');
    const domainsSection = document.getElementById('domains-section');
    
    if (connectPrompt) connectPrompt.style.display = 'block';
    if (domainsSection) domainsSection.style.display = 'none';
}

function hideConnectPrompt() {
    const connectPrompt = document.getElementById('connect-prompt');
    const domainsSection = document.getElementById('domains-section');
    
    if (connectPrompt) connectPrompt.style.display = 'none';
    if (domainsSection) domainsSection.style.display = 'block';
}

async function loadUserDomains() {
    hideConnectPrompt();
    
    try {
        showLoading('Loading your domains...');
        
        // Fetch domains from blockchain
        const domains = await blockchainService.getUserDomains(walletAddress);
        
        hideLoading();
        
        if (domains && domains.length > 0) {
            displayDomains(domains);
            updateStats(domains);
        } else {
            displayNoDomains();
        }
    } catch (error) {
        hideLoading();
        console.error('Error loading domains:', error);
        showNotification('Failed to load domains. Please try again.', 'error');
        displayNoDomains();
    }
}

function displayNoDomains() {
    const container = document.getElementById('domains-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card-glass" style="text-align: center; padding: 48px;">
            <h3 style="color: var(--cyan); margin-bottom: 16px;">No Domains Yet</h3>
            <p style="color: rgba(255, 255, 255, 0.6); margin-bottom: 24px;">
                You haven't registered any domains yet. Start building your Web3 identity!
            </p>
            <a href="/" class="btn-primary">Search Domains</a>
        </div>
    `;
    
    updateStats([]);
}

function displayDomains(domains) {
    const container = document.getElementById('domains-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    domains.forEach(domain => {
        const card = createDomainCard(domain);
        container.appendChild(card);
    });
}

function createDomainCard(domain) {
    const card = document.createElement('div');
    card.className = 'domain-card';
    
    const daysUntilExpiry = Math.floor((domain.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry < 30;
    
    card.innerHTML = `
        <div class="domain-card-header">
            <h3 class="domain-name-large">${escapeHtml(domain.name)}${escapeHtml(domain.tld)}</h3>
            <div>
                ${domain.isListed ? '<span class="badge-listed">Listed for Sale</span>' : ''}
                ${isExpiringSoon ? '<span class="badge-expiring">Expiring Soon</span>' : ''}
            </div>
        </div>
        
        <div class="domain-card-info">
            <div class="info-row">
                <span class="info-label">Registered</span>
                <span class="info-value">${new Date(domain.registeredAt).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Expires</span>
                <span class="info-value ${isExpiringSoon ? 'text-warning' : ''}">
                    ${new Date(domain.expiresAt).toLocaleDateString()} (${daysUntilExpiry} days)
                </span>
            </div>
            ${domain.isListed ? `
            <div class="info-row">
                <span class="info-label">List Price</span>
                <span class="info-value">${domain.listPrice} SOL</span>
            </div>
            ` : ''}
        </div>
        
        <div class="domain-card-actions">
            <button class="btn-primary" onclick="renewDomain('${escapeHtml(domain.name)}', '${escapeHtml(domain.tld)}')">
                Renew (${(RENEWAL_FEE / 1_000_000_000)} SOL)
            </button>
            ${!domain.isListed ? `
            <button class="btn-secondary" onclick="listForSale('${escapeHtml(domain.name)}', '${escapeHtml(domain.tld)}')">
                List for Sale
            </button>
            ` : `
            <button class="btn-secondary" onclick="unlistDomain('${escapeHtml(domain.name)}', '${escapeHtml(domain.tld)}')">
                Unlist
            </button>
            `}
        </div>
    `;
    
    return card;
}

function updateStats(domains) {
    const totalDomains = domains.length;
    const expiringSoon = domains.filter(d => {
        const daysUntilExpiry = Math.floor((d.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry < 30;
    }).length;
    const listed = domains.filter(d => d.isListed).length;
    
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalDomains}</div>
            <div class="stat-label">Total Domains</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${expiringSoon}</div>
            <div class="stat-label">Expiring Soon</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${listed}</div>
            <div class="stat-label">Listed for Sale</div>
        </div>
    `;
}

async function renewDomain(name, tld) {
    if (!walletAddress) {
        showNotification('Please connect your wallet first!', 'error');
        return;
    }
    
    // Check balance
    if (walletBalance < (RENEWAL_FEE / 1_000_000_000)) {
        showNotification('Insufficient SOL balance for renewal.', 'error');
        return;
    }
    
    const confirmed = confirm(
        `Renew ${name}${tld} for 1 year?\n\n` +
        `Cost: ${(RENEWAL_FEE / 1_000_000_000)} SOL\n` +
        `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    );
    
    if (!confirmed) return;
    
    try {
        showLoading('Renewing domain...');
        
        const result = await blockchainService.renewDomain(name, tld.replace('.', ''));
        
        hideLoading();
        showNotification(`Domain ${name}${tld} renewed successfully!`, 'success');
        
        // Reload domains
        setTimeout(() => loadUserDomains(), 2000);
        
        // Update balance
        walletBalance = await blockchainService.getBalance(walletAddress);
    } catch (error) {
        hideLoading();
        handleTransactionError(error);
    }
}

async function listForSale(name, tld) {
    const price = prompt(`Enter sale price in SOL for ${name}${tld}:`);
    
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        showNotification('Invalid price entered.', 'error');
        return;
    }
    
    try {
        showLoading('Listing domain for sale...');
        
        // TODO: Implement marketplace listing
        showNotification('Marketplace listing coming soon!', 'info');
        
        hideLoading();
    } catch (error) {
        hideLoading();
        handleTransactionError(error);
    }
}

async function unlistDomain(name, tld) {
    const confirmed = confirm(`Remove ${name}${tld} from marketplace?`);
    
    if (!confirmed) return;
    
    try {
        showLoading('Unlisting domain...');
        
        // TODO: Implement marketplace unlisting
        showNotification('Marketplace unlisting coming soon!', 'info');
        
        hideLoading();
    } catch (error) {
        hideLoading();
        handleTransactionError(error);
    }
}

// Constants are defined in config.js
