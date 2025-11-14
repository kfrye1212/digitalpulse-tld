// TLD Options
const TLDS = ['.pulse', '.verse', '.cp', '.pv'];
let selectedTLD = 'all';
let walletAddress = null;
let walletProvider = null;
let solanaConnection = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeTLDSelector();
    initializeSearch();
    await initializeWallet();
    
    // Initialize Solana connection
    try {
        solanaConnection = await createSolanaConnection();
        if (solanaConnection) {
            console.log('Connected to Solana:', getSolanaConfig().network);
        } else {
            console.log('Running in demo mode without Solana connection');
        }
    } catch (error) {
        console.error('Failed to connect to Solana:', error);
        console.log('Continuing in demo mode');
    }
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
    
    // Check if search elements exist on this page
    if (!searchInput || !searchBtn) {
        return;
    }
    
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
    
    const searchBtn = document.getElementById('search-btn');
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate results
    const tldsToSearch = selectedTLD === 'all' ? TLDS : [selectedTLD];
    const results = tldsToSearch.map(tld => ({
        name: query,
        tld: tld,
        available: Math.random() > 0.3, // Random availability for demo
        price: 0.25
    }));
    
    displayResults(results);
    
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
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
                    ${result.name}<span class="text-primary">${result.tld}</span>
                </div>
                <div class="result-status">${statusText}</div>
            </div>
        </div>
        <div class="result-actions">
            <div class="result-price">
                <div class="price-value">${result.price} SOL</div>
                <div class="price-label">Registration fee</div>
            </div>
            ${result.available ? 
                `<button class="btn-primary" onclick="registerDomain('${result.name}', '${result.tld}', ${result.price})">Register</button>` :
                `<button class="btn-secondary" disabled>Unavailable</button>`
            }
        </div>
    `;
    
    return card;
}

// Domain Registration
async function registerDomain(name, tld, price) {
    if (!walletAddress || !walletProvider) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const demoMode = !solanaConnection;
    const networkInfo = demoMode ? 'demo mode' : getSolanaConfig().network;
    
    const confirmed = confirm(
        `Register ${name}${tld}?\n\n` +
        `Price: ${price} SOL\n` +
        `Wallet: ${formatWalletAddress(walletAddress)}\n` +
        `Network: ${networkInfo}\n\n` +
        `${demoMode ? 'Note: Running in demo mode.\n' : ''}This will simulate a transaction.`
    );
    
    if (!confirmed) return;
    
    // Show loading state
    const searchBtn = document.getElementById('search-btn');
    const originalText = searchBtn.textContent;
    searchBtn.disabled = true;
    searchBtn.textContent = 'Processing...';
    
    try {
        // Simulate domain registration transaction
        const result = await simulateDomainRegistration(
            solanaConnection,
            walletProvider,
            name,
            tld
        );
        
        if (result.success) {
            const explorerLink = demoMode ? '' : getExplorerLink(result.signature);
            const explorerText = explorerLink ? `\n\nView on Solana Explorer:\n${explorerLink}` : '';
            alert(
                `✅ Domain registered successfully!\n\n` +
                `Domain: ${result.domain}\n` +
                `Transaction: ${result.signature.slice(0, 8)}...${explorerText}\n\n` +
                `Note: This is a ${demoMode ? 'demo' : 'test'} transaction. Full contract integration coming soon.`
            );
            console.log('Registration result:', result);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        alert(
            `❌ Registration failed!\n\n` +
            `Error: ${error.message}\n\n` +
            `Please ensure you have the necessary setup and try again.`
        );
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = originalText;
    }
}

// Wallet Integration
async function initializeWallet() {
    const walletButtonContainer = document.getElementById('wallet-button-container');
    
    // Get wallet provider
    walletProvider = getWalletProvider();
    
    if (!walletProvider) {
        walletButtonContainer.innerHTML = `
            <a href="https://phantom.app/" target="_blank" class="btn-secondary">
                Install Wallet
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
    
    // Check if already connected (only if trusted)
    try {
        const response = await walletProvider.connect({ onlyIfTrusted: true });
        walletAddress = response.publicKey.toString();
        updateWalletButton(walletBtn);
        console.log('Auto-connected to wallet:', formatWalletAddress(walletAddress));
    } catch (err) {
        // Not connected yet or not trusted
        console.log('Wallet not auto-connected');
    }
}

async function connectWallet() {
    if (!walletProvider) {
        alert('No wallet provider found. Please install Phantom or another Solana wallet.');
        return;
    }
    
    try {
        const response = await walletProvider.connect();
        walletAddress = response.publicKey.toString();
        
        const walletBtn = document.querySelector('#wallet-button-container button');
        updateWalletButton(walletBtn);
        
        console.log('Connected to wallet:', formatWalletAddress(walletAddress));
        
        // Check balance if we have a connection
        if (solanaConnection && typeof solanaWeb3 !== 'undefined') {
            try {
                const balance = await solanaConnection.getBalance(response.publicKey);
                const balanceInSOL = balance / solanaWeb3.LAMPORTS_PER_SOL;
                console.log('Wallet balance:', balanceInSOL.toFixed(4), 'SOL');
                
                if (balanceInSOL < 0.01) {
                    alert(
                        `⚠️ Low Balance\n\n` +
                        `Your wallet has ${balanceInSOL.toFixed(4)} SOL.\n` +
                        `You may need more SOL for transactions.`
                    );
                }
            } catch (balanceError) {
                console.log('Could not fetch balance:', balanceError);
            }
        }
    } catch (err) {
        console.error('Failed to connect wallet:', err);
        if (err.code === 4001) {
            alert('Connection cancelled. Please try again to connect your wallet.');
        } else {
            alert(`Failed to connect wallet: ${err.message}`);
        }
    }
}

function updateWalletButton(btn) {
    if (walletAddress) {
        btn.textContent = formatWalletAddress(walletAddress);
        btn.onclick = disconnectWallet;
        btn.title = walletAddress;
    }
}

async function disconnectWallet() {
    if (!walletProvider) return;
    
    try {
        await walletProvider.disconnect();
        walletAddress = null;
        
        const walletBtn = document.querySelector('#wallet-button-container button');
        walletBtn.textContent = 'Connect Wallet';
        walletBtn.onclick = connectWallet;
        walletBtn.title = '';
        
        console.log('Disconnected wallet');
    } catch (err) {
        console.error('Failed to disconnect wallet:', err);
    }
}

// Listen for wallet changes
window.addEventListener('load', () => {
    const provider = getWalletProvider();
    if (provider) {
        provider.on('connect', (publicKey) => {
            walletAddress = publicKey.toString();
            console.log('Wallet connected:', formatWalletAddress(walletAddress));
        });
        
        provider.on('disconnect', () => {
            walletAddress = null;
            console.log('Wallet disconnected');
            
            // Update button if it exists
            const walletBtn = document.querySelector('#wallet-button-container button');
            if (walletBtn) {
                walletBtn.textContent = 'Connect Wallet';
                walletBtn.onclick = connectWallet;
                walletBtn.title = '';
            }
        });
        
        provider.on('accountChanged', (publicKey) => {
            if (publicKey) {
                walletAddress = publicKey.toString();
                console.log('Wallet account changed:', formatWalletAddress(walletAddress));
                
                // Update button
                const walletBtn = document.querySelector('#wallet-button-container button');
                if (walletBtn) {
                    updateWalletButton(walletBtn);
                }
            } else {
                walletAddress = null;
            }
        });
    }
});

