# Testing Guide

This project includes comprehensive unit tests for all JavaScript modules.

## Setup

First, install the test dependencies:

```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Files

- `tests/app.test.js` - Tests for main domain search functionality (app.js)
- `tests/marketplace.test.js` - Tests for marketplace features (marketplace.js)
- `tests/my-domains.test.js` - Tests for domain management features (my-domains.js)

## Test Coverage

The tests cover:
- TLD selection and validation
- Domain search functionality
- Price calculations
- Marketplace fee calculations (5% fee)
- Domain filtering and sorting
- Wallet address validation and formatting
- Date formatting
- Domain expiry calculations
- Stats calculations
- User input validation
- Display state management

## Technologies

- **Jest** - Testing framework
- **jsdom** - DOM environment for testing browser code

## Notes

The tests focus on unit testing the business logic and utility functions. They validate:
- Correct fee calculations
- Data filtering and sorting
- Input validation
- State management logic
- Display conditions

These tests can be run locally without needing a blockchain connection or browser wallet.
