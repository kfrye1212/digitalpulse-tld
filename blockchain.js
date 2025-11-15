// DigitalPulse TLD Blockchain Integration

class BlockchainService {
    constructor() {
        this.connection = null;
        this.program = null;
        this.wallet = null;
        this.provider = null;
    }

    /**
     * Initialize blockchain connection
     */
    async initialize() {
        try {
            // Check if Solana Web3 is loaded
            if (!window.solanaWeb3 || !window.anchor) {
                throw new Error('Solana libraries not loaded. Please refresh the page.');
            }

            // Create connection to Solana
            this.connection = new window.solanaWeb3.Connection(
                RPC_ENDPOINT,
                'confirmed'
            );

            console.log('Blockchain service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize blockchain service:', error);
            throw error;
        }
    }

    /**
     * Connect wallet and initialize program
     */
    async connectWallet(walletProvider) {
        try {
            if (!this.connection) {
                await this.initialize();
            }

            this.wallet = walletProvider;
            
            // Create Anchor provider
            this.provider = new window.anchor.AnchorProvider(
                this.connection,
                this.wallet,
                { commitment: 'confirmed' }
            );

            // Create program instance
            this.program = new window.anchor.Program(
                PROGRAM_IDL,
                new window.solanaWeb3.PublicKey(PROGRAM_ID),
                this.provider
            );

            console.log('Wallet connected and program initialized');
            return true;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    /**
     * Check if domain is available
     */
    async checkDomainAvailability(domainName, tldName) {
        try {
            const domainPDA = await getDomainPDA(domainName, tldName, PROGRAM_ID);
            
            // Try to fetch domain account
            const accountInfo = await this.connection.getAccountInfo(domainPDA);
            
            // If account doesn't exist, domain is available
            if (!accountInfo) {
                return {
                    available: true,
                    domain: null
                };
            }

            // If account exists, try to deserialize it
            try {
                const domain = await this.program.account.domain.fetch(domainPDA);
                return {
                    available: false,
                    domain: {
                        name: domain.name,
                        tld: domain.tld,
                        owner: domain.owner.toString(),
                        registeredAt: domain.registeredAt.toNumber(),
                        expiresAt: domain.expiresAt.toNumber(),
                        isActive: domain.isActive,
                        isExpired: isDomainExpired(domain.expiresAt.toNumber())
                    }
                };
            } catch (deserializeError) {
                console.error('Error deserializing domain:', deserializeError);
                return {
                    available: true,
                    domain: null
                };
            }
        } catch (error) {
            console.error('Error checking domain availability:', error);
            throw error;
        }
    }

    /**
     * Register a new domain
     */
    async registerDomain(domainName, tldName) {
        try {
            if (!this.program || !this.wallet) {
                throw new Error('Wallet not connected');
            }

            // Validate domain name
            if (!validateDomainName(domainName)) {
                throw new Error('Invalid domain name. Use only lowercase letters, numbers, and hyphens.');
            }

            // Get PDAs
            const servicePDA = await getServicePDA(PROGRAM_ID);
            const tldPDA = await getTLDPDA(tldName, PROGRAM_ID);
            const domainPDA = await getDomainPDA(domainName, tldName, PROGRAM_ID);
            const treasuryPubkey = new window.solanaWeb3.PublicKey(TREASURY_WALLET);

            // Execute transaction
            const tx = await this.program.methods
                .registerDomain(domainName, tldName)
                .accounts({
                    domain: domainPDA,
                    tld: tldPDA,
                    service: servicePDA,
                    owner: this.wallet.publicKey,
                    treasury: treasuryPubkey,
                    systemProgram: window.solanaWeb3.SystemProgram.programId
                })
                .rpc();

            console.log('Domain registered! Transaction:', tx);
            
            return {
                success: true,
                signature: tx,
                domain: `${domainName}.${tldName}`
            };
        } catch (error) {
            console.error('Error registering domain:', error);
            throw error;
        }
    }

    /**
     * Renew a domain
     */
    async renewDomain(domainName, tldName) {
        try {
            if (!this.program || !this.wallet) {
                throw new Error('Wallet not connected');
            }

            // Get PDAs
            const servicePDA = await getServicePDA(PROGRAM_ID);
            const domainPDA = await getDomainPDA(domainName, tldName, PROGRAM_ID);
            const treasuryPubkey = new window.solanaWeb3.PublicKey(TREASURY_WALLET);

            // Execute transaction
            const tx = await this.program.methods
                .renewDomain()
                .accounts({
                    domain: domainPDA,
                    service: servicePDA,
                    owner: this.wallet.publicKey,
                    treasury: treasuryPubkey,
                    systemProgram: window.solanaWeb3.SystemProgram.programId
                })
                .rpc();

            console.log('Domain renewed! Transaction:', tx);
            
            return {
                success: true,
                signature: tx,
                domain: `${domainName}.${tldName}`
            };
        } catch (error) {
            console.error('Error renewing domain:', error);
            throw error;
        }
    }

    /**
     * Transfer domain to new owner
     */
    async transferDomain(domainName, tldName, newOwner, salePrice) {
        try {
            if (!this.program || !this.wallet) {
                throw new Error('Wallet not connected');
            }

            // Get PDAs
            const servicePDA = await getServicePDA(PROGRAM_ID);
            const domainPDA = await getDomainPDA(domainName, tldName, PROGRAM_ID);
            const treasuryPubkey = new window.solanaWeb3.PublicKey(TREASURY_WALLET);
            const newOwnerPubkey = new window.solanaWeb3.PublicKey(newOwner);

            // Convert SOL to lamports
            const salePriceLamports = solToLamports(salePrice);

            // Execute transaction
            const tx = await this.program.methods
                .transferDomain(new window.anchor.BN(salePriceLamports))
                .accounts({
                    domain: domainPDA,
                    service: servicePDA,
                    currentOwner: this.wallet.publicKey,
                    newOwner: newOwnerPubkey,
                    treasury: treasuryPubkey,
                    systemProgram: window.solanaWeb3.SystemProgram.programId
                })
                .rpc();

            console.log('Domain transferred! Transaction:', tx);
            
            return {
                success: true,
                signature: tx,
                domain: `${domainName}.${tldName}`
            };
        } catch (error) {
            console.error('Error transferring domain:', error);
            throw error;
        }
    }

    /**
     * Get user's domains
     */
    async getUserDomains(ownerAddress) {
        try {
            if (!this.program) {
                await this.initialize();
                // Create a temporary program instance for read-only operations
                const provider = new window.anchor.AnchorProvider(
                    this.connection,
                    window.solana, // Use Phantom as default
                    { commitment: 'confirmed' }
                );
                this.program = new window.anchor.Program(
                    PROGRAM_IDL,
                    new window.solanaWeb3.PublicKey(PROGRAM_ID),
                    provider
                );
            }

            const ownerPubkey = new window.solanaWeb3.PublicKey(ownerAddress);
            
            // Fetch all domain accounts owned by the user
            const domains = await this.program.account.domain.all([
                {
                    memcmp: {
                        offset: 8 + 4 + 63 + 4 + 10, // Skip discriminator, name string, tld string
                        bytes: ownerPubkey.toBase58()
                    }
                }
            ]);

            return domains.map(d => ({
                address: d.publicKey.toString(),
                name: d.account.name,
                tld: d.account.tld,
                owner: d.account.owner.toString(),
                registeredAt: d.account.registeredAt.toNumber(),
                expiresAt: d.account.expiresAt.toNumber(),
                isActive: d.account.isActive,
                isExpired: isDomainExpired(d.account.expiresAt.toNumber())
            }));
        } catch (error) {
            console.error('Error fetching user domains:', error);
            return [];
        }
    }

    /**
     * Get all active domains (for marketplace)
     */
    async getAllDomains() {
        try {
            if (!this.program) {
                await this.initialize();
                const provider = new window.anchor.AnchorProvider(
                    this.connection,
                    window.solana,
                    { commitment: 'confirmed' }
                );
                this.program = new window.anchor.Program(
                    PROGRAM_IDL,
                    new window.solanaWeb3.PublicKey(PROGRAM_ID),
                    provider
                );
            }

            const domains = await this.program.account.domain.all();

            return domains.map(d => ({
                address: d.publicKey.toString(),
                name: d.account.name,
                tld: d.account.tld,
                owner: d.account.owner.toString(),
                registeredAt: d.account.registeredAt.toNumber(),
                expiresAt: d.account.expiresAt.toNumber(),
                isActive: d.account.isActive,
                isExpired: isDomainExpired(d.account.expiresAt.toNumber())
            }));
        } catch (error) {
            console.error('Error fetching all domains:', error);
            return [];
        }
    }

    /**
     * Get wallet balance
     */
    async getBalance(address) {
        try {
            if (!this.connection) {
                await this.initialize();
            }

            const pubkey = new window.solanaWeb3.PublicKey(address);
            const balance = await this.connection.getBalance(pubkey);
            return balance / 1_000_000_000; // Convert to SOL
        } catch (error) {
            console.error('Error fetching balance:', error);
            return 0;
        }
    }
}

// Create global blockchain service instance
const blockchainService = new BlockchainService();
