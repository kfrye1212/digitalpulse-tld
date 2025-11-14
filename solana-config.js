// Solana Network Configuration
const SOLANA_NETWORK = 'devnet'; // Change to 'mainnet-beta' for production

// RPC Endpoints
const RPC_ENDPOINTS = {
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
    'devnet': 'https://api.devnet.solana.com',
    'testnet': 'https://api.testnet.solana.com'
};

// Program/Contract Addresses (placeholder - replace with actual deployed program)
const PROGRAM_ADDRESSES = {
    'mainnet-beta': 'YourMainnetProgramAddressHere',
    'devnet': 'YourDevnetProgramAddressHere',
    'testnet': 'YourTestnetProgramAddressHere'
};

// Get current network configuration
function getSolanaConfig() {
    return {
        network: SOLANA_NETWORK,
        rpcEndpoint: RPC_ENDPOINTS[SOLANA_NETWORK],
        programId: PROGRAM_ADDRESSES[SOLANA_NETWORK]
    };
}

// Domain pricing in SOL
const DOMAIN_PRICING = {
    registration: 0.25,
    renewal: 0.15,
    marketplaceFee: 0.05 // 5%
};

// Available TLDs
const AVAILABLE_TLDS = ['.pulse', '.verse', '.cp', '.pv'];

// Create connection to Solana
async function createSolanaConnection() {
    const config = getSolanaConfig();
    
    // Check if Solana Web3.js is loaded
    if (typeof solanaWeb3 === 'undefined') {
        console.warn('Solana Web3.js library not loaded, using fallback mode');
        // Return a mock connection for demo purposes
        return null;
    }
    
    try {
        return new solanaWeb3.Connection(config.rpcEndpoint, 'confirmed');
    } catch (error) {
        console.error('Failed to create Solana connection:', error);
        return null;
    }
}

// Get wallet provider (Phantom, Solflare, etc.)
function getWalletProvider() {
    if (window.solana && window.solana.isPhantom) {
        return window.solana;
    } else if (window.solflare && window.solflare.isSolflare) {
        return window.solflare;
    } else if (window.solana) {
        return window.solana;
    }
    return null;
}

// Check if wallet is installed
function isWalletInstalled() {
    return getWalletProvider() !== null;
}

// Transaction helpers
async function sendTransaction(connection, transaction, wallet) {
    try {
        // Check if we have the Solana library
        if (!connection || typeof solanaWeb3 === 'undefined') {
            // Mock transaction for demo
            console.log('Mock transaction:', { transaction, wallet: wallet.publicKey?.toString() });
            return 'mock_signature_' + Math.random().toString(36).substr(2, 9);
        }
        
        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;
        
        // Sign transaction
        const signed = await wallet.signTransaction(transaction);
        
        // Send transaction
        const signature = await connection.sendRawTransaction(signed.serialize());
        
        // Confirm transaction
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        
        if (confirmation.value.err) {
            throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
        }
        
        return signature;
    } catch (error) {
        console.error('Transaction error:', error);
        throw error;
    }
}

// Simulate domain registration (placeholder until actual program is deployed)
async function simulateDomainRegistration(connection, wallet, domainName, tld) {
    try {
        // Check if we have Solana Web3.js loaded
        if (!connection || typeof solanaWeb3 === 'undefined') {
            // Mock successful registration for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockSignature = 'mock_' + Math.random().toString(36).substr(2, 16);
            return {
                success: true,
                signature: mockSignature,
                message: 'Domain registration simulated successfully (demo mode)',
                domain: `${domainName}${tld}`,
                nftMint: mockSignature.slice(0, 8) + '...'
            };
        }
        
        // For now, just send a small SOL transfer to verify wallet connection
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: wallet.publicKey, // Send to self for testing
                lamports: 1 // 1 lamport
            })
        );
        
        const signature = await sendTransaction(connection, transaction, wallet);
        
        return {
            success: true,
            signature: signature,
            message: 'Domain registration simulated successfully',
            domain: `${domainName}${tld}`,
            // In production, this would be the actual NFT mint address
            nftMint: signature.slice(0, 8) + '...'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Simulate marketplace purchase
async function simulateMarketplacePurchase(connection, wallet, listing) {
    try {
        // Check if we have Solana Web3.js loaded
        if (!connection || typeof solanaWeb3 === 'undefined') {
            // Mock successful purchase for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockSignature = 'mock_' + Math.random().toString(36).substr(2, 16);
            return {
                success: true,
                signature: mockSignature,
                message: 'Domain purchase simulated successfully (demo mode)',
                domain: `${listing.name}${listing.tld}`
            };
        }
        
        // Calculate amounts
        const priceInLamports = Math.floor(listing.price * solanaWeb3.LAMPORTS_PER_SOL);
        
        // For now, just send a small SOL transfer to verify wallet connection
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: wallet.publicKey, // Send to self for testing
                lamports: 1 // 1 lamport
            })
        );
        
        const signature = await sendTransaction(connection, transaction, wallet);
        
        return {
            success: true,
            signature: signature,
            message: 'Domain purchase simulated successfully',
            domain: `${listing.name}${listing.tld}`
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Simulate domain renewal
async function simulateDomainRenewal(connection, wallet, domainName, tld) {
    try {
        // Check if we have Solana Web3.js loaded
        if (!connection || typeof solanaWeb3 === 'undefined') {
            // Mock successful renewal for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockSignature = 'mock_' + Math.random().toString(36).substr(2, 16);
            return {
                success: true,
                signature: mockSignature,
                message: 'Domain renewal simulated successfully (demo mode)',
                domain: `${domainName}${tld}`
            };
        }
        
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: wallet.publicKey,
                lamports: 1
            })
        );
        
        const signature = await sendTransaction(connection, transaction, wallet);
        
        return {
            success: true,
            signature: signature,
            message: 'Domain renewal simulated successfully',
            domain: `${domainName}${tld}`
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Simulate domain transfer
async function simulateDomainTransfer(connection, wallet, domainName, tld, recipient) {
    try {
        // Validate recipient address
        if (typeof solanaWeb3 !== 'undefined') {
            try {
                new solanaWeb3.PublicKey(recipient);
            } catch {
                throw new Error('Invalid recipient address');
            }
        } else if (recipient.length < 32) {
            throw new Error('Invalid recipient address');
        }
        
        // Check if we have Solana Web3.js loaded
        if (!connection || typeof solanaWeb3 === 'undefined') {
            // Mock successful transfer for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockSignature = 'mock_' + Math.random().toString(36).substr(2, 16);
            return {
                success: true,
                signature: mockSignature,
                message: 'Domain transfer simulated successfully (demo mode)',
                domain: `${domainName}${tld}`,
                recipient: recipient
            };
        }
        
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: wallet.publicKey,
                lamports: 1
            })
        );
        
        const signature = await sendTransaction(connection, transaction, wallet);
        
        return {
            success: true,
            signature: signature,
            message: 'Domain transfer simulated successfully',
            domain: `${domainName}${tld}`,
            recipient: recipient
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Utility: Format wallet address
function formatWalletAddress(address, chars = 4) {
    if (!address) return '';
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Utility: Get Solana explorer link
function getExplorerLink(signature, network = SOLANA_NETWORK) {
    const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
    return `https://explorer.solana.com/tx/${signature}${cluster}`;
}
