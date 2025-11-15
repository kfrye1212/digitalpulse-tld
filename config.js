// DigitalPulse TLD Configuration

// Solana Network Configuration
const SOLANA_NETWORK = 'mainnet-beta';
// Using public RPC to avoid Alchemy rate limits for getProgramAccounts
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';
// Backup: 'https://solana-mainnet.g.alchemy.com/v2/UaMQspIS7yGvjnvQNIoaQ'

// Contract Configuration
const PROGRAM_ID = '2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ';
const TREASURY_WALLET = 'ETGuhexB39NqELD9RFkqtCELPsAB7KsNLFUbQxcLLzpe';
const AUTHORITY_WALLET = 'GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH';

// Fee Structure (in lamports)
const REGISTRATION_FEE = 250_000_000; // 0.25 SOL
const RENEWAL_FEE = 150_000_000; // 0.15 SOL
const ROYALTY_PERCENTAGE = 5; // 5%

// TLD Configuration
const TLDS = [
    { name: 'pulse', displayName: '.pulse' },
    { name: 'verse', displayName: '.verse' },
    { name: 'cp', displayName: '.cp' },
    { name: 'pv', displayName: '.pv' }
];

// Program IDL (Interface Definition Language)
const PROGRAM_IDL = {
    version: '0.1.0',
    name: 'digitalpulse_tld',
    instructions: [
        {
            name: 'initializeService',
            accounts: [
                { name: 'service', isMut: true, isSigner: false },
                { name: 'authority', isMut: true, isSigner: true },
                { name: 'systemProgram', isMut: false, isSigner: false }
            ],
            args: []
        },
        {
            name: 'createTld',
            accounts: [
                { name: 'tld', isMut: true, isSigner: false },
                { name: 'service', isMut: true, isSigner: false },
                { name: 'authority', isMut: true, isSigner: true },
                { name: 'systemProgram', isMut: false, isSigner: false }
            ],
            args: [
                { name: 'name', type: 'string' },
                { name: 'price', type: 'u64' }
            ]
        },
        {
            name: 'registerDomain',
            accounts: [
                { name: 'domain', isMut: true, isSigner: false },
                { name: 'tld', isMut: true, isSigner: false },
                { name: 'service', isMut: true, isSigner: false },
                { name: 'owner', isMut: true, isSigner: true },
                { name: 'treasury', isMut: true, isSigner: false },
                { name: 'systemProgram', isMut: false, isSigner: false }
            ],
            args: [
                { name: 'domainName', type: 'string' },
                { name: 'tldName', type: 'string' }
            ]
        },
        {
            name: 'renewDomain',
            accounts: [
                { name: 'domain', isMut: true, isSigner: false },
                { name: 'service', isMut: true, isSigner: false },
                { name: 'owner', isMut: true, isSigner: true },
                { name: 'treasury', isMut: true, isSigner: false },
                { name: 'systemProgram', isMut: false, isSigner: false }
            ],
            args: []
        },
        {
            name: 'transferDomain',
            accounts: [
                { name: 'domain', isMut: true, isSigner: false },
                { name: 'service', isMut: true, isSigner: false },
                { name: 'currentOwner', isMut: true, isSigner: true },
                { name: 'newOwner', isMut: true, isSigner: false },
                { name: 'treasury', isMut: true, isSigner: false },
                { name: 'systemProgram', isMut: false, isSigner: false }
            ],
            args: [
                { name: 'salePrice', type: 'u64' }
            ]
        }
    ],
    accounts: [
        {
            name: 'Service',
            type: {
                kind: 'struct',
                fields: [
                    { name: 'authority', type: 'publicKey' },
                    { name: 'treasury', type: 'publicKey' },
                    { name: 'totalDomains', type: 'u64' },
                    { name: 'totalTlds', type: 'u64' }
                ]
            }
        },
        {
            name: 'TLD',
            type: {
                kind: 'struct',
                fields: [
                    { name: 'name', type: 'string' },
                    { name: 'price', type: 'u64' },
                    { name: 'owner', type: 'publicKey' },
                    { name: 'createdAt', type: 'i64' },
                    { name: 'isActive', type: 'bool' },
                    { name: 'totalDomains', type: 'u64' }
                ]
            }
        },
        {
            name: 'Domain',
            type: {
                kind: 'struct',
                fields: [
                    { name: 'name', type: 'string' },
                    { name: 'tld', type: 'string' },
                    { name: 'owner', type: 'publicKey' },
                    { name: 'registeredAt', type: 'i64' },
                    { name: 'expiresAt', type: 'i64' },
                    { name: 'isActive', type: 'bool' }
                ]
            }
        }
    ],
    errors: [
        { code: 6000, name: 'TLDNameTooLong', msg: 'TLD name is too long' },
        { code: 6001, name: 'DomainNameTooLong', msg: 'Domain name is too long' },
        { code: 6002, name: 'DomainNameTooShort', msg: 'Domain name is too short' },
        { code: 6003, name: 'InvalidPrice', msg: 'Invalid price' },
        { code: 6004, name: 'TLDNotActive', msg: 'TLD is not active' },
        { code: 6005, name: 'InsufficientFunds', msg: 'Insufficient funds' },
        { code: 6006, name: 'DomainNotActive', msg: 'Domain is not active' },
        { code: 6007, name: 'NotDomainOwner', msg: 'Not the domain owner' },
        { code: 6008, name: 'Unauthorized', msg: 'Unauthorized' }
    ]
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SOLANA_NETWORK,
        RPC_ENDPOINT,
        PROGRAM_ID,
        TREASURY_WALLET,
        AUTHORITY_WALLET,
        REGISTRATION_FEE,
        RENEWAL_FEE,
        ROYALTY_PERCENTAGE,
        TLDS,
        PROGRAM_IDL
    };
}
