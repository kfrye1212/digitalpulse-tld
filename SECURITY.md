# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Digital Pulse TLD seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by:

1. **Email**: Send details to the repository owner
2. **GitHub Security Advisories**: Use the "Security" tab in this repository

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity and complexity

## Security Best Practices for Users

### Wallet Security

- Never share your private keys or seed phrases
- Use hardware wallets for large amounts
- Verify contract addresses before transactions
- Be cautious of phishing attempts

### Application Security

- Keep your browser and wallet extensions updated
- Only connect wallets to trusted sites
- Review transaction details before signing
- Clear browser cache if using public computers

## Known Security Considerations

This is a client-side application that interacts with Solana blockchain:

- All transactions are signed by your wallet
- No server-side storage of sensitive data
- localStorage is used for non-sensitive data only
- All blockchain interactions are transparent and verifiable

## Security Features

- Input sanitization to prevent XSS attacks
- No storage of private keys or sensitive data
- Client-side validation before blockchain transactions
- Secure wallet connection patterns

## Responsible Disclosure

We appreciate security researchers and users who report vulnerabilities responsibly. We commit to:

- Acknowledge your report within 48 hours
- Keep you informed of our progress
- Credit you in our security advisories (unless you prefer to remain anonymous)
- Work with you to understand and resolve the issue

Thank you for helping keep Digital Pulse TLD and our users safe!
