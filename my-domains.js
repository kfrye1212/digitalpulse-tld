// My Domains Page Logic
const RENEWAL_FEE = 0.15; // SOL
const MARKETPLACE_FEE = 0.05; // 5%

document.addEventListener('DOMContentLoaded', () => {
    checkWalletAndLoadDomains();
    
    // Listen for wallet changes
    if (window.solana) {
        window.solana.on('connect', () => {
            checkWalletAndLoadDomains();
        });
        
        window.solana.on('disconnect', () => {
            showConnectPrompt();
        });
    }
});

async function checkWalletAndLoadDomains() {
    if (walletAddress) {
        await loadUserDomains();
    } else {
        showConnectPrompt();
    }
}

function showConnectPrompt() {
    document.getElementById('connect-prompt').style.display = 'block';
    document.getElementById('domains-section').style.display = 'none';
}

function hideConnectPrompt() {
    document.getElementById('connect-prompt').style.display = 'none';
    document.getElementById('domains-section').style.display = 'block';
}

async function loadUserDomains() {
    hideConnectPrompt();
    
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
    const container = document.getElementById('domains-container');
    const emptyState = document.getElementById('empty-state');
    
    if (domains.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    domains.forEach(domain => {
        const card = createDomainCard(domain);
        container.appendChild(card);
    });
}

function createDomainCard(domain) {
    const card = document.createElement('div');
    card.className = 'domain-card';
    
    const daysUntilExpiry = Math.floor((domain.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry < 30;
    
    card.innerHTML = `
        <div class="domain-card-header">
            <div class="domain-name-large">
                ${domain.name}<span class="text-primary">${domain.tld}</span>
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
                <span class="info-value mono">${domain.nftMint}</span>
            </div>
            ${domain.isListed ? `
                <div class="info-row">
                    <span class="info-label">List Price:</span>
                    <span class="info-value text-gradient">${domain.listPrice} SOL</span>
                </div>
            ` : ''}
        </div>
        
        <div class="domain-card-actions">
            <button class="btn-secondary" onclick="renewDomain('${domain.name}', '${domain.tld}')">
                Renew (${RENEWAL_FEE} SOL)
            </button>
            <button class="btn-secondary" onclick="transferDomain('${domain.name}', '${domain.tld}')">
                Transfer
            </button>
            ${domain.isListed ? 
                `<button class="btn-secondary" onclick="unlistDomain('${domain.name}', '${domain.tld}')">Unlist</button>` :
                `<button class="btn-primary" onclick="listDomain('${domain.name}', '${domain.tld}')">List for Sale</button>`
            }
        </div>
    `;
    
    return card;
}

function updateStats(domains) {
    const totalDomains = domains.length;
    const activeDomains = domains.filter(d => d.expiryDate > new Date()).length;
    const expiringSoon = domains.filter(d => {
        const daysUntilExpiry = Math.floor((d.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry < 30 && daysUntilExpiry > 0;
    }).length;
    const listedDomains = domains.filter(d => d.isListed).length;
    
    document.getElementById('total-domains').textContent = totalDomains;
    document.getElementById('active-domains').textContent = activeDomains;
    document.getElementById('expiring-soon').textContent = expiringSoon;
    document.getElementById('listed-domains').textContent = listedDomains;
}

// Domain Actions
async function renewDomain(name, tld) {
    if (!walletAddress) {
        alert('Please connect your wallet first!');
        return;
    }
    
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
    if (!walletAddress) {
        alert('Please connect your wallet first!');
        return;
    }
    
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
    if (!walletAddress) {
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
    if (!walletAddress) {
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

