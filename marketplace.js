// Marketplace Page Logic
const MARKETPLACE_FEE_PERCENT = 5; // 5%

let allListings = [];
let filteredListings = [];

// Cache DOM elements
const domCache = {
    container: null,
    emptyState: null,
    filterTld: null,
    filterPrice: null,
    filterSort: null
};

// Store listings by ID for safer data access
const listingsById = new Map();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM cache
    domCache.container = document.getElementById('listings-container');
    domCache.emptyState = document.getElementById('empty-marketplace');
    domCache.filterTld = document.getElementById('filter-tld');
    domCache.filterPrice = document.getElementById('filter-price');
    domCache.filterSort = document.getElementById('filter-sort');
    
    loadMarketplaceListings();
    
    // Set up event delegation for marketplace actions
    if (domCache.container) {
        domCache.container.addEventListener('click', handleMarketplaceAction);
    }
});

async function loadMarketplaceListings() {
    // TODO: Replace with actual smart contract call
    allListings = await fetchMarketplaceListings();
    filteredListings = [...allListings];
    
    // Populate listingsById map
    listingsById.clear();
    allListings.forEach((listing, index) => {
        const id = `listing-${index}-${listing.name}-${listing.tld}`;
        listingsById.set(id, listing);
    });
    
    displayListings(filteredListings);
}

async function fetchMarketplaceListings() {
    // TODO: Implement actual Solana program call
    // This is demo data for now
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo listings (replace with actual blockchain query)
    const demoListings = [
        {
            name: 'crypto',
            tld: '.verse',
            price: 5.0,
            seller: 'ABC123...XYZ789',
            listedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
            nftMint: 'DEF456...'
        },
        {
            name: 'web3',
            tld: '.pulse',
            price: 10.5,
            seller: 'GHI789...MNO012',
            listedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
            nftMint: 'GHI789...'
        },
        {
            name: 'defi',
            tld: '.cp',
            price: 2.5,
            seller: 'JKL012...PQR345',
            listedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000),
            nftMint: 'JKL012...'
        },
        {
            name: 'nft',
            tld: '.pv',
            price: 8.0,
            seller: 'STU345...VWX678',
            listedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
            nftMint: 'STU345...'
        },
        {
            name: 'dao',
            tld: '.pulse',
            price: 0.8,
            seller: 'YZA678...BCD901',
            listedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 340 * 24 * 60 * 60 * 1000),
            nftMint: 'YZA678...'
        }
    ];
    
    return demoListings;
}

function applyFilters() {
    if (!domCache.filterTld || !domCache.filterPrice || !domCache.filterSort) return;
    
    const tldFilter = domCache.filterTld.value;
    const priceFilter = domCache.filterPrice.value;
    const sortFilter = domCache.filterSort.value;
    
    // Filter by TLD
    filteredListings = allListings.filter(listing => {
        if (tldFilter === 'all') return true;
        return listing.tld === tldFilter;
    });
    
    // Filter by Price
    filteredListings = filteredListings.filter(listing => {
        if (priceFilter === 'all') return true;
        
        const price = listing.price;
        if (priceFilter === '0-1') return price >= 0 && price <= 1;
        if (priceFilter === '1-5') return price > 1 && price <= 5;
        if (priceFilter === '5-10') return price > 5 && price <= 10;
        if (priceFilter === '10+') return price > 10;
        
        return true;
    });
    
    // Sort
    filteredListings.sort((a, b) => {
        if (sortFilter === 'newest') {
            return b.listedDate - a.listedDate;
        }
        if (sortFilter === 'price-low') {
            return a.price - b.price;
        }
        if (sortFilter === 'price-high') {
            return b.price - a.price;
        }
        if (sortFilter === 'name') {
            return a.name.localeCompare(b.name);
        }
        return 0;
    });
    
    displayListings(filteredListings);
}

function displayListings(listings) {
    if (!domCache.container || !domCache.emptyState) return;
    
    if (listings.length === 0) {
        domCache.container.innerHTML = '';
        domCache.emptyState.style.display = 'block';
        return;
    }
    
    domCache.emptyState.style.display = 'none';
    
    // Clear and rebuild listingsById for current filtered set
    listingsById.clear();
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    listings.forEach((listing, index) => {
        const id = `listing-${index}-${listing.name}-${listing.tld}`;
        listingsById.set(id, listing);
        const card = createListingCard(listing, id);
        fragment.appendChild(card);
    });
    
    domCache.container.innerHTML = '';
    domCache.container.appendChild(fragment);
}

function createListingCard(listing, listingId) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    
    const marketplaceFee = listing.price * (MARKETPLACE_FEE_PERCENT / 100);
    const sellerReceives = listing.price - marketplaceFee;
    
    card.innerHTML = `
        <div class="listing-header">
            <div class="listing-domain">
                ${escapeHtml(listing.name)}<span class="text-primary">${escapeHtml(listing.tld)}</span>
            </div>
            <div class="listing-price">
                <div class="listing-price-value">${listing.price} SOL</div>
                <div class="listing-price-label">List Price</div>
            </div>
        </div>
        
        <div class="listing-info">
            <div class="listing-info-item">
                <span class="listing-info-label">Seller</span>
                <span class="listing-info-value mono">${escapeHtml(listing.seller)}</span>
            </div>
            <div class="listing-info-item">
                <span class="listing-info-label">Listed</span>
                <span class="listing-info-value">${formatDate(listing.listedDate)}</span>
            </div>
            <div class="listing-info-item">
                <span class="listing-info-label">Expires</span>
                <span class="listing-info-value">${formatDate(listing.expiryDate)}</span>
            </div>
            <div class="listing-info-item">
                <span class="listing-info-label">Marketplace Fee</span>
                <span class="listing-info-value">${marketplaceFee.toFixed(3)} SOL (${MARKETPLACE_FEE_PERCENT}%)</span>
            </div>
        </div>
        
        <div class="listing-actions">
            <button class="btn-primary" data-action="buy" data-listing-id="${escapeHtml(listingId)}">
                Buy for ${listing.price} SOL
            </button>
            <button class="btn-secondary" data-action="view" data-name="${escapeHtml(listing.name)}" data-tld="${escapeHtml(listing.tld)}">
                View Details
            </button>
        </div>
    `;
    
    return card;
}

// Event delegation handler for marketplace actions
function handleMarketplaceAction(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    
    if (action === 'buy') {
        const listingId = target.dataset.listingId;
        const listing = listingsById.get(listingId);
        if (listing) {
            buyDomain(listing);
        } else {
            console.error('Listing not found:', listingId);
        }
    } else if (action === 'view') {
        const { name, tld } = target.dataset;
        viewDomainDetails(name, tld);
    }
}

async function buyDomain(listing) {
    if (!walletManager.isConnected()) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const walletAddress = walletManager.getAddress();
    
    // Check if buyer is the seller
    if (listing.seller === walletAddress) {
        alert('You cannot buy your own domain!');
        return;
    }
    
    const marketplaceFee = listing.price * (MARKETPLACE_FEE_PERCENT / 100);
    const sellerReceives = listing.price - marketplaceFee;
    
    const confirmed = confirm(
        `Buy ${listing.name}${listing.tld}?\n\n` +
        `Total Price: ${listing.price} SOL\n` +
        `Marketplace Fee (${MARKETPLACE_FEE_PERCENT}%): ${marketplaceFee.toFixed(3)} SOL\n` +
        `Seller Receives: ${sellerReceives.toFixed(3)} SOL\n\n` +
        `From: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}\n` +
        `To: ${listing.seller.slice(0, 4)}...${listing.seller.slice(-4)}`
    );
    
    if (confirmed) {
        // TODO: Implement actual Solana marketplace purchase transaction
        // This should:
        // 1. Transfer SOL from buyer to seller (minus marketplace fee)
        // 2. Transfer marketplace fee to platform wallet
        // 3. Transfer NFT ownership from seller to buyer
        // 4. Remove listing from marketplace
        
        alert(
            'Purchase transaction initiated!\n\n' +
            'Smart contract integration in progress.\n\n' +
            'Transaction will:\n' +
            `- Transfer ${listing.price} SOL from your wallet\n` +
            `- Send ${sellerReceives.toFixed(3)} SOL to seller\n` +
            `- Send ${marketplaceFee.toFixed(3)} SOL marketplace fee\n` +
            `- Transfer ${listing.name}${listing.tld} NFT to you`
        );
        
        // After successful purchase, reload marketplace
        // await loadMarketplaceListings();
    }
}

function viewDomainDetails(name, tld) {
    const listing = allListings.find(l => l.name === name && l.tld === tld);
    if (!listing) return;
    
    const marketplaceFee = listing.price * (MARKETPLACE_FEE_PERCENT / 100);
    const sellerReceives = listing.price - marketplaceFee;
    
    alert(
        `Domain Details: ${name}${tld}\n\n` +
        `Price: ${listing.price} SOL\n` +
        `Marketplace Fee: ${marketplaceFee.toFixed(3)} SOL (${MARKETPLACE_FEE_PERCENT}%)\n` +
        `Seller Receives: ${sellerReceives.toFixed(3)} SOL\n\n` +
        `Seller: ${listing.seller}\n` +
        `Listed: ${formatDate(listing.listedDate)}\n` +
        `Expires: ${formatDate(listing.expiryDate)}\n` +
        `NFT Mint: ${listing.nftMint}`
    );
}

