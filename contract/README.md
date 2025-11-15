# DigitalPulse TLD Smart Contract

## Deployed Contract Information

**Program ID**: `2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ`  
**Network**: Solana Mainnet Beta  
**Framework**: Anchor  

## Contract Features

- **Multi-TLD Support**: .pulse, .verse, .cp, .pv
- **Domain Registration**: 0.25 SOL registration fee
- **Domain Renewal**: 0.15 SOL renewal fee (1 year extension)
- **Domain Transfer**: 5% royalty on marketplace sales
- **Authority Benefits**: Free registration and renewal for authority wallet
- **Treasury Management**: All fees go to designated treasury wallet

## Accounts

### Service Account
Global service configuration and statistics.

**Seeds**: `["service"]`

### TLD Account
Individual TLD configuration and domain count.

**Seeds**: `["tld", tld_name]`

### Domain Account
Individual domain ownership and expiration data.

**Seeds**: `["domain", domain_name, tld_name]`

## Instructions

### initialize_service
Initialize the TLD service with authority and treasury wallets.

### create_tld
Create a new TLD (authority only).

### register_domain
Register a new domain under a TLD.

### renew_domain
Renew an existing domain for 1 year.

### transfer_domain
Transfer domain ownership with royalty payment.

### update_authority
Update the authority wallet (current authority only).

### update_treasury
Update the treasury wallet (authority only).

## Building

```bash
anchor build
```

## Testing

```bash
anchor test
```

## Deployment

```bash
anchor deploy --provider.cluster mainnet
```

## Security

- Program is upgradeable
- Upgrade authority: `GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH`
- Treasury wallet: `ETGuhexB39NqELD9RFkqtCELPsAB7KsNLFUbQxcLLzpe`

## License

This is a production smart contract deployed on Solana mainnet.
