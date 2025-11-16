// DigitalPulse TLD Blockchain Integration (Pure Solana Web3.js)
// Based on actual deployed contract IDL

class BlockchainService {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.programId = null;
    }

    /**
     * Initialize blockchain connection
     */
    async initialize() {
        try {
            // Check if Solana Web3 is loaded
            if (!window.solanaWeb3) {
                throw new Error('Solana Web3.js not loaded. Please refresh the page.');
            }

            // Create connection to Solana
            this.connection = new window.solanaWeb3.Connection(
                RPC_ENDPOINT,
                'confirmed'
            );

            this.programId = new window.solanaWeb3.PublicKey(PROGRAM_ID);

            console.log('Blockchain service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize blockchain service:', error);
            throw error;
        }
    }

    /**
     * Connect wallet
     */
    async connectWallet(walletProvider) {
        try {
            if (!this.connection) {
                await this.initialize();
            }

            this.wallet = walletProvider;

            console.log('Wallet connected');
            return true;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    /**
     * Parse domain account data based on actual IDL structure:
     * Domain {
     *   name: string,
     *   tld: string,
     *   owner: PublicKey (32 bytes),
     *   registeredAt: i64 (8 bytes),
     *   expiresAt: i64 (8 bytes)
     * }
     */
    parseDomainAccount(data, ownerPubkey) {
        try {
            // Skip 8-byte discriminator (Anchor accounts start with this)
            let offset = 8;

            // Read domain name (String: 4 bytes length + UTF-8 data)
            const nameLen = data.readUInt32LE(offset);
            offset += 4;
            if (nameLen > 63 || nameLen === 0) return null; // Invalid
            const name = data.slice(offset, offset + nameLen).toString('utf8');
            offset += nameLen;

            // Read TLD (String: 4 bytes length + UTF-8 data)
            const tldLen = data.readUInt32LE(offset);
            offset += 4;
            if (tldLen > 10 || tldLen === 0) return null; // Invalid
            const tld = data.slice(offset, offset + tldLen).toString('utf8');
            offset += tldLen;

            // Read owner (32 bytes PublicKey)
            const ownerBytes = data.slice(offset, offset + 32);
            const owner = new window.solanaWeb3.PublicKey(ownerBytes).toString();
            offset += 32;

            // Check if this domain belongs to the requested owner
            const isOwner = ownerPubkey ? (owner === ownerPubkey.toString()) : true;

            // Read timestamps (i64 = 8 bytes each, signed)
            const registeredAt = Number(data.readBigInt64LE(offset));
            offset += 8;
            const expiresAt = Number(data.readBigInt64LE(offset));
            offset += 8;

            return {
                name,
                tld,
                owner,
                isOwner,
                registeredAt,
                expiresAt
            };
        } catch (error) {
            console.error('Error parsing domain account:', error);
            return null;
        }
    }

    /**
     * Get user's domains by querying specific PDAs (bypasses RPC restrictions)
     */
    async getUserDomains(ownerAddress) {
        try {
            if (!this.connection) {
                await this.initialize();
            }

            const ownerPubkey = new window.solanaWeb3.PublicKey(ownerAddress);
            
            console.log('Fetching domains for owner:', ownerAddress);
            console.log('Querying specific domain PDAs...');
            
            // Get list of claimed domains
            if (typeof CLAIMED_DOMAINS === 'undefined') {
                console.error('CLAIMED_DOMAINS not loaded');
                return [];
            }

            const domains = [];
            let foundCount = 0;
            let notFoundCount = 0;

            // Query each domain PDA
            for (const domainInfo of CLAIMED_DOMAINS) {
                try {
                    const domainPDA = await getDomainPDA(domainInfo.name, domainInfo.tld, PROGRAM_ID);
                    
                    // Try to fetch the account
                    const accountInfo = await this.connection.getAccountInfo(domainPDA);
                    
                    if (accountInfo && accountInfo.data) {
                        const domain = this.parseDomainAccount(accountInfo.data, ownerPubkey);
                        
                        if (domain && domain.isOwner) {
                            domains.push({
                                address: domainPDA.toString(),
                                name: domain.name,
                                tld: domain.tld,
                                owner: domain.owner,
                                registeredAt: domain.registeredAt,
                                expiresAt: domain.expiresAt,
                                isExpired: isDomainExpired(domain.expiresAt)
                            });
                            foundCount++;
                        } else {
                            notFoundCount++;
                        }
                    } else {
                        notFoundCount++;
                    }
                } catch (err) {
                    // Domain doesn't exist or error fetching, skip
                    notFoundCount++;
                    continue;
                }
            }

            console.log(`Found ${foundCount} domains for owner`);
            console.log(`${notFoundCount} domains not found or not owned by user`);
            return domains;

        } catch (error) {
            console.error('Error fetching user domains:', error);
            return [];
        }
    }

    /**
     * Check if domain is available
     */
    async checkDomainAvailability(domainName, tldName) {
        try {
            if (!this.connection) {
                await this.initialize();
            }

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

            // If account exists, try to parse it
            try {
                const domain = this.parseDomainAccount(accountInfo.data, null);
                
                if (domain) {
                    return {
                        available: false,
                        domain: {
                            name: domain.name,
                            tld: domain.tld,
                            owner: domain.owner,
                            registeredAt: domain.registeredAt,
                            expiresAt: domain.expiresAt,
                            isExpired: isDomainExpired(domain.expiresAt)
                        }
                    };
                }
            } catch (parseError) {
                console.error('Error parsing domain:', parseError);
            }

            return {
                available: true,
                domain: null
            };

        } catch (error) {
            console.error('Error checking domain availability:', error);
            throw error;
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

    /**
     * Register domain (placeholder - requires transaction building)
     */
    async registerDomain(domainName, tldName) {
        throw new Error('Domain registration requires transaction signing. This feature will be implemented with proper transaction building.');
    }

    /**
     * Renew domain (placeholder)
     */
    async renewDomain(domainName, tldName) {
        throw new Error('Domain renewal requires transaction signing. This feature will be implemented with proper transaction building.');
    }

    /**
     * Transfer domain (placeholder)
     */
    async transferDomain(domainName, tldName, newOwner, salePrice) {
        throw new Error('Domain transfer requires transaction signing. This feature will be implemented with proper transaction building.');
    }

    /**
     * Get all domains (for marketplace)
     */
    async getAllDomains() {
        try {
            if (!this.connection) {
                await this.initialize();
            }

            console.log('Fetching all domains...');
            
            // Get all program accounts
            const accounts = await this.connection.getProgramAccounts(
                this.programId,
                {
                    filters: []  // Get all accounts, domain sizes vary (70-81 bytes)
                }
            );

            console.log(`Found ${accounts.length} total domains`);

            // Parse all domains
            const domains = [];
            
            for (const { pubkey, account } of accounts) {
                try {
                    const domain = this.parseDomainAccount(account.data, null);
                    
                    if (domain) {
                        domains.push({
                            address: pubkey.toString(),
                            name: domain.name,
                            tld: domain.tld,
                            owner: domain.owner,
                            registeredAt: domain.registeredAt,
                            expiresAt: domain.expiresAt,
                            isExpired: isDomainExpired(domain.expiresAt)
                        });
                    }
                } catch (parseError) {
                    continue;
                }
            }

            return domains;

        } catch (error) {
            console.error('Error fetching all domains:', error);
            return [];
        }
    }
}

// Create global blockchain service instance
const blockchainService = new BlockchainService();
