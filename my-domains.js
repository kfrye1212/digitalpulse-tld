// My Domains Page Logic
const RENEWAL_FEE = 0.15; // SOL
const MARKETPLACE_FEE = 0.05; // 5%

// Cache DOM elements
const domCache = {
    connectPrompt: null,
    domainsSection: null,
    domainsContainer: null,
    emptyState: null,
    totalDomains: null,
    activeDomains: null,
    expiringSoon: null,
    listedDomains: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM cache
    domCache.connectPrompt = document.getElementById('connect-prompt');
    domCache.domainsSection = document.getElementById('domains-section');
    domCache.domainsContainer = document.getElementById('domains-container');
    domCache.emptyState = document.getElementById('empty-state');
    domCache.totalDomains = document.getElementById('total-domains');
    domCache.activeDomains = document.getElementById('active-domains');
    domCache.expiringSoon = document.getElementById('expiring-soon');
    domCache.listedDomains = document.getElementById('listed-domains');
    
    checkWalletAndLoadDomains();
    
    // Set up event delegation for domain actions
    if (domCache.domainsContainer) {
        domCache.domainsContainer.addEventListener('click', handleDomainAction);
    }
    
    // Listen for wallet changes using walletManager
    walletManager.on('connect', () => {
        checkWalletAndLoadDomains();
    });
    
    walletManager.on('disconnect', () => {
        showConnectPrompt();
    });
});

async function checkWalletAndLoadDomains() {
    if (walletManager.isConnected()) {
        await loadUserDomains();
    } else {
        showConnectPrompt();
    }
}

function showConnectPrompt() {
    if (domCache.connectPrompt && domCache.domainsSection) {
        domCache.connectPrompt.style.display = 'block';
        domCache.domainsSection.style.display = 'none';
    }
}

function hideConnectPrompt() {
    if (domCache.connectPrompt && domCache.domainsSection) {
        domCache.connectPrompt.style.display = 'none';
        domCache.domainsSection.style.display = 'block';
    }
}

async function loadUserDomains() {
    hideConnectPrompt();
    
    const walletAddress = walletManager.getAddress();
    if (!walletAddress) return;
    
    // TODO: Replace with actual smart contract call
    // For now, simulate with demo data
    const domains = await fetchUserDomains(walletAddress);
    
    displayDomains(domains);
    updateStats(domains);
}

async function fetchUserDomains(walletAddress) {
    // TODO: Implement actual Solana program call
    // This is demo data for now
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo domains (replace with actual blockchain query)
    const demoDomains = [
        {
            name: 'myname',
            tld: '.pulse',
            registeredDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
            isListed: false,
            listPrice: null,
            nftMint: 'ABC123...'
        },
        {
            name: 'crypto',
            tld: '.verse',
            registeredDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            isListed: true,
            listPrice: 5.0,
            nftMint: 'DEF456...'
        }
    ];
    
    return demoDomains;
}

function displayDomains(domains) {
    if (!domCache.domainsContainer || !domCache.emptyState) return;
    
    if (domains.length === 0) {
        domCache.domainsContainer.innerHTML = '';
        domCache.emptyState.style.display = 'block';
        return;
    }
    
    domCache.emptyState.style.display = 'none';
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    domains.forEach(domain => {
        const card = createDomainCard(domain);
        fragment.appendChild(card);
    });
    
    domCache.domainsContainer.innerHTML = '';
    domCache.domainsContainer.appendChild(fragment);
}

function createDomainCard(domain) {
    const card = document.createElement('div');
    card.className = 'domain-card';
    
    const daysUntilExpiry = Math.floor((domain.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry < 30;
    
    card.innerHTML = `
        <div class="domain-card-header">
            <div class="domain-name-large">
                ${escapeHtml(domain.name)}<span class="text-primary">${escapeHtml(domain.tld)}</span>
            </div>
            ${domain.isListed ? '<span class="badge-listed">Listed</span>' : ''}
            ${isExpiringSoon ? '<span class="badge-expiring">Expiring Soon</span>' : ''}
        </div>
        
        <div class="domain-card-info">
            <div class="info-row">
                <span class="info-label">Registered:</span>
                <span class="info-value">${formatDate(domain.registeredDate)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Expires:</span>
                <span class="info-value ${isExpiringSoon ? 'text-warning' : ''}">${formatDate(domain.expiryDate)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">NFT Mint:</span>
                <span class="info-value mono">${escapeHtml(domain.nftMint)}</span>
            </div>
            ${domain.isListed ? `
                <div class="info-row">
                    <span class="info-label">List Price:</span>
                    <span class="info-value text-gradient">${domain.listPrice} SOL</span>
                </div>
            ` : ''}
        </div>
        
        <div class="domain-card-actions">
            <button class="btn-secondary" data-action="renew" data-name="${escapeHtml(domain.name)}" data-tld="${escapeHtml(domain.tld)}">
                Renew (${RENEWAL_FEE} SOL)
            </button>
            <button class="btn-secondary" data-action="transfer" data-name="${escapeHtml(domain.name)}" data-tld="${escapeHtml(domain.tld)}">
                Transfer
            </button>
            ${domain.isListed ? 
                `<button class="btn-secondary" data-action="unlist" data-name="${escapeHtml(domain.name)}" data-tld="${escapeHtml(domain.tld)}">Unlist</button>` :
                `<button class="btn-primary" data-action="list" data-name="${escapeHtml(domain.name)}" data-tld="${escapeHtml(domain.tld)}">List for Sale</button>`
            }
        </div>
    `;
    
    return card;
}

// Event delegation handler for domain actions
function handleDomainAction(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const { name, tld } = target.dataset;
    
    switch (action) {
        case 'renew':
            renewDomain(name, tld);
            break;
        case 'transfer':
            transferDomain(name, tld);
            break;
        case 'list':
            listDomain(name, tld);
            break;
        case 'unlist':
            unlistDomain(name, tld);
            break;
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStats(domains) {
    const totalDomains = domains.length;
    const activeDomains = domains.filter(d => d.expiryDate > new Date()).length;
    const expiringSoon = domains.filter(d => {
        const daysUntilExpiry = Math.floor((d.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry < 30 && daysUntilExpiry > 0;
    }).length;
    const listedDomains = domains.filter(d => d.isListed).length;
    
    if (domCache.totalDomains) domCache.totalDomains.textContent = totalDomains;
    if (domCache.activeDomains) domCache.activeDomains.textContent = activeDomains;
    if (domCache.expiringSoon) domCache.expiringSoon.textContent = expiringSoon;
    if (domCache.listedDomains) domCache.listedDomains.textContent = listedDomains;
}

// Domain Actions
async function renewDomain(name, tld) {
    if (!walletManager.isConnected()) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const walletAddress = walletManager.getAddress();
    
    const confirmed = confirm(
        `Renew ${name}${tld} for 1 year?\n\n` +
        `Renewal Fee: ${RENEWAL_FEE} SOL\n` +
        `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    );
    
    if (confirmed) {
        // TODO: Implement actual Solana transaction
        alert('Renewal transaction initiated! Smart contract integration in progress.');
        // After successful renewal, reload domains
        // await loadUserDomains();
    }
}

async function transferDomain(name, tld) {
    if (!walletManager.isConnected()) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const walletAddress = walletManager.getAddress();
    
    const recipientAddress = prompt(
        `Transfer ${name}${tld} to:\n\n` +
        `Enter recipient's Solana wallet address:`
    );
    
    if (recipientAddress && recipientAddress.length > 30) {
        const confirmed = confirm(
            `Transfer ${name}${tld}?\n\n` +
            `To: ${recipientAddress.slice(0, 4)}...${recipientAddress.slice(-4)}\n` +
            `From: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}\n\n` +
            `This action cannot be undone!`
        );
        
        if (confirmed) {
            // TODO: Implement actual Solana NFT transfer
            alert('Transfer transaction initiated! Smart contract integration in progress.');
            // After successful transfer, reload domains
            // await loadUserDomains();
        }
    } else if (recipientAddress) {
        alert('Invalid wallet address. Please enter a valid Solana address.');
    }
}

async function listDomain(name, tld) {
    if (!walletManager.isConnected()) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const price = prompt(
        `List ${name}${tld} for sale\n\n` +
        `Enter price in SOL:\n` +
        `(Marketplace fee: ${MARKETPLACE_FEE * 100}%)`
    );
    
    if (price && !isNaN(price) && parseFloat(price) > 0) {
        const priceNum = parseFloat(price);
        const fee = priceNum * MARKETPLACE_FEE;
        const youReceive = priceNum - fee;
        
        const confirmed = confirm(
            `List ${name}${tld} for ${priceNum} SOL?\n\n` +
            `List Price: ${priceNum} SOL\n` +
            `Marketplace Fee (${MARKETPLACE_FEE * 100}%): ${fee.toFixed(3)} SOL\n` +
            `You Receive: ${youReceive.toFixed(3)} SOL`
        );
        
        if (confirmed) {
            // TODO: Implement actual marketplace listing
            alert('Listing transaction initiated! Smart contract integration in progress.');
            // After successful listing, reload domains
            // await loadUserDomains();
        }
    } else if (price) {
        alert('Invalid price. Please enter a valid number.');
    }
}

async function unlistDomain(name, tld) {
    if (!walletManager.isConnected()) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const confirmed = confirm(
        `Remove ${name}${tld} from marketplace?`
    );
    
    if (confirmed) {
        // TODO: Implement actual marketplace unlisting
        alert('Unlisting transaction initiated! Smart contract integration in progress.');
        // After successful unlisting, reload domains
        // await loadUserDomains();
    }
}

// Utility Functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

