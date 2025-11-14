// Solana Smart Contract Integration
// This module handles all interactions with the Solana blockchain

class SolanaContract {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.programId = null;
        this.initialized = false;
    }

    // Initialize connection to Solana
    async initialize(rpcEndpoint = 'https://api.mainnet-beta.solana.com') {
        try {
            // Create connection to Solana cluster
            this.connection = new solanaWeb3.Connection(
                rpcEndpoint,
                'confirmed'
            );

            // Check if wallet is available
            if (window.solana && window.solana.isPhantom) {
                this.wallet = window.solana;
            }

            this.initialized = true;
            console.log('Solana contract initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Solana contract:', error);
            return false;
        }
    }

    // Get wallet public key
    getWalletPublicKey() {
        if (!this.wallet || !this.wallet.publicKey) {
            return null;
        }
        return this.wallet.publicKey;
    }

    // Check domain availability on-chain
    async checkDomainAvailability(domainName, tld) {
        try {
            // For production: Query the Solana program to check if domain exists
            // const domainPDA = await this.getDomainPDA(domainName, tld);
            // const accountInfo = await this.connection.getAccountInfo(domainPDA);
            // return accountInfo === null; // Available if account doesn't exist

            // For demo: Generate realistic availability
            const hash = this.hashString(domainName + tld);
            return hash % 10 < 7; // 70% availability rate
        } catch (error) {
            console.error('Error checking domain availability:', error);
            return false;
        }
    }

    // Register a domain as NFT
    async registerDomain(domainName, tld, registrationFee) {
        if (!this.wallet || !this.wallet.publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            const publicKey = this.wallet.publicKey;

            // Create transaction for domain registration
            const transaction = new solanaWeb3.Transaction();

            // For production: Add instruction to call Solana program
            // const instruction = await this.createRegisterDomainInstruction(
            //     domainName,
            //     tld,
            //     publicKey,
            //     registrationFee
            // );
            // transaction.add(instruction);

            // For demo: Create a simple SOL transfer to simulate payment
            const platformWallet = new solanaWeb3.PublicKey('11111111111111111111111111111111');
            const lamports = registrationFee * solanaWeb3.LAMPORTS_PER_SOL;

            transaction.add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: platformWallet,
                    lamports: Math.floor(lamports),
                })
            );

            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            // Sign and send transaction
            const signed = await this.wallet.signTransaction(transaction);
            const signature = await this.connection.sendRawTransaction(signed.serialize());

            // Wait for confirmation
            await this.connection.confirmTransaction(signature, 'confirmed');

            console.log('Domain registered successfully:', signature);
            return {
                success: true,
                signature: signature,
                domain: `${domainName}${tld}`,
                nftMint: signature.slice(0, 10) + '...' // Placeholder for NFT mint address
            };
        } catch (error) {
            console.error('Domain registration failed:', error);
            throw error;
        }
    }

    // Get user's domains
    async getUserDomains(walletAddress) {
        try {
            if (!walletAddress) {
                return [];
            }

            // For production: Query the Solana program for user's domains
            // const publicKey = new solanaWeb3.PublicKey(walletAddress);
            // const accounts = await this.connection.getProgramAccounts(
            //     this.programId,
            //     {
            //         filters: [
            //             {
            //                 memcmp: {
            //                     offset: 8,
            //                     bytes: publicKey.toBase58(),
            //                 },
            //             },
            //         ],
            //     }
            // );
            // return this.parseDomainAccounts(accounts);

            // For demo: Return sample domains
            const now = Date.now();
            return [
                {
                    name: 'myname',
                    tld: '.pulse',
                    owner: walletAddress,
                    registeredDate: new Date(now - 30 * 24 * 60 * 60 * 1000),
                    expiryDate: new Date(now + 335 * 24 * 60 * 60 * 1000),
                    isListed: false,
                    listPrice: null,
                    nftMint: 'ABC' + walletAddress.slice(0, 7) + '...'
                },
                {
                    name: 'crypto',
                    tld: '.verse',
                    owner: walletAddress,
                    registeredDate: new Date(now - 60 * 24 * 60 * 60 * 1000),
                    expiryDate: new Date(now + 20 * 24 * 60 * 60 * 1000),
                    isListed: true,
                    listPrice: 5.0,
                    nftMint: 'DEF' + walletAddress.slice(0, 7) + '...'
                }
            ];
        } catch (error) {
            console.error('Error fetching user domains:', error);
            return [];
        }
    }

    // Renew a domain
    async renewDomain(domainName, tld, renewalFee) {
        if (!this.wallet || !this.wallet.publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            const publicKey = this.wallet.publicKey;
            const transaction = new solanaWeb3.Transaction();

            // For demo: Create a simple SOL transfer to simulate renewal payment
            const platformWallet = new solanaWeb3.PublicKey('11111111111111111111111111111111');
            const lamports = renewalFee * solanaWeb3.LAMPORTS_PER_SOL;

            transaction.add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: platformWallet,
                    lamports: Math.floor(lamports),
                })
            );

            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signed = await this.wallet.signTransaction(transaction);
            const signature = await this.connection.sendRawTransaction(signed.serialize());
            await this.connection.confirmTransaction(signature, 'confirmed');

            console.log('Domain renewed successfully:', signature);
            return {
                success: true,
                signature: signature,
                domain: `${domainName}${tld}`
            };
        } catch (error) {
            console.error('Domain renewal failed:', error);
            throw error;
        }
    }

    // Transfer domain to another wallet
    async transferDomain(domainName, tld, recipientAddress) {
        if (!this.wallet || !this.wallet.publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            const publicKey = this.wallet.publicKey;
            const recipientPublicKey = new solanaWeb3.PublicKey(recipientAddress);

            // For production: Create instruction to transfer NFT ownership
            // This would involve transferring the domain NFT to the recipient

            const transaction = new solanaWeb3.Transaction();

            // For demo: Create a small SOL transfer as transaction fee
            transaction.add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: 0.01 * solanaWeb3.LAMPORTS_PER_SOL,
                })
            );

            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signed = await this.wallet.signTransaction(transaction);
            const signature = await this.connection.sendRawTransaction(signed.serialize());
            await this.connection.confirmTransaction(signature, 'confirmed');

            console.log('Domain transferred successfully:', signature);
            return {
                success: true,
                signature: signature,
                domain: `${domainName}${tld}`,
                recipient: recipientAddress
            };
        } catch (error) {
            console.error('Domain transfer failed:', error);
            throw error;
        }
    }

    // List domain on marketplace
    async listDomainForSale(domainName, tld, price) {
        if (!this.wallet || !this.wallet.publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            const publicKey = this.wallet.publicKey;

            // For production: Create instruction to list domain on marketplace
            // This would create a marketplace listing account

            const transaction = new solanaWeb3.Transaction();

            // For demo: Create a tiny transaction as listing fee
            const platformWallet = new solanaWeb3.PublicKey('11111111111111111111111111111111');
            transaction.add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: platformWallet,
                    lamports: 0.001 * solanaWeb3.LAMPORTS_PER_SOL,
                })
            );

            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signed = await this.wallet.signTransaction(transaction);
            const signature = await this.connection.sendRawTransaction(signed.serialize());
            await this.connection.confirmTransaction(signature, 'confirmed');

            console.log('Domain listed successfully:', signature);
            return {
                success: true,
                signature: signature,
                domain: `${domainName}${tld}`,
                price: price
            };
        } catch (error) {
            console.error('Domain listing failed:', error);
            throw error;
        }
    }

    // Unlist domain from marketplace
    async unlistDomain(domainName, tld) {
        if (!this.wallet || !this.wallet.publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            // For production: Create instruction to remove marketplace listing
            // This would close the marketplace listing account

            console.log('Domain unlisted successfully');
            return {
                success: true,
                domain: `${domainName}${tld}`
            };
        } catch (error) {
            console.error('Domain unlisting failed:', error);
            throw error;
        }
    }

    // Buy domain from marketplace
    async buyDomainFromMarketplace(listing) {
        if (!this.wallet || !this.wallet.publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            const publicKey = this.wallet.publicKey;
            const transaction = new solanaWeb3.Transaction();

            // Calculate marketplace fee
            const marketplaceFee = listing.price * 0.05; // 5%
            const sellerAmount = listing.price - marketplaceFee;

            // For production: Create instruction to execute marketplace sale
            // This would:
            // 1. Transfer SOL to seller
            // 2. Transfer marketplace fee to platform
            // 3. Transfer NFT to buyer

            // For demo: Create SOL transfers
            const sellerPublicKey = new solanaWeb3.PublicKey(listing.seller);
            const platformWallet = new solanaWeb3.PublicKey('11111111111111111111111111111111');

            // Transfer to seller
            transaction.add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: sellerPublicKey,
                    lamports: Math.floor(sellerAmount * solanaWeb3.LAMPORTS_PER_SOL),
                })
            );

            // Transfer marketplace fee
            transaction.add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: platformWallet,
                    lamports: Math.floor(marketplaceFee * solanaWeb3.LAMPORTS_PER_SOL),
                })
            );

            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signed = await this.wallet.signTransaction(transaction);
            const signature = await this.connection.sendRawTransaction(signed.serialize());
            await this.connection.confirmTransaction(signature, 'confirmed');

            console.log('Domain purchased successfully:', signature);
            return {
                success: true,
                signature: signature,
                domain: `${listing.name}${listing.tld}`,
                price: listing.price
            };
        } catch (error) {
            console.error('Domain purchase failed:', error);
            throw error;
        }
    }

    // Get marketplace listings
    async getMarketplaceListings() {
        try {
            // For production: Query the Solana program for all marketplace listings
            // const accounts = await this.connection.getProgramAccounts(
            //     this.marketplaceProgramId,
            //     { filters: [...] }
            // );
            // return this.parseMarketplaceAccounts(accounts);

            // For demo: Return sample listings
            const now = Date.now();
            return [
                {
                    name: 'crypto',
                    tld: '.verse',
                    price: 5.0,
                    seller: 'ABC123xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxXYZ789',
                    listedDate: new Date(now - 5 * 24 * 60 * 60 * 1000),
                    expiryDate: new Date(now + 320 * 24 * 60 * 60 * 1000),
                    nftMint: 'DEF456...'
                },
                {
                    name: 'web3',
                    tld: '.pulse',
                    price: 10.5,
                    seller: 'GHI789xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxMNO012',
                    listedDate: new Date(now - 2 * 24 * 60 * 60 * 1000),
                    expiryDate: new Date(now + 350 * 24 * 60 * 60 * 1000),
                    nftMint: 'GHI789...'
                },
                {
                    name: 'defi',
                    tld: '.cp',
                    price: 2.5,
                    seller: 'JKL012xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPQR345',
                    listedDate: new Date(now - 1 * 24 * 60 * 60 * 1000),
                    expiryDate: new Date(now + 280 * 24 * 60 * 60 * 1000),
                    nftMint: 'JKL012...'
                },
                {
                    name: 'nft',
                    tld: '.pv',
                    price: 8.0,
                    seller: 'STU345xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxVWX678',
                    listedDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
                    expiryDate: new Date(now + 300 * 24 * 60 * 60 * 1000),
                    nftMint: 'STU345...'
                },
                {
                    name: 'dao',
                    tld: '.pulse',
                    price: 0.8,
                    seller: 'YZA678xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxBCD901',
                    listedDate: new Date(now - 3 * 24 * 60 * 60 * 1000),
                    expiryDate: new Date(now + 340 * 24 * 60 * 60 * 1000),
                    nftMint: 'YZA678...'
                }
            ];
        } catch (error) {
            console.error('Error fetching marketplace listings:', error);
            return [];
        }
    }

    // Get wallet balance
    async getWalletBalance(walletAddress) {
        try {
            if (!walletAddress) return 0;

            const publicKey = new solanaWeb3.PublicKey(walletAddress);
            const balance = await this.connection.getBalance(publicKey);
            return balance / solanaWeb3.LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            return 0;
        }
    }

    // Utility: Hash string for demo availability
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    // Utility: Get domain PDA (Program Derived Address)
    async getDomainPDA(domainName, tld) {
        // For production: Calculate PDA for domain account
        // const [pda] = await solanaWeb3.PublicKey.findProgramAddress(
        //     [
        //         Buffer.from('domain'),
        //         Buffer.from(domainName + tld),
        //     ],
        //     this.programId
        // );
        // return pda;
        return null;
    }
}

// Create global instance
const solanaContract = new SolanaContract();

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        await solanaContract.initialize();
    });
}
