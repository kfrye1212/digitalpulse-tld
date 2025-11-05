// TLD Options
const TLDS = ['.pulse', '.verse', '.cp', '.pv'];
let selectedTLD = 'all';

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTLDSelector();
    initializeSearch();
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
    
    if (!searchInput || !searchBtn) return;
    
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Add debounced input handler for live feedback (optional)
    const debouncedSearch = debounce(() => {
        const query = searchInput.value.trim();
        if (query.length > 2) {
            // Could show suggestions or validation here
        }
    }, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
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
    
    if (!resultsSection || !resultsContainer) return;
    
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    results.forEach(result => {
        const card = createResultCard(result);
        resultsContainer.appendChild(card);
    });
    
    // Set up event delegation for register buttons
    resultsContainer.addEventListener('click', handleResultAction);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleResultAction(e) {
    const registerBtn = e.target.closest('[data-action="register"]');
    if (registerBtn) {
        e.preventDefault();
        const { name, tld, price } = registerBtn.dataset;
        registerDomain(name, tld, parseFloat(price));
    }
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
                    ${escapeHtml(result.name)}<span class="text-primary">${escapeHtml(result.tld)}</span>
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
                `<button class="btn-primary" data-action="register" data-name="${escapeHtml(result.name)}" data-tld="${escapeHtml(result.tld)}" data-price="${result.price}">Register</button>` :
                `<button class="btn-secondary" disabled>Unavailable</button>`
            }
        </div>
    `;
    
    return card;
}

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Domain Registration
function registerDomain(name, tld, price) {
    if (!walletManager.isConnected()) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const walletAddress = walletManager.getAddress();
    
    // TODO: Implement actual Solana transaction
    const confirmed = confirm(
        `Register ${name}${tld}?\n\n` +
        `Price: ${price} SOL\n` +
        `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}\n\n` +
        `Smart contract integration coming soon!`
    );
    
    if (confirmed) {
        alert('Registration initiated! Smart contract integration in progress.');
    }
}

