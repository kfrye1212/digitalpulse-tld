// Marketplace Page Logic

let allListings = [];
let filteredListings = [];

document.addEventListener('DOMContentLoaded', () => {
    loadMarketplaceListings();
});

async function loadMarketplaceListings() {
    // TODO: Replace with actual smart contract call
    allListings = await fetchMarketplaceListings();
    filteredListings = [...allListings];
    
    displayListings(filteredListings);
}

async function fetchMarketplaceListings() {
    // TODO: Implement actual Solana program call
    // This is demo data for now
    
    // Simulate API delay
    await simulateDelay();
    
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
    const tldFilter = DOMCache.get('#filter-tld').value;
    const priceFilter = DOMCache.get('#filter-price').value;
    const sortFilter = DOMCache.get('#filter-sort').value;
    
    // Optimized: Single pass filter instead of multiple array iterations
    filteredListings = allListings.filter(listing => {
        // Filter by TLD
        if (tldFilter !== 'all' && listing.tld !== tldFilter) {
            return false;
        }
        
        // Filter by Price range
        if (priceFilter !== 'all') {
            const price = listing.price;
            if (priceFilter === '0-1' && (price < 0 || price > 1)) return false;
            if (priceFilter === '1-5' && (price <= 1 || price > 5)) return false;
            if (priceFilter === '5-10' && (price <= 5 || price > 10)) return false;
            if (priceFilter === '10+' && price <= 10) return false;
        }
        
        return true;
    });
    
    // Sort
    filteredListings.sort((a, b) => {
        switch (sortFilter) {
            case 'newest':
                return b.listedDate - a.listedDate;
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
    
    displayListings(filteredListings);
}

function displayListings(listings) {
    const container = DOMCache.get('#listings-container');
    const emptyState = DOMCache.get('#empty-marketplace');
    
    if (listings.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    listings.forEach(listing => {
        const card = createListingCard(listing);
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

function createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    
    // Use utility function for fee calculation
    const feeInfo = calculateMarketplaceFee(listing.price);
    
    card.innerHTML = `
        <div class="listing-header">
            <div class="listing-domain">
                ${listing.name}<span class="text-primary">${listing.tld}</span>
            </div>
            <div class="listing-price">
                <div class="listing-price-value">${listing.price} SOL</div>
                <div class="listing-price-label">List Price</div>
            </div>
        </div>
        
        <div class="listing-info">
            <div class="listing-info-item">
                <span class="listing-info-label">Seller</span>
                <span class="listing-info-value mono">${listing.seller}</span>
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
                <span class="listing-info-value">${feeInfo.fee} SOL (${feeInfo.feePercent}%)</span>
            </div>
        </div>
        
        <div class="listing-actions">
            <button class="btn-primary" onclick='buyDomain(${escapeForOnClick(listing)})'>
                Buy for ${listing.price} SOL
            </button>
            <button class="btn-secondary" onclick="viewDomainDetails('${listing.name}', '${listing.tld}')">
                View Details
            </button>
        </div>
    `;
    
    return card;
}

async function buyDomain(listing) {
    if (!walletAddress) {
        alert('Please connect your wallet first!');
        return;
    }
    
    // Check if buyer is the seller
    if (listing.seller === walletAddress) {
        alert('You cannot buy your own domain!');
        return;
    }
    
    // Use utility function for fee calculation
    const feeInfo = calculateMarketplaceFee(listing.price);
    
    const confirmed = confirm(
        `Buy ${listing.name}${listing.tld}?\n\n` +
        `Total Price: ${listing.price} SOL\n` +
        `Marketplace Fee (${feeInfo.feePercent}%): ${feeInfo.fee} SOL\n` +
        `Seller Receives: ${feeInfo.sellerReceives} SOL\n\n` +
        `From: ${formatWalletAddress(walletAddress)}\n` +
        `To: ${formatWalletAddress(listing.seller)}`
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
            `- Send ${feeInfo.sellerReceives} SOL to seller\n` +
            `- Send ${feeInfo.fee} SOL marketplace fee\n` +
            `- Transfer ${listing.name}${listing.tld} NFT to you`
        );
        
        // After successful purchase, reload marketplace
        // await loadMarketplaceListings();
    }
}

function viewDomainDetails(name, tld) {
    const listing = allListings.find(l => l.name === name && l.tld === tld);
    if (!listing) return;
    
    // Use utility function for fee calculation
    const feeInfo = calculateMarketplaceFee(listing.price);
    
    alert(
        `Domain Details: ${name}${tld}\n\n` +
        `Price: ${listing.price} SOL\n` +
        `Marketplace Fee: ${feeInfo.fee} SOL (${feeInfo.feePercent}%)\n` +
        `Seller Receives: ${feeInfo.sellerReceives} SOL\n\n` +
        `Seller: ${listing.seller}\n` +
        `Listed: ${formatDate(listing.listedDate)}\n` +
        `Expires: ${formatDate(listing.expiryDate)}\n` +
        `NFT Mint: ${listing.nftMint}`
    );
}

