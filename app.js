// TLD Options
const TLDS = ['.pulse', '.verse', '.cp', '.pv'];
let selectedTLD = 'all';
let walletAddress = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize features that exist on this page
    const tldSelector = document.querySelector('.tld-selector');
    const searchInput = document.getElementById('domain-search');
    
    if (tldSelector) {
        initializeTLDSelector();
    }
    
    if (searchInput) {
        initializeSearch();
    }
    
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
    if (!walletAddress) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const confirmed = confirm(
        `Register ${name}${tld}?\n\n` +
        `Price: ${price} SOL\n` +
        `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    );
    
    if (!confirmed) return;
    
    // Show loading state
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;
    
    try {
        // Get wallet public key
        const provider = window.solana;
        const publicKey = provider.publicKey;
        
        // Register domain using Solana utilities
        const result = await window.SolanaUtils.registerDomain(name, tld, publicKey);
        
        if (result.success) {
            alert(`✅ ${result.message}\n\nTransaction: ${result.signature}`);
            
            // Save domain locally for demo
            const domain = {
                name: name,
                tld: tld,
                registeredDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                isListed: false,
                listPrice: null,
                nftMint: result.signature.slice(0, 10) + '...'
            };
            window.SolanaUtils.saveDomainLocally(domain, walletAddress);
        } else {
            alert(`❌ Registration failed:\n${result.error}`);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert(`❌ Registration failed:\n${error.message}`);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
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

