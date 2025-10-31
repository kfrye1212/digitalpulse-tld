// Marketplace Page JavaScript

// Demo listings (replace with actual blockchain query when contract is deployed)
const demoListings = [
    {
        domain: 'crypto.pulse',
        price: 2.5,
        seller: 'ABC...XYZ',
        listed: '2025-03-01'
    },
    {
        domain: 'nft.verse',
        price: 1.8,
        seller: 'DEF...123',
        listed: '2025-03-05'
    },
    {
        domain: 'web3.cp',
        price: 3.2,
        seller: 'GHI...456',
        listed: '2025-03-10'
    },
    {
        domain: 'meta.pv',
        price: 4.5,
        seller: 'JKL...789',
        listed: '2025-03-12'
    },
    {
        domain: 'defi.pulse',
        price: 1.2,
        seller: 'MNO...ABC',
        listed: '2025-03-15'
    },
    {
        domain: 'gaming.verse',
        price: 2.0,
        seller: 'PQR...DEF',
        listed: '2025-03-18'
    }
];

let selectedListing = null;

// Load listings on page load
window.addEventListener('load', () => {
    loadListings();
});

function loadListings() {
    const grid = document.getElementById('listingsGrid');
    const emptyState = document.getElementById('emptyState');
    
    // In production, fetch listings from blockchain
    const listings = demoListings;
    
    if (listings.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    grid.innerHTML = '';
    
    listings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'domain-card cursor-pointer';
        card.onclick = () => openPurchaseModal(listing);
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-2xl font-bold text-cyan-400 mb-2">${listing.domain}</h3>
                    <p class="text-gray-400 text-sm">Listed ${formatDate(listing.listed)}</p>
                </div>
                <div class="text-4xl">🌐</div>
            </div>
            
            <div class="border-t border-gray-700 pt-4 mt-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm mb-1">Price</p>
                        <p class="text-2xl font-bold text-gradient">${listing.price} SOL</p>
                    </div>
                    <button class="btn btn-primary px-6 py-2">
                        Buy Now
                    </button>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-700">
                    <p class="text-gray-400 text-sm">Seller</p>
                    <p class="text-white font-mono text-sm">${listing.seller}</p>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function openPurchaseModal(listing) {
    selectedListing = listing;
    
    const royalty = listing.price * 0.05;
    const total = listing.price + royalty;
    
    document.getElementById('purchaseDomain').textContent = listing.domain;
    document.getElementById('purchasePrice').textContent = `${listing.price} SOL`;
    document.getElementById('purchaseRoyalty').textContent = `${royalty.toFixed(3)} SOL`;
    document.getElementById('purchaseTotal').textContent = `${total.toFixed(3)} SOL`;
    
    document.getElementById('purchaseModal').classList.remove('hidden');
}

function closePurchaseModal() {
    document.getElementById('purchaseModal').classList.add('hidden');
    selectedListing = null;
}

function completePurchase() {
    if (!selectedListing) return;
    
    if (!walletConnected) {
        showNotification('Please connect your wallet first', 'error');
        closePurchaseModal();
        document.getElementById('connectWallet').click();
        return;
    }
    
    const royalty = selectedListing.price * 0.05;
    const total = selectedListing.price + royalty;
    
    if (confirm(`Purchase ${selectedListing.domain} for ${total.toFixed(3)} SOL?`)) {
        showNotification(`${selectedListing.domain} purchased successfully! 🎉`, 'success');
        closePurchaseModal();
        
        // In production, execute Solana transaction here
        
        // Redirect to My Domains after 2 seconds
        setTimeout(() => {
            window.location.href = 'my-domains.html';
        }, 2000);
    }
}

// Close modal when clicking outside
document.getElementById('purchaseModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'purchaseModal') {
        closePurchaseModal();
    }
});

