// Marketplace Page Logic
const MARKETPLACE_FEE_PERCENT = 5; // 5%

let allListings = [];
let filteredListings = [];
let marketplaceSolanaConnection = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Solana connection
    try {
        marketplaceSolanaConnection = await createSolanaConnection();
        if (marketplaceSolanaConnection) {
            console.log('Marketplace connected to Solana:', getSolanaConfig().network);
        } else {
            console.log('Marketplace running in demo mode');
        }
    } catch (error) {
        console.error('Failed to connect to Solana:', error);
    }
    
    await loadMarketplaceListings();
});

async function loadMarketplaceListings() {
    // In production, this would fetch from the Solana program
    allListings = await fetchMarketplaceListings();
    filteredListings = [...allListings];
    
    displayListings(filteredListings);
}

async function fetchMarketplaceListings() {
    // In production, this would query the Solana program for all listed domains
    // For now, showing demo data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo listings (in production, fetch from blockchain)
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
    const tldFilter = document.getElementById('filter-tld').value;
    const priceFilter = document.getElementById('filter-price').value;
    const sortFilter = document.getElementById('filter-sort').value;
    
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
    const container = document.getElementById('listings-container');
    const emptyState = document.getElementById('empty-marketplace');
    
    if (listings.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    listings.forEach(listing => {
        const card = createListingCard(listing);
        container.appendChild(card);
    });
}

function createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    
    const marketplaceFee = listing.price * (MARKETPLACE_FEE_PERCENT / 100);
    const sellerReceives = listing.price - marketplaceFee;
    
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
                <span class="listing-info-value">${marketplaceFee.toFixed(3)} SOL (${MARKETPLACE_FEE_PERCENT}%)</span>
            </div>
        </div>
        
        <div class="listing-actions">
            <button class="btn-primary" onclick='buyDomain(${JSON.stringify(listing)})'>
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
    const provider = getWalletProvider();
    
    if (!walletAddress || !provider) {
        alert('Please connect your wallet first!');
        return;
    }
    
    const connection = marketplaceSolanaConnection;
    const demoMode = !connection;
    
    // Check if buyer is the seller
    if (listing.seller === formatWalletAddress(walletAddress)) {
        alert('You cannot buy your own domain!');
        return;
    }
    
    const marketplaceFee = listing.price * (MARKETPLACE_FEE_PERCENT / 100);
    const sellerReceives = listing.price - marketplaceFee;
    const networkInfo = demoMode ? 'demo mode' : getSolanaConfig().network;
    
    const confirmed = confirm(
        `Buy ${listing.name}${listing.tld}?\n\n` +
        `Total Price: ${listing.price} SOL\n` +
        `Marketplace Fee (${MARKETPLACE_FEE_PERCENT}%): ${marketplaceFee.toFixed(3)} SOL\n` +
        `Seller Receives: ${sellerReceives.toFixed(3)} SOL\n\n` +
        `Your Wallet: ${formatWalletAddress(walletAddress)}\n` +
        `Seller: ${listing.seller}\n\n` +
        `Network: ${networkInfo}`
    );
    
    if (!confirmed) return;
    
    try {
        // Show loading indicator
        const buyButtons = document.querySelectorAll('.btn-primary');
        buyButtons.forEach(btn => {
            if (btn.textContent.includes('Buy')) {
                btn.disabled = true;
                btn.textContent = 'Processing...';
            }
        });
        
        // Simulate marketplace purchase transaction
        const result = await simulateMarketplacePurchase(
            connection,
            provider,
            listing
        );
        
        if (result.success) {
            const explorerLink = demoMode ? '' : getExplorerLink(result.signature);
            const explorerText = explorerLink ? `\n\nView on Solana Explorer:\n${explorerLink}` : '';
            alert(
                `✅ Domain purchased successfully!\n\n` +
                `Domain: ${result.domain}\n` +
                `Transaction: ${result.signature.slice(0, 8)}...${explorerText}\n\n` +
                `Note: This is a ${demoMode ? 'demo' : 'test'} transaction. Full marketplace integration coming soon.`
            );
            console.log('Purchase result:', result);
            
            // Reload marketplace listings
            await loadMarketplaceListings();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Purchase failed:', error);
        alert(
            `❌ Purchase failed!\n\n` +
            `Error: ${error.message}\n\n` +
            `Please ensure you have enough SOL and try again.`
        );
    } finally {
        // Restore button states
        const buyButtons = document.querySelectorAll('.btn-primary');
        buyButtons.forEach(btn => {
            if (btn.textContent.includes('Processing')) {
                btn.disabled = false;
                const priceMatch = btn.parentElement.parentElement.querySelector('.listing-price-value');
                if (priceMatch) {
                    const price = priceMatch.textContent.split(' ')[0];
                    btn.textContent = `Buy for ${price} SOL`;
                }
            }
        });
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

// Utility Functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

