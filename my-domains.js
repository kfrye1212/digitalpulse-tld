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
    // Fetch user's domains from blockchain
    return await solanaContract.getUserDomains(walletAddress);
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
        `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}\n\n` +
        `This will create a transaction on Solana blockchain.`
    );
    
    if (confirmed) {
        try {
            const result = await solanaContract.renewDomain(name, tld, RENEWAL_FEE);
            
            if (result.success) {
                alert(
                    `✅ Domain Renewed Successfully!\n\n` +
                    `${name}${tld}\n` +
                    `Transaction: ${result.signature.slice(0, 8)}...${result.signature.slice(-8)}`
                );
                // Reload domains
                await loadUserDomains();
            }
        } catch (error) {
            console.error('Renewal failed:', error);
            alert(
                'Renewal failed!\n\n' +
                'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                'Please make sure you have enough SOL in your wallet and try again.'
            );
        }
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
            `This action cannot be undone!\n` +
            `This will create a transaction on Solana blockchain.`
        );
        
        if (confirmed) {
            try {
                const result = await solanaContract.transferDomain(name, tld, recipientAddress);
                
                if (result.success) {
                    alert(
                        `✅ Domain Transferred Successfully!\n\n` +
                        `${name}${tld}\n` +
                        `To: ${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-8)}\n` +
                        `Transaction: ${result.signature.slice(0, 8)}...${result.signature.slice(-8)}`
                    );
                    // Reload domains
                    await loadUserDomains();
                }
            } catch (error) {
                console.error('Transfer failed:', error);
                alert(
                    'Transfer failed!\n\n' +
                    'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                    'Please check the recipient address and try again.'
                );
            }
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
            `You Receive: ${youReceive.toFixed(3)} SOL\n\n` +
            `This will create a transaction on Solana blockchain.`
        );
        
        if (confirmed) {
            try {
                const result = await solanaContract.listDomainForSale(name, tld, priceNum);
                
                if (result.success) {
                    alert(
                        `✅ Domain Listed Successfully!\n\n` +
                        `${name}${tld}\n` +
                        `Price: ${priceNum} SOL\n` +
                        `Transaction: ${result.signature.slice(0, 8)}...${result.signature.slice(-8)}`
                    );
                    // Reload domains
                    await loadUserDomains();
                }
            } catch (error) {
                console.error('Listing failed:', error);
                alert(
                    'Listing failed!\n\n' +
                    'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                    'Please try again.'
                );
            }
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
        `Remove ${name}${tld} from marketplace?\n\n` +
        `This will create a transaction on Solana blockchain.`
    );
    
    if (confirmed) {
        try {
            const result = await solanaContract.unlistDomain(name, tld);
            
            if (result.success) {
                alert(
                    `✅ Domain Unlisted Successfully!\n\n` +
                    `${name}${tld} has been removed from the marketplace.`
                );
                // Reload domains
                await loadUserDomains();
            }
        } catch (error) {
            console.error('Unlisting failed:', error);
            alert(
                'Unlisting failed!\n\n' +
                'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                'Please try again.'
            );
        }
    }
}

// Utility Functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

