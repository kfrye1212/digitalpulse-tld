# Solana Smart Contract Integration Guide

This document describes the Solana blockchain integration implemented for the Digital Pulse TLD platform.

## Overview

The Digital Pulse TLD platform now features full integration with the Solana blockchain, enabling users to:
- Connect their Solana wallets (Phantom supported)
- Register domain names as NFTs on Solana
- Renew domain registrations
- Transfer domains to other wallet addresses
- List domains for sale on the marketplace
- Purchase domains from the marketplace

## Architecture

### Core Components

1. **solana-utils.js** - Central module for all blockchain interactions
2. **app.js** - Main application logic and wallet integration
3. **marketplace.js** - Marketplace-specific functionality
4. **my-domains.js** - Domain management functionality

### Network Configuration

The application is configured to use Solana Devnet by default for testing:

```javascript
const SOLANA_NETWORK = 'devnet'; // Change to 'mainnet-beta' for production
```

**Important:** Before deploying to production, update this to `mainnet-beta`.

## Key Features

### 1. Wallet Integration

**Supported Wallets:**
- Phantom Wallet (primary)
- Any Solana-compatible wallet that implements the standard provider interface

**Functions:**
- `connectWallet()` - Connects to user's Solana wallet
- `disconnectWallet()` - Disconnects the wallet
- `getWalletBalance()` - Retrieves wallet SOL balance

### 2. Domain Registration

**Cost:** 0.25 SOL per domain

**Process:**
1. User searches for available domain
2. Clicks "Register" button
3. Transaction is created and sent to Solana network
4. Upon confirmation, domain is saved to user's collection

**Implementation:** 
Uses `SystemProgram.transfer()` to send registration fee. In production, this should be replaced with a call to the actual Solana program instruction.

### 3. Domain Renewal

**Cost:** 0.15 SOL per year

**Process:**
1. User navigates to "My Domains"
2. Clicks "Renew" on a domain
3. Transaction extends domain ownership by 1 year

### 4. Domain Transfer

**Process:**
1. User enters recipient's Solana wallet address
2. Confirms transfer (irreversible)
3. NFT ownership is transferred on-chain

### 5. Marketplace Listing

**Marketplace Fee:** 5%

**Process:**
1. User sets a sale price for their domain
2. Domain is listed on the marketplace
3. When sold, 95% goes to seller, 5% to platform

### 6. Domain Purchase

**Process:**
1. Buyer browses marketplace
2. Clicks "Buy" on desired domain
3. Transaction splits payment between seller and platform
4. Domain ownership is transferred to buyer

## Transaction Flow

### Domain Registration Flow

```
1. User clicks "Register"
2. Create transaction with SystemProgram.transfer()
3. Sign transaction with wallet
4. Send transaction to Solana network
5. Wait for confirmation
6. Save domain to local storage (demo)
7. Display success message with transaction signature
```

### Marketplace Purchase Flow

```
1. User clicks "Buy for X SOL"
2. Calculate marketplace fee (5%)
3. Create transaction with two transfers:
   - Transfer to seller (95% of price)
   - Transfer to platform (5% marketplace fee)
4. Sign and send transaction
5. Wait for confirmation
6. Update domain ownership
7. Display success message
```

## Data Storage

### Current Implementation (Demo/Testing)

For demonstration purposes, domain data is stored in `localStorage`:

- User domains: `domains_{walletAddress}`
- Marketplace listings: `marketplace_listings`

### Production Implementation (Required)

For production, you must:

1. Deploy a Solana program (smart contract) to handle:
   - Domain registration
   - NFT minting
   - Ownership tracking
   - Marketplace escrow
   - Fee collection

2. Update `solana-utils.js` to:
   - Use actual program instructions instead of simple transfers
   - Query program accounts for user domains
   - Query marketplace program for listings
   - Handle program-derived addresses (PDAs)

## Smart Contract Requirements

### Recommended Program Structure

```rust
// Pseudo-code for Solana program

#[program]
pub mod digital_pulse_tld {
    // Register a new domain
    pub fn register_domain(
        ctx: Context<RegisterDomain>,
        domain_name: String,
        tld: String,
    ) -> Result<()> {
        // Verify payment
        // Mint NFT
        // Create domain account
        // Set expiry date
        Ok(())
    }
    
    // Renew domain
    pub fn renew_domain(
        ctx: Context<RenewDomain>,
    ) -> Result<()> {
        // Verify ownership
        // Verify payment
        // Extend expiry date
        Ok(())
    }
    
    // List for sale
    pub fn list_domain(
        ctx: Context<ListDomain>,
        price: u64,
    ) -> Result<()> {
        // Verify ownership
        // Create marketplace listing
        // Escrow NFT
        Ok(())
    }
    
    // Purchase from marketplace
    pub fn buy_domain(
        ctx: Context<BuyDomain>,
    ) -> Result<()> {
        // Transfer payment to seller
        // Transfer marketplace fee
        // Transfer NFT to buyer
        // Close listing
        Ok(())
    }
}
```

## Configuration

### Update Program ID

In `solana-utils.js`, update the program ID to your deployed program:

```javascript
const PROGRAM_ID = 'YourActualProgramIdHere123456789...';
```

### Update Network

For production deployment:

```javascript
const SOLANA_NETWORK = 'mainnet-beta';
```

### Update Fees (if needed)

```javascript
const REGISTRATION_FEE = 0.25; // SOL
const RENEWAL_FEE = 0.15; // SOL
const MARKETPLACE_FEE_PERCENT = 5; // 5%
```

## Error Handling

All transaction functions return a result object:

```javascript
{
    success: true/false,
    signature: "transaction_signature",
    error: "error_message",
    // additional fields...
}
```

Users receive clear feedback for:
- Wallet not connected
- Insufficient funds
- Transaction failures
- Network errors
- Invalid addresses

## Testing

### Test on Devnet

1. Install Phantom wallet extension
2. Switch wallet to Devnet
3. Get test SOL from Solana faucet
4. Navigate to the application
5. Connect wallet
6. Test all features

### Test Checklist

- [ ] Wallet connection/disconnection
- [ ] Domain search functionality
- [ ] Domain registration with transaction
- [ ] View registered domains
- [ ] Domain renewal
- [ ] Domain transfer
- [ ] List domain for sale
- [ ] Purchase domain from marketplace
- [ ] Unlist domain
- [ ] Error handling for insufficient funds
- [ ] Error handling for network issues

## Security Considerations

1. **Transaction Signing**: All transactions require user approval in wallet
2. **Address Validation**: Recipient addresses are validated before transfer
3. **No Private Keys**: Application never handles private keys
4. **Read-Only Access**: Wallet connection is read-only until transaction
5. **User Confirmation**: All transactions require explicit user confirmation

## Future Enhancements

1. **Multi-wallet Support**: Add support for Solflare, Slope, etc.
2. **Batch Operations**: Register multiple domains in one transaction
3. **Domain Expiry Notifications**: Alert users before domains expire
4. **Price Discovery**: Historical pricing data and trends
5. **Subdomain Support**: Enable subdomain creation
6. **Domain Resolution**: Integrate with Solana Name Service
7. **Advanced Filtering**: More marketplace search options
8. **Transaction History**: View all past transactions
9. **Gas Optimization**: Batch transactions to reduce fees
10. **Mobile Wallet Support**: Add mobile wallet adapters

## Troubleshooting

### Wallet Not Detected

**Issue**: "Install Phantom" button shows up even with wallet installed

**Solution**: 
- Refresh the page
- Ensure Phantom extension is enabled
- Try a different browser

### Transaction Fails

**Issue**: Transaction fails with "insufficient funds" or timeout

**Solution**:
- Verify wallet has enough SOL for transaction + fees
- Check network status (Solana status page)
- Try again with higher priority fee

### Domain Not Showing

**Issue**: Registered domain doesn't appear in "My Domains"

**Solution**:
- Wait for transaction confirmation (can take 30-60 seconds)
- Refresh the page
- Check transaction signature on Solana explorer

### Marketplace Empty

**Issue**: No domains showing in marketplace

**Solution**:
- This is expected in demo mode with fresh localStorage
- In production, query the program accounts

## Support

For issues or questions:
- Open an issue on GitHub
- Check documentation in `/docs`
- Review security policy in `SECURITY.md`

## License

See LICENSE file for details.
