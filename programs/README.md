# Solana Smart Contract

This directory contains the Solana program (smart contract) for Digital Pulse TLD.

## Structure

- `programs/digitalpulse-tld/` - Smart contract source code
- `tests/` - Integration tests
- `migrations/` - Deployment scripts
- `Anchor.toml` - Anchor configuration

## Prerequisites

- Rust and Cargo
- Solana CLI tools
- Anchor framework

## Building

```bash
anchor build
```

## Testing

```bash
anchor test
```

## Deploying

### Devnet
```bash
anchor deploy --provider.cluster devnet
```

### Mainnet
```bash
anchor deploy --provider.cluster mainnet
```

## Program ID

The program ID is configured in `Anchor.toml` and `programs/digitalpulse-tld/src/lib.rs`.

**Note**: Please provide the updated lib.rs file with correct wallet addresses and no promotional code.
