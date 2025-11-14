// Solana Web3 Utilities for Digital Pulse TLD
// This module provides functions to interact with Solana blockchain

// Configuration
const SOLANA_NETWORK = 'devnet'; // Use 'mainnet-beta' for production
const PROGRAM_ID = 'DPuLSETLDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with actual program ID
const REGISTRATION_FEE = 0.25; // SOL
const RENEWAL_FEE = 0.15; // SOL
const MARKETPLACE_FEE_PERCENT = 5;

// Get Solana connection
function getSolanaConnection() {
    const { Connection, clusterApiUrl } = window.solanaWeb3;
    const network = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
    return new Connection(clusterApiUrl(network), 'confirmed');
}

// Get wallet provider
function getWalletProvider() {
    if ('solana' in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
            return provider;
        }
    }
    return null;
}

// Connect wallet
async function connectWallet() {
    try {
        const provider = getWalletProvider();
        if (!provider) {
            throw new Error('Phantom wallet not found. Please install it from https://phantom.app/');
        }
        
        const response = await provider.connect();
        const walletAddress = response.publicKey.toString();
        
        console.log('Wallet connected:', walletAddress);
        return {
            success: true,
            walletAddress: walletAddress,
            publicKey: response.publicKey
        };
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Disconnect wallet
async function disconnectWallet() {
    try {
        const provider = getWalletProvider();
        if (provider) {
            await provider.disconnect();
        }
        return { success: true };
    } catch (error) {
        console.error('Failed to disconnect wallet:', error);
        return { success: false, error: error.message };
    }
}

// Check wallet balance
async function getWalletBalance(publicKeyString) {
    try {
        const connection = getSolanaConnection();
        const { PublicKey } = window.solanaWeb3;
        const publicKey = new PublicKey(publicKeyString);
        
        const balance = await connection.getBalance(publicKey);
        const balanceInSOL = balance / 1e9; // Convert lamports to SOL
        
        return {
            success: true,
            balance: balanceInSOL
        };
    } catch (error) {
        console.error('Failed to get balance:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Register domain (simplified version - in production, this would call a smart contract)
async function registerDomain(domainName, tld, walletPublicKey) {
    try {
        const provider = getWalletProvider();
        if (!provider || !provider.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        const connection = getSolanaConnection();
        const { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = window.solanaWeb3;
        
        // For demo purposes, we'll create a simple SOL transfer transaction
        // In production, this should invoke a Solana program instruction
        
        // Create a program-derived address (PDA) for the domain
        // This is a simplified version - actual implementation would use seeds
        const domainAccount = new PublicKey(PROGRAM_ID);
        
        // Create transaction to register domain
        const transaction = new Transaction();
        
        // Add instruction to transfer registration fee
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: domainAccount,
                lamports: REGISTRATION_FEE * LAMPORTS_PER_SOL
            })
        );
        
        // Get recent blockhash
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = walletPublicKey;
        
        // Sign and send transaction
        const signed = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        
        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');
        
        console.log('Domain registered successfully:', signature);
        
        return {
            success: true,
            signature: signature,
            domain: `${domainName}${tld}`,
            message: 'Domain registered successfully!'
        };
    } catch (error) {
        console.error('Failed to register domain:', error);
        return {
            success: false,
            error: error.message || 'Failed to register domain'
        };
    }
}

// Renew domain
async function renewDomain(domainName, tld, walletPublicKey) {
    try {
        const provider = getWalletProvider();
        if (!provider || !provider.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        const connection = getSolanaConnection();
        const { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = window.solanaWeb3;
        
        const domainAccount = new PublicKey(PROGRAM_ID);
        const transaction = new Transaction();
        
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: domainAccount,
                lamports: RENEWAL_FEE * LAMPORTS_PER_SOL
            })
        );
        
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = walletPublicKey;
        
        const signed = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
        
        return {
            success: true,
            signature: signature,
            domain: `${domainName}${tld}`,
            message: 'Domain renewed successfully!'
        };
    } catch (error) {
        console.error('Failed to renew domain:', error);
        return {
            success: false,
            error: error.message || 'Failed to renew domain'
        };
    }
}

// Transfer domain
async function transferDomain(domainName, tld, recipientAddress, walletPublicKey) {
    try {
        const provider = getWalletProvider();
        if (!provider || !provider.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        const connection = getSolanaConnection();
        const { Transaction, SystemProgram, PublicKey } = window.solanaWeb3;
        
        // Validate recipient address
        let recipientPublicKey;
        try {
            recipientPublicKey = new PublicKey(recipientAddress);
        } catch {
            throw new Error('Invalid recipient address');
        }
        
        // In production, this would transfer the NFT to the recipient
        // For now, we'll create a minimal transaction
        const transaction = new Transaction();
        
        // Add a small transfer to validate the transaction
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: recipientPublicKey,
                lamports: 1000 // Minimal amount for transaction validation
            })
        );
        
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = walletPublicKey;
        
        const signed = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
        
        return {
            success: true,
            signature: signature,
            domain: `${domainName}${tld}`,
            recipient: recipientAddress,
            message: 'Domain transferred successfully!'
        };
    } catch (error) {
        console.error('Failed to transfer domain:', error);
        return {
            success: false,
            error: error.message || 'Failed to transfer domain'
        };
    }
}

// List domain for sale
async function listDomainForSale(domainName, tld, price, walletPublicKey) {
    try {
        const provider = getWalletProvider();
        if (!provider || !provider.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        // In production, this would create a marketplace listing in the smart contract
        // For now, we'll store it locally and simulate the transaction
        
        console.log(`Listing ${domainName}${tld} for ${price} SOL`);
        
        return {
            success: true,
            domain: `${domainName}${tld}`,
            price: price,
            message: 'Domain listed successfully!'
        };
    } catch (error) {
        console.error('Failed to list domain:', error);
        return {
            success: false,
            error: error.message || 'Failed to list domain'
        };
    }
}

// Unlist domain from sale
async function unlistDomain(domainName, tld, walletPublicKey) {
    try {
        const provider = getWalletProvider();
        if (!provider || !provider.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        // In production, this would remove the marketplace listing
        console.log(`Unlisting ${domainName}${tld}`);
        
        return {
            success: true,
            domain: `${domainName}${tld}`,
            message: 'Domain unlisted successfully!'
        };
    } catch (error) {
        console.error('Failed to unlist domain:', error);
        return {
            success: false,
            error: error.message || 'Failed to unlist domain'
        };
    }
}

// Buy domain from marketplace
async function buyDomainFromMarketplace(listing, walletPublicKey) {
    try {
        const provider = getWalletProvider();
        if (!provider || !provider.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        const connection = getSolanaConnection();
        const { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = window.solanaWeb3;
        
        const sellerPublicKey = new PublicKey(listing.seller);
        const marketplaceFee = listing.price * (MARKETPLACE_FEE_PERCENT / 100);
        const sellerAmount = listing.price - marketplaceFee;
        
        const transaction = new Transaction();
        
        // Transfer to seller
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: sellerPublicKey,
                lamports: sellerAmount * LAMPORTS_PER_SOL
            })
        );
        
        // Transfer marketplace fee (to program account)
        const programPublicKey = new PublicKey(PROGRAM_ID);
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: programPublicKey,
                lamports: marketplaceFee * LAMPORTS_PER_SOL
            })
        );
        
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = walletPublicKey;
        
        const signed = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
        
        return {
            success: true,
            signature: signature,
            domain: `${listing.name}${listing.tld}`,
            price: listing.price,
            message: 'Domain purchased successfully!'
        };
    } catch (error) {
        console.error('Failed to buy domain:', error);
        return {
            success: false,
            error: error.message || 'Failed to purchase domain'
        };
    }
}

// Fetch user's domains (from blockchain)
async function fetchUserDomains(walletAddress) {
    try {
        // In production, this would query the Solana program accounts
        // For now, return demo data with some persistence
        
        const storageKey = `domains_${walletAddress}`;
        const storedDomains = localStorage.getItem(storageKey);
        
        if (storedDomains) {
            const domains = JSON.parse(storedDomains);
            // Parse dates
            domains.forEach(domain => {
                domain.registeredDate = new Date(domain.registeredDate);
                domain.expiryDate = new Date(domain.expiryDate);
            });
            return domains;
        }
        
        // Return empty array if no domains
        return [];
    } catch (error) {
        console.error('Failed to fetch user domains:', error);
        return [];
    }
}

// Fetch marketplace listings
async function fetchMarketplaceListings() {
    try {
        // In production, this would query the marketplace program accounts
        // For now, return demo data
        
        const storedListings = localStorage.getItem('marketplace_listings');
        
        if (storedListings) {
            const listings = JSON.parse(storedListings);
            // Parse dates
            listings.forEach(listing => {
                listing.listedDate = new Date(listing.listedDate);
                listing.expiryDate = new Date(listing.expiryDate);
            });
            return listings;
        }
        
        // Return demo listings
        return [
            {
                name: 'crypto',
                tld: '.verse',
                price: 5.0,
                seller: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
                listedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                expiryDate: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
                nftMint: 'DEF456...'
            },
            {
                name: 'web3',
                tld: '.pulse',
                price: 10.5,
                seller: '8yBJZjhHU6T98d97TXJSDpbD5jBkheTqA83TZRuJosgT',
                listedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
                nftMint: 'GHI789...'
            }
        ];
    } catch (error) {
        console.error('Failed to fetch marketplace listings:', error);
        return [];
    }
}

// Save domain locally (for demo purposes)
function saveDomainLocally(domain, walletAddress) {
    try {
        const storageKey = `domains_${walletAddress}`;
        const storedDomains = localStorage.getItem(storageKey);
        let domains = storedDomains ? JSON.parse(storedDomains) : [];
        
        // Add new domain
        domains.push(domain);
        
        localStorage.setItem(storageKey, JSON.stringify(domains));
        return true;
    } catch (error) {
        console.error('Failed to save domain locally:', error);
        return false;
    }
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.SolanaUtils = {
        connectWallet,
        disconnectWallet,
        getWalletBalance,
        registerDomain,
        renewDomain,
        transferDomain,
        listDomainForSale,
        unlistDomain,
        buyDomainFromMarketplace,
        fetchUserDomains,
        fetchMarketplaceListings,
        saveDomainLocally,
        REGISTRATION_FEE,
        RENEWAL_FEE,
        MARKETPLACE_FEE_PERCENT
    };
}
