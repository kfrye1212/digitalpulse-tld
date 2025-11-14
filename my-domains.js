// My Domains Page Logic
// Constants are imported from solana-utils.js

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
    // Use Solana utilities to fetch user domains from blockchain
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch from blockchain (currently uses localStorage for demo)
    const domains = await window.SolanaUtils.fetchUserDomains(walletAddress);
    
    return domains;
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
                Renew (${window.SolanaUtils.RENEWAL_FEE} SOL)
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
        `Renewal Fee: ${window.SolanaUtils.RENEWAL_FEE} SOL\n` +
        `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    );
    
    if (!confirmed) return;
    
    try {
        // Get wallet public key
        const provider = window.solana;
        const publicKey = provider.publicKey;
        
        alert('Processing renewal transaction...');
        
        // Renew domain using Solana utilities
        const result = await window.SolanaUtils.renewDomain(name, tld, publicKey);
        
        if (result.success) {
            alert(`✅ ${result.message}\n\nTransaction: ${result.signature}`);
            
            // Reload domains to reflect the renewal
            await loadUserDomains();
        } else {
            alert(`❌ Renewal failed:\n${result.error}`);
        }
    } catch (error) {
        console.error('Renewal error:', error);
        alert(`❌ Renewal failed:\n${error.message}`);
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
    
    if (!recipientAddress) return;
    
    if (recipientAddress.length < 32 || recipientAddress.length > 44) {
        alert('Invalid wallet address. Please enter a valid Solana address.');
        return;
    }
    
    const confirmed = confirm(
        `Transfer ${name}${tld}?\n\n` +
        `To: ${recipientAddress.slice(0, 4)}...${recipientAddress.slice(-4)}\n` +
        `From: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}\n\n` +
        `This action cannot be undone!`
    );
    
    if (!confirmed) return;
    
    try {
        // Get wallet public key
        const provider = window.solana;
        const publicKey = provider.publicKey;
        
        alert('Processing transfer transaction...');
        
        // Transfer domain using Solana utilities
        const result = await window.SolanaUtils.transferDomain(name, tld, recipientAddress, publicKey);
        
        if (result.success) {
            alert(
                `✅ ${result.message}\n\n` +
                `Transaction: ${result.signature}\n` +
                `Domain: ${result.domain}\n` +
                `Recipient: ${result.recipient.slice(0, 4)}...${result.recipient.slice(-4)}`
            );
            
            // Reload domains to reflect the transfer
            await loadUserDomains();
        } else {
            alert(`❌ Transfer failed:\n${result.error}`);
        }
    } catch (error) {
        console.error('Transfer error:', error);
        alert(`❌ Transfer failed:\n${error.message}`);
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
        `(Marketplace fee: ${window.SolanaUtils.MARKETPLACE_FEE_PERCENT/100 * 100}%)`
    );
    
    if (!price) return;
    
    if (isNaN(price) || parseFloat(price) <= 0) {
        alert('Invalid price. Please enter a valid number.');
        return;
    }
    
    const priceNum = parseFloat(price);
    const fee = priceNum * window.SolanaUtils.MARKETPLACE_FEE_PERCENT/100;
    const youReceive = priceNum - fee;
    
    const confirmed = confirm(
        `List ${name}${tld} for ${priceNum} SOL?\n\n` +
        `List Price: ${priceNum} SOL\n` +
        `Marketplace Fee (${window.SolanaUtils.MARKETPLACE_FEE_PERCENT/100 * 100}%): ${fee.toFixed(3)} SOL\n` +
        `You Receive: ${youReceive.toFixed(3)} SOL`
    );
    
    if (!confirmed) return;
    
    try {
        // Get wallet public key
        const provider = window.solana;
        const publicKey = provider.publicKey;
        
        alert('Processing listing transaction...');
        
        // List domain using Solana utilities
        const result = await window.SolanaUtils.listDomainForSale(name, tld, priceNum, publicKey);
        
        if (result.success) {
            alert(`✅ ${result.message}\n\nDomain: ${result.domain}\nPrice: ${result.price} SOL`);
            
            // Reload domains to reflect the listing
            await loadUserDomains();
        } else {
            alert(`❌ Listing failed:\n${result.error}`);
        }
    } catch (error) {
        console.error('Listing error:', error);
        alert(`❌ Listing failed:\n${error.message}`);
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
    
    if (!confirmed) return;
    
    try {
        // Get wallet public key
        const provider = window.solana;
        const publicKey = provider.publicKey;
        
        alert('Processing unlisting transaction...');
        
        // Unlist domain using Solana utilities
        const result = await window.SolanaUtils.unlistDomain(name, tld, publicKey);
        
        if (result.success) {
            alert(`✅ ${result.message}\n\nDomain: ${result.domain}`);
            
            // Reload domains to reflect the unlisting
            await loadUserDomains();
        } else {
            alert(`❌ Unlisting failed:\n${result.error}`);
        }
    } catch (error) {
        console.error('Unlisting error:', error);
        alert(`❌ Unlisting failed:\n${error.message}`);
    }
}

// Utility Functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

