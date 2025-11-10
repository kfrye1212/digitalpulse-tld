// TLD Options
let selectedTLD = 'all';
let walletAddress = null; // Wallet state managed here and shared across pages

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTLDSelector();
    initializeSearch();
    initializeWallet();
});

// TLD Selector
function initializeTLDSelector() {
    const tldButtons = DOMCache.getAll('.tld-btn');
    
    // Only initialize if elements exist (they may not exist on all pages)
    if (!tldButtons || tldButtons.length === 0) return;
    
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
    const searchInput = DOMCache.get('#domain-search');
    const searchBtn = DOMCache.get('#search-btn');
    
    // Only initialize if elements exist (they may not exist on all pages)
    if (!searchInput || !searchBtn) return;
    
    searchBtn.addEventListener('click', performSearch);
    
    // Add debounced search on input for better UX
    const debouncedSearch = debounce(() => {
        if (searchInput.value.trim()) {
            performSearch();
        }
    }, CONSTANTS.SEARCH_DEBOUNCE_MS);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Optional: search as user types (commented out by default)
    // searchInput.addEventListener('input', debouncedSearch);
}

async function performSearch() {
    const searchInput = DOMCache.get('#domain-search');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) return;
    
    const searchBtn = DOMCache.get('#search-btn');
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    
    // Simulate search delay
    await simulateDelay();
    
    // Generate results
    const tldsToSearch = selectedTLD === 'all' ? CONSTANTS.TLDS : [selectedTLD];
    const results = tldsToSearch.map(tld => ({
        name: query,
        tld: tld,
        available: Math.random() > 0.3, // Random availability for demo
        price: CONSTANTS.REGISTRATION_FEE
    }));
    
    displayResults(results);
    
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
}

function displayResults(results) {
    const resultsSection = DOMCache.get('#search-results');
    const resultsContainer = DOMCache.get('#results-container');
    
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    results.forEach(result => {
        const card = createResultCard(result);
        fragment.appendChild(card);
    });
    resultsContainer.appendChild(fragment);
    
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
function registerDomain(name, tld, price) {
    if (!walletAddress) {
        alert('Please connect your wallet first!');
        return;
    }
    
    // TODO: Implement actual Solana transaction
    const confirmed = confirm(
        `Register ${name}${tld}?\n\n` +
        `Price: ${price} SOL\n` +
        `Wallet: ${formatWalletAddress(walletAddress)}\n\n` +
        `Smart contract integration coming soon!`
    );
    
    if (confirmed) {
        alert('Registration initiated! Smart contract integration in progress.');
    }
}

// Wallet Integration
async function initializeWallet() {
    const walletButtonContainer = DOMCache.get('#wallet-button-container');
    
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
        
        const walletBtn = DOMCache.get('#wallet-button-container button');
        updateWalletButton(walletBtn);
        
        console.log('Connected to wallet:', walletAddress);
    } catch (err) {
        console.error('Failed to connect wallet:', err);
        alert('Failed to connect wallet. Please try again.');
    }
}

function updateWalletButton(btn) {
    if (walletAddress) {
        btn.textContent = formatWalletAddress(walletAddress);
        btn.onclick = disconnectWallet;
    }
}

async function disconnectWallet() {
    try {
        await window.solana.disconnect();
        walletAddress = null;
        
        const walletBtn = DOMCache.get('#wallet-button-container button');
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

