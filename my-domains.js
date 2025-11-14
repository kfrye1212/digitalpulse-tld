// My Domains Page Logic
const RENEWAL_FEE = 0.15; // SOL
const MARKETPLACE_FEE = 0.05; // 5%

let solanaConnection = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Solana connection
    try {
        solanaConnection = await createSolanaConnection();
        console.log('My Domains connected to Solana:', getSolanaConfig().network);
    } catch (error) {
        console.error('Failed to connect to Solana:', error);
    }
    
    await checkWalletAndLoadDomains();
    
    // Listen for wallet changes
    const provider = getWalletProvider();
    if (provider) {
        provider.on('connect', async () => {
            await checkWalletAndLoadDomains();
        });
        
        provider.on('disconnect', () => {
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
    
    // In production, this would fetch user's domains from the blockchain
    // For now, showing demo data
    const domains = await fetchUserDomains(walletAddress);
    
    displayDomains(domains);
    updateStats(domains);
}

async function fetchUserDomains(walletAddress) {
    // In production, this would query the Solana program for user's domains
    // For now, showing demo data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo domains (in production, fetch from blockchain based on NFT ownership)
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
    const provider = getWalletProvider();
    
    if (!walletAddress || !provider) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const connection = myDomainsSolanaConnection;
    const demoMode = !connection;
    const networkInfo = demoMode ? 'demo mode' : getSolanaConfig().network;
    
    const confirmed = confirm(
        `Renew ${name}${tld} for 1 year?\n\n` +
        `Renewal Fee: ${RENEWAL_FEE} SOL\n` +
        `Wallet: ${formatWalletAddress(walletAddress)}\n` +
        `Network: ${networkInfo}`
    );
    
    if (!confirmed) return;
    
    try {
        // Simulate domain renewal transaction
        const result = await simulateDomainRenewal(
            connection,
            provider,
            name,
            tld
        );
        
        if (result.success) {
            const explorerLink = demoMode ? '' : getExplorerLink(result.signature);
            const explorerText = explorerLink ? `\n\nView on Solana Explorer:\n${explorerLink}` : '';
            alert(
                `✅ Domain renewed successfully!\n\n` +
                `Domain: ${result.domain}\n` +
                `Transaction: ${result.signature.slice(0, 8)}...${explorerText}\n\n` +
                `Note: This is a ${demoMode ? 'demo' : 'test'} transaction. Full contract integration coming soon.`
            );
            console.log('Renewal result:', result);
            
            // Reload domains
            await loadUserDomains();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Renewal failed:', error);
        alert(
            `❌ Renewal failed!\n\n` +
            `Error: ${error.message}\n\n` +
            `Please ensure you have enough SOL and try again.`
        );
    }
}

async function transferDomain(name, tld) {
    const provider = getWalletProvider();
    
    if (!walletAddress || !provider) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const connection = myDomainsSolanaConnection;
    
    const recipientAddress = prompt(
        `Transfer ${name}${tld} to:\n\n` +
        `Enter recipient's Solana wallet address:`
    );
    
    if (!recipientAddress) return;
    
    if (recipientAddress.length < 32) {
        alert('Invalid wallet address. Please enter a valid Solana address (32+ characters).');
        return;
    }
    
    const confirmed = confirm(
        `Transfer ${name}${tld}?\n\n` +
        `To: ${formatWalletAddress(recipientAddress)}\n` +
        `From: ${formatWalletAddress(walletAddress)}\n\n` +
        `This action cannot be undone!`
    );
    
    if (!confirmed) return;
    
    try {
        // Simulate domain transfer transaction
        const result = await simulateDomainTransfer(
            connection,
            provider,
            name,
            tld,
            recipientAddress
        );
        
        if (result.success) {
            const demoMode = !connection;
            const explorerLink = demoMode ? '' : getExplorerLink(result.signature);
            const explorerText = explorerLink ? `\n\nView on Solana Explorer:\n${explorerLink}` : '';
            alert(
                `✅ Domain transferred successfully!\n\n` +
                `Domain: ${result.domain}\n` +
                `Recipient: ${formatWalletAddress(result.recipient)}\n` +
                `Transaction: ${result.signature.slice(0, 8)}...${explorerText}\n\n` +
                `Note: This is a ${demoMode ? 'demo' : 'test'} transaction. Full contract integration coming soon.`
            );
            console.log('Transfer result:', result);
            
            // Reload domains
            await loadUserDomains();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Transfer failed:', error);
        alert(
            `❌ Transfer failed!\n\n` +
            `Error: ${error.message}`
        );
    }
}

async function listDomain(name, tld) {
    const provider = getWalletProvider();
    
    if (!walletAddress || !provider) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const connection = myDomainsSolanaConnection;
    const demoMode = !connection;
    
    const price = prompt(
        `List ${name}${tld} for sale\n\n` +
        `Enter price in SOL:\n` +
        `(Marketplace fee: ${MARKETPLACE_FEE * 100}%)`
    );
    
    if (!price) return;
    
    if (isNaN(price) || parseFloat(price) <= 0) {
        alert('Invalid price. Please enter a valid positive number.');
        return;
    }
    
    const priceNum = parseFloat(price);
    const fee = priceNum * MARKETPLACE_FEE;
    const youReceive = priceNum - fee;
    const networkInfo = demoMode ? 'demo mode' : getSolanaConfig().network;
    
    const confirmed = confirm(
        `List ${name}${tld} for ${priceNum} SOL?\n\n` +
        `List Price: ${priceNum} SOL\n` +
        `Marketplace Fee (${MARKETPLACE_FEE * 100}%): ${fee.toFixed(3)} SOL\n` +
        `You Receive: ${youReceive.toFixed(3)} SOL\n\n` +
        `Network: ${networkInfo}`
    );
    
    if (!confirmed) return;
    
    try {
        // In production, this would create a marketplace listing on-chain
        alert(
            `✅ Domain listed successfully!\n\n` +
            `Domain: ${name}${tld}\n` +
            `Price: ${priceNum} SOL\n\n` +
            `Note: This is a ${demoMode ? 'demo' : 'test'} listing. Full marketplace integration coming soon.`
        );
        console.log('Domain listed:', { name, tld, price: priceNum });
        
        // Reload domains
        await loadUserDomains();
    } catch (error) {
        console.error('Listing failed:', error);
        alert(
            `❌ Listing failed!\n\n` +
            `Error: ${error.message}`
        );
    }
}

async function unlistDomain(name, tld) {
    const provider = getWalletProvider();
    
    if (!walletAddress || !provider) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const confirmed = confirm(
        `Remove ${name}${tld} from marketplace?`
    );
    
    if (!confirmed) return;
    
    try {
        // In production, this would remove the marketplace listing on-chain
        alert(
            `✅ Domain unlisted successfully!\n\n` +
            `Domain: ${name}${tld}\n\n` +
            `Note: This is a test unlisting. Full marketplace integration coming soon.`
        );
        console.log('Domain unlisted:', { name, tld });
        
        // Reload domains
        await loadUserDomains();
    } catch (error) {
        console.error('Unlisting failed:', error);
        alert(
            `❌ Unlisting failed!\n\n` +
            `Error: ${error.message}`
        );
    }
}

// Utility Functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

