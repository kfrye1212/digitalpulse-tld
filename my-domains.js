// My Domains Page Logic

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
    DOMCache.get('#connect-prompt').style.display = 'block';
    DOMCache.get('#domains-section').style.display = 'none';
}

function hideConnectPrompt() {
    DOMCache.get('#connect-prompt').style.display = 'none';
    DOMCache.get('#domains-section').style.display = 'block';
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
    await simulateDelay(500);
    
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
    const container = DOMCache.get('#domains-container');
    const emptyState = DOMCache.get('#empty-state');
    
    if (domains.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    domains.forEach(domain => {
        const card = createDomainCard(domain);
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

function createDomainCard(domain) {
    const card = document.createElement('div');
    card.className = 'domain-card';
    
    const daysUntilExpiry = daysUntil(domain.expiryDate);
    const expiringSoon = isExpiringSoon(domain.expiryDate);
    
    card.innerHTML = `
        <div class="domain-card-header">
            <div class="domain-name-large">
                ${domain.name}<span class="text-primary">${domain.tld}</span>
            </div>
            ${domain.isListed ? '<span class="badge-listed">Listed</span>' : ''}
            ${expiringSoon ? '<span class="badge-expiring">Expiring Soon</span>' : ''}
        </div>
        
        <div class="domain-card-info">
            <div class="info-row">
                <span class="info-label">Registered:</span>
                <span class="info-value">${formatDate(domain.registeredDate)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Expires:</span>
                <span class="info-value ${expiringSoon ? 'text-warning' : ''}">${formatDate(domain.expiryDate)}</span>
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
                Renew (${CONSTANTS.RENEWAL_FEE} SOL)
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
    const expiringSoon = domains.filter(d => isExpiringSoon(d.expiryDate)).length;
    const listedDomains = domains.filter(d => d.isListed).length;
    
    DOMCache.get('#total-domains').textContent = totalDomains;
    DOMCache.get('#active-domains').textContent = activeDomains;
    DOMCache.get('#expiring-soon').textContent = expiringSoon;
    DOMCache.get('#listed-domains').textContent = listedDomains;
}

// Domain Actions
async function renewDomain(name, tld) {
    if (!walletAddress) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const confirmed = confirm(
        `Renew ${name}${tld} for 1 year?\n\n` +
        `Renewal Fee: ${CONSTANTS.RENEWAL_FEE} SOL\n` +
        `Wallet: ${formatWalletAddress(walletAddress)}`
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
    
    if (recipientAddress && isValidSolanaAddress(recipientAddress)) {
        const confirmed = confirm(
            `Transfer ${name}${tld}?\n\n` +
            `To: ${formatWalletAddress(recipientAddress)}\n` +
            `From: ${formatWalletAddress(walletAddress)}\n\n` +
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
        `(Marketplace fee: ${CONSTANTS.MARKETPLACE_FEE_PERCENT}%)`
    );
    
    if (price && isValidPrice(price)) {
        const priceNum = parseFloat(price);
        const feeInfo = calculateMarketplaceFee(priceNum);
        
        const confirmed = confirm(
            `List ${name}${tld} for ${priceNum} SOL?\n\n` +
            `List Price: ${priceNum} SOL\n` +
            `Marketplace Fee (${feeInfo.feePercent}%): ${feeInfo.fee} SOL\n` +
            `You Receive: ${feeInfo.sellerReceives} SOL`
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

