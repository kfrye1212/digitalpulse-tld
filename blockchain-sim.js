// Blockchain Simulation Layer
// This simulates blockchain state using localStorage until real smart contract integration

const BlockchainSim = {
    // Initialize blockchain state
    init() {
        if (!localStorage.getItem('digitalpulse_domains')) {
            localStorage.setItem('digitalpulse_domains', JSON.stringify({}));
        }
        if (!localStorage.getItem('digitalpulse_marketplace')) {
            localStorage.setItem('digitalpulse_marketplace', JSON.stringify([]));
        }
        if (!localStorage.getItem('digitalpulse_user_domains')) {
            localStorage.setItem('digitalpulse_user_domains', JSON.stringify({}));
        }
    },

    // Check if domain is available
    isDomainAvailable(name, tld) {
        const domains = JSON.parse(localStorage.getItem('digitalpulse_domains') || '{}');
        const domainKey = `${name}${tld}`;
        return !domains[domainKey];
    },

    // Register a domain
    registerDomain(name, tld, owner, price = 0.25) {
        const domains = JSON.parse(localStorage.getItem('digitalpulse_domains') || '{}');
        const userDomains = JSON.parse(localStorage.getItem('digitalpulse_user_domains') || '{}');
        
        const domainKey = `${name}${tld}`;
        
        if (domains[domainKey]) {
            throw new Error('Domain already registered');
        }
        
        const domain = {
            name,
            tld,
            owner,
            registeredDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            price,
            nftMint: this.generateMint()
        };
        
        domains[domainKey] = domain;
        
        if (!userDomains[owner]) {
            userDomains[owner] = [];
        }
        userDomains[owner].push(domainKey);
        
        localStorage.setItem('digitalpulse_domains', JSON.stringify(domains));
        localStorage.setItem('digitalpulse_user_domains', JSON.stringify(userDomains));
        
        return domain;
    },

    // Get user's domains
    getUserDomains(walletAddress) {
        const userDomains = JSON.parse(localStorage.getItem('digitalpulse_user_domains') || '{}');
        const domains = JSON.parse(localStorage.getItem('digitalpulse_domains') || '{}');
        const marketplace = JSON.parse(localStorage.getItem('digitalpulse_marketplace') || '[]');
        
        const userDomainKeys = userDomains[walletAddress] || [];
        
        return userDomainKeys.map(key => {
            const domain = domains[key];
            if (!domain) return null;
            
            const listing = marketplace.find(l => 
                l.name === domain.name && l.tld === domain.tld
            );
            
            return {
                name: domain.name,
                tld: domain.tld,
                registeredDate: new Date(domain.registeredDate),
                expiryDate: new Date(domain.expiryDate),
                isListed: !!listing,
                listPrice: listing ? listing.price : null,
                nftMint: domain.nftMint
            };
        }).filter(d => d !== null);
    },

    // Renew a domain
    renewDomain(name, tld, owner) {
        const domains = JSON.parse(localStorage.getItem('digitalpulse_domains') || '{}');
        const domainKey = `${name}${tld}`;
        
        if (!domains[domainKey]) {
            throw new Error('Domain not found');
        }
        
        if (domains[domainKey].owner !== owner) {
            throw new Error('Not domain owner');
        }
        
        // Extend expiry by 1 year
        const currentExpiry = new Date(domains[domainKey].expiryDate);
        domains[domainKey].expiryDate = new Date(
            currentExpiry.getTime() + 365 * 24 * 60 * 60 * 1000
        ).toISOString();
        
        localStorage.setItem('digitalpulse_domains', JSON.stringify(domains));
        
        return domains[domainKey];
    },

    // Transfer domain
    transferDomain(name, tld, fromOwner, toOwner) {
        const domains = JSON.parse(localStorage.getItem('digitalpulse_domains') || '{}');
        const userDomains = JSON.parse(localStorage.getItem('digitalpulse_user_domains') || '{}');
        const domainKey = `${name}${tld}`;
        
        if (!domains[domainKey]) {
            throw new Error('Domain not found');
        }
        
        if (domains[domainKey].owner !== fromOwner) {
            throw new Error('Not domain owner');
        }
        
        // Update domain owner
        domains[domainKey].owner = toOwner;
        
        // Update user domains lists
        if (userDomains[fromOwner]) {
            userDomains[fromOwner] = userDomains[fromOwner].filter(k => k !== domainKey);
        }
        
        if (!userDomains[toOwner]) {
            userDomains[toOwner] = [];
        }
        userDomains[toOwner].push(domainKey);
        
        localStorage.setItem('digitalpulse_domains', JSON.stringify(domains));
        localStorage.setItem('digitalpulse_user_domains', JSON.stringify(userDomains));
        
        return domains[domainKey];
    },

    // List domain on marketplace
    listDomain(name, tld, owner, price) {
        const domains = JSON.parse(localStorage.getItem('digitalpulse_domains') || '{}');
        const marketplace = JSON.parse(localStorage.getItem('digitalpulse_marketplace') || '[]');
        const domainKey = `${name}${tld}`;
        
        if (!domains[domainKey]) {
            throw new Error('Domain not found');
        }
        
        if (domains[domainKey].owner !== owner) {
            throw new Error('Not domain owner');
        }
        
        // Check if already listed
        const existingListing = marketplace.find(l => l.name === name && l.tld === tld);
        if (existingListing) {
            throw new Error('Domain already listed');
        }
        
        const listing = {
            name,
            tld,
            price,
            seller: owner,
            listedDate: new Date().toISOString(),
            expiryDate: domains[domainKey].expiryDate,
            nftMint: domains[domainKey].nftMint
        };
        
        marketplace.push(listing);
        localStorage.setItem('digitalpulse_marketplace', JSON.stringify(marketplace));
        
        return listing;
    },

    // Unlist domain from marketplace
    unlistDomain(name, tld, owner) {
        const marketplace = JSON.parse(localStorage.getItem('digitalpulse_marketplace') || '[]');
        
        const listingIndex = marketplace.findIndex(l => 
            l.name === name && l.tld === tld && l.seller === owner
        );
        
        if (listingIndex === -1) {
            throw new Error('Listing not found');
        }
        
        marketplace.splice(listingIndex, 1);
        localStorage.setItem('digitalpulse_marketplace', JSON.stringify(marketplace));
    },

    // Buy domain from marketplace
    buyDomain(name, tld, buyer) {
        const domains = JSON.parse(localStorage.getItem('digitalpulse_domains') || '{}');
        const marketplace = JSON.parse(localStorage.getItem('digitalpulse_marketplace') || '[]');
        const domainKey = `${name}${tld}`;
        
        const listingIndex = marketplace.findIndex(l => l.name === name && l.tld === tld);
        
        if (listingIndex === -1) {
            throw new Error('Listing not found');
        }
        
        const listing = marketplace[listingIndex];
        
        if (listing.seller === buyer) {
            throw new Error('Cannot buy your own domain');
        }
        
        // Transfer domain
        this.transferDomain(name, tld, listing.seller, buyer);
        
        // Remove listing
        marketplace.splice(listingIndex, 1);
        localStorage.setItem('digitalpulse_marketplace', JSON.stringify(marketplace));
        
        return { domain: domains[domainKey], price: listing.price };
    },

    // Get all marketplace listings
    getMarketplaceListings() {
        const marketplace = JSON.parse(localStorage.getItem('digitalpulse_marketplace') || '[]');
        
        return marketplace.map(listing => ({
            name: listing.name,
            tld: listing.tld,
            price: listing.price,
            seller: listing.seller,
            listedDate: new Date(listing.listedDate),
            expiryDate: new Date(listing.expiryDate),
            nftMint: listing.nftMint
        }));
    },

    // Generate random mint address
    generateMint() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result + '...';
    },

    // Seed some initial demo data (only if empty)
    seedDemoData() {
        const domains = JSON.parse(localStorage.getItem('digitalpulse_domains') || '{}');
        
        // Only seed if completely empty
        if (Object.keys(domains).length > 0) {
            return;
        }
        
        const demoOwner = 'DEMO' + this.generateMint();
        
        // Register some demo domains
        const demoDomains = [
            { name: 'crypto', tld: '.verse', price: 5.0 },
            { name: 'web3', tld: '.pulse', price: 10.5 },
            { name: 'defi', tld: '.cp', price: 2.5 },
            { name: 'nft', tld: '.pv', price: 8.0 },
            { name: 'dao', tld: '.pulse', price: 0.8 }
        ];
        
        demoDomains.forEach(({ name, tld, price }) => {
            try {
                this.registerDomain(name, tld, demoOwner, 0.25);
                this.listDomain(name, tld, demoOwner, price);
            } catch (e) {
                // Ignore errors during seeding (e.g., domain already exists)
                console.log(`Skipping demo domain ${name}${tld}: ${e.message}`);
            }
        });
    },

    // Clear all data (for testing)
    clearAll() {
        localStorage.removeItem('digitalpulse_domains');
        localStorage.removeItem('digitalpulse_marketplace');
        localStorage.removeItem('digitalpulse_user_domains');
        this.init();
    }
};

// Initialize on load
BlockchainSim.init();
BlockchainSim.seedDemoData();
