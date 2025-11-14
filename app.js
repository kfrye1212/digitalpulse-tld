// TLD Options
const TLDS = ['.pulse', '.verse', '.cp', '.pv'];
let selectedTLD = 'all';
let walletAddress = null;

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
    
    const searchBtn = document.getElementById('search-btn');
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    
    // Check availability on blockchain
    const tldsToSearch = selectedTLD === 'all' ? TLDS : [selectedTLD];
    const results = await Promise.all(
        tldsToSearch.map(async tld => {
            const available = await solanaContract.checkDomainAvailability(query, tld);
            return {
                name: query,
                tld: tld,
                available: available,
                price: 0.25
            };
        })
    );
    
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
    if (!walletAddress) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const confirmed = confirm(
        `Register ${name}${tld}?\n\n` +
        `Price: ${price} SOL\n` +
        `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}\n\n` +
        `This will create a transaction on Solana blockchain.`
    );
    
    if (confirmed) {
        try {
            // Show processing state
            const resultsContainer = document.getElementById('results-container');
            const processingMsg = document.createElement('div');
            processingMsg.className = 'card-glass';
            processingMsg.style.cssText = 'text-align: center; padding: 32px; margin-top: 20px;';
            processingMsg.innerHTML = `
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 12px;">
                    🔄 Processing registration for ${name}${tld}...
                </p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                    Please approve the transaction in your wallet
                </p>
            `;
            resultsContainer.appendChild(processingMsg);

            // Execute blockchain transaction
            const result = await solanaContract.registerDomain(name, tld, price);
            
            if (result.success) {
                processingMsg.innerHTML = `
                    <p style="color: #00ff88; margin-bottom: 12px; font-size: 18px;">
                        ✅ Domain Registered Successfully!
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 8px;">
                        ${name}${tld}
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-bottom: 12px;">
                        Transaction: ${result.signature.slice(0, 8)}...${result.signature.slice(-8)}
                    </p>
                    <a href="my-domains.html" class="btn-primary" style="display: inline-block; margin-top: 12px;">
                        View My Domains
                    </a>
                `;
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert(
                'Registration failed!\n\n' +
                'Error: ' + (error.message || 'Unknown error') + '\n\n' +
                'Please make sure you have enough SOL in your wallet and try again.'
            );
        }
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
        const response = await window.solana.connect();
        walletAddress = response.publicKey.toString();
        
        const walletBtn = document.querySelector('#wallet-button-container button');
        updateWalletButton(walletBtn);
        
        console.log('Connected to wallet:', walletAddress);
    } catch (err) {
        console.error('Failed to connect wallet:', err);
        alert('Failed to connect wallet. Please try again.');
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

