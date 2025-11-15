// DigitalPulse TLD Blockchain Integration (Pure Solana Web3.js)

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
     * Get user's domains by querying program accounts
     */
    async getUserDomains(ownerAddress) {
        try {
            if (!this.connection) {
                await this.initialize();
            }

            const ownerPubkey = new window.solanaWeb3.PublicKey(ownerAddress);
            
            console.log('Fetching domains for owner:', ownerAddress);
            
            // Get all program accounts (domains)
            const accounts = await this.connection.getProgramAccounts(
                this.programId,
                {
                    filters: [
                        {
                            // Filter by owner (offset depends on account structure)
                            // Typical Anchor account: 8 bytes discriminator + data
                            // We'll fetch all and filter in JS for now
                            dataSize: 200 // Approximate size, adjust if needed
                        }
                    ]
                }
            );

            console.log(`Found ${accounts.length} total program accounts`);

            // Parse and filter domains
            const domains = [];
            for (const { pubkey, account } of accounts) {
                try {
                    const data = account.data;
                    
                    // Skip if data is too small
                    if (data.length < 100) continue;

                    // Try to deserialize domain data
                    // This is a simplified parser - adjust offsets based on your contract
                    const domain = this.parseDomainAccount(data, ownerPubkey);
                    
                    if (domain && domain.isOwner) {
                        domains.push({
                            address: pubkey.toString(),
                            name: domain.name,
                            tld: domain.tld,
                            owner: domain.owner,
                            registeredAt: domain.registeredAt,
                            expiresAt: domain.expiresAt,
                            isActive: domain.isActive,
                            isExpired: isDomainExpired(domain.expiresAt)
                        });
                    }
                } catch (parseError) {
                    // Skip accounts that can't be parsed
                    continue;
                }
            }

            console.log(`Found ${domains.length} domains for owner`);
            return domains;

        } catch (error) {
            console.error('Error fetching user domains:', error);
            // Return empty array instead of throwing to avoid breaking the UI
            return [];
        }
    }

    /**
     * Parse domain account data
     * Note: This is a simplified parser. Adjust based on your actual account structure.
     */
    parseDomainAccount(data, ownerPubkey) {
        try {
            // Skip 8-byte discriminator (Anchor accounts start with this)
            let offset = 8;

            // Read domain name (String: 4 bytes length + data)
            const nameLen = data.readUInt32LE(offset);
            offset += 4;
            if (nameLen > 63) return null; // Invalid
            const name = data.slice(offset, offset + nameLen).toString('utf8');
            offset += 63; // Max name length in contract

            // Read TLD (String: 4 bytes length + data)
            const tldLen = data.readUInt32LE(offset);
            offset += 4;
            if (tldLen > 10) return null; // Invalid
            const tld = data.slice(offset, offset + tldLen).toString('utf8');
            offset += 10; // Max TLD length in contract

            // Read owner (32 bytes PublicKey)
            const ownerBytes = data.slice(offset, offset + 32);
            const owner = new window.solanaWeb3.PublicKey(ownerBytes).toString();
            offset += 32;

            // Check if this domain belongs to the requested owner
            const isOwner = owner === ownerPubkey.toString();

            // Read timestamps (i64 = 8 bytes each)
            const registeredAt = Number(data.readBigInt64LE(offset));
            offset += 8;
            const expiresAt = Number(data.readBigInt64LE(offset));
            offset += 8;

            // Read boolean flags
            const isActive = data.readUInt8(offset) === 1;
            offset += 1;

            return {
                name,
                tld,
                owner,
                isOwner,
                registeredAt,
                expiresAt,
                isActive
            };
        } catch (error) {
            console.error('Error parsing domain account:', error);
            return null;
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
                const domain = this.parseDomainAccount(accountInfo.data, new window.solanaWeb3.PublicKey('11111111111111111111111111111111'));
                
                if (domain) {
                    return {
                        available: false,
                        domain: {
                            name: domain.name,
                            tld: domain.tld,
                            owner: domain.owner,
                            registeredAt: domain.registeredAt,
                            expiresAt: domain.expiresAt,
                            isActive: domain.isActive,
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
                    filters: [
                        {
                            dataSize: 200 // Approximate size
                        }
                    ]
                }
            );

            console.log(`Found ${accounts.length} total domains`);

            // Parse all domains
            const domains = [];
            const dummyOwner = new window.solanaWeb3.PublicKey('11111111111111111111111111111111');
            
            for (const { pubkey, account } of accounts) {
                try {
                    const domain = this.parseDomainAccount(account.data, dummyOwner);
                    
                    if (domain) {
                        domains.push({
                            address: pubkey.toString(),
                            name: domain.name,
                            tld: domain.tld,
                            owner: domain.owner,
                            registeredAt: domain.registeredAt,
                            expiresAt: domain.expiresAt,
                            isActive: domain.isActive,
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
