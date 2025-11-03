# Digital Pulse TLD - Static TLD dApp

Decentralized domain registration on Solana blockchain for .pulse, .verse, .cp, and .pv domains.

## Features

- Domain search and registration
- Marketplace for buying/selling domains (5% marketplace fee)
- Domain management (renewal, transfer, listing)
- Phantom wallet integration
- NFT-based domain ownership

## Testing

This project includes comprehensive unit tests that can be run locally.

### Setup Tests

Install test dependencies:

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes 78 tests covering:
- TLD selection and validation
- Domain search functionality
- Price and fee calculations (0.25 SOL registration, 5% marketplace fee)
- Marketplace filtering and sorting
- Domain expiry calculations
- Wallet address validation
- User input validation
- Display state management

See [tests/README.md](tests/README.md) for detailed testing documentation.

## Project Structure

- `index.html` - Main search page
- `marketplace.html` - Marketplace for domain trading
- `my-domains.html` - User domain management
- `app.js` - Search and registration logic
- `marketplace.js` - Marketplace functionality
- `my-domains.js` - Domain management logic
- `styles.css` - Application styling
- `tests/` - Test files for all JavaScript modules

