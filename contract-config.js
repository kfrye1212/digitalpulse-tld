// Solana Program Configuration for Digital Pulse TLD
// This file contains the configuration for the Solana smart contract

// Network Configuration
const NETWORK = 'mainnet-beta'; // 'mainnet-beta', 'testnet', or 'devnet'
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

// Program IDs (Deploy your Solana program and update these)
// For now, using placeholder addresses - these need to be replaced with actual deployed program IDs
const PROGRAM_IDS = {
    DOMAIN_REGISTRY: 'DPTLDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Domain Registry Program
    MARKETPLACE: 'MPKTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Marketplace Program
};

// Platform wallet for marketplace fees
const PLATFORM_WALLET = '11111111111111111111111111111111'; // Replace with actual platform wallet

// Pricing (in SOL)
const PRICING = {
    REGISTRATION_FEE: 0.25,
    RENEWAL_FEE: 0.15,
    MARKETPLACE_FEE_PERCENT: 5,
    TRANSFER_FEE: 0.01
};

// Domain Configuration
const TLDS = ['.pulse', '.verse', '.cp', '.pv'];
const DOMAIN_EXPIRY_DAYS = 365; // 1 year

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NETWORK,
        RPC_ENDPOINT,
        PROGRAM_IDS,
        PLATFORM_WALLET,
        PRICING,
        TLDS,
        DOMAIN_EXPIRY_DAYS
    };
}
