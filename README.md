# Digital Pulse TLD

[![Pages Build and Deployment](https://github.com/kfrye1212/digitalpulse-tld/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/kfrye1212/digitalpulse-tld/actions/workflows/pages/pages-build-deployment)

A decentralized top-level domain (TLD) registration platform built on the Solana blockchain. Register, manage, and trade custom domain names as NFTs.

## Features

- 🔍 **Domain Search**: Check availability of domains across multiple TLDs
- 💼 **My Domains**: Manage your registered domains with renewal, transfer, and listing capabilities
- 🏪 **Marketplace**: Buy and sell domains with built-in marketplace functionality
- 🔐 **Wallet Integration**: Seamless connection with Solana wallets (Phantom, Solflare, etc.)
- ⛓️ **Blockchain-Based**: All domains are NFTs on the Solana blockchain

## Getting Started

### Prerequisites

- A Solana wallet (Phantom, Solflare, or compatible wallet extension)
- SOL tokens for transactions

### Using the Application

1. Visit the live site: [https://kfrye1212.github.io/digitalpulse-tld/](https://kfrye1212.github.io/digitalpulse-tld/)
2. Connect your Solana wallet
3. Search for and register available domains
4. Manage your domains or browse the marketplace

### Local Development

```bash
# Clone the repository
git clone https://github.com/kfrye1212/digitalpulse-tld.git
cd digitalpulse-tld

# Open in browser or start a local server
python -m http.server 8000
# or
npx serve
```

Then navigate to `http://localhost:8000`

## Available TLDs

- .pulse
- .verse
- .cp
- .pv

## Documentation

- [Contributing Guidelines](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Security Findings](.github/SECURITY_FINDINGS.md)
- [PR & Issue Management](.github/PR_ISSUE_MANAGEMENT.md)
- [Workflows Documentation](.github/WORKFLOWS.md)
- [Issue Templates](.github/ISSUE_TEMPLATE/)
- [PR Template](.github/pull_request_template.md)

## GitHub Actions

This repository uses GitHub Actions for:

- **Pages Deployment**: Automatic deployment to GitHub Pages on push to main branch
- **Copilot Coding Agent**: Automated code improvements and issue resolution

For detailed information about workflows, see [Workflows Documentation](.github/WORKFLOWS.md).

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to:

- Report bugs
- Suggest features
- Submit pull requests
- Follow coding standards

## Security

Security is a top priority. Please review our [Security Policy](SECURITY.md) for:

- Reporting vulnerabilities
- Security best practices
- Known security considerations

## Open Pull Requests

Currently open PRs addressing various improvements:

- PR #6: Code refactoring for performance optimization
- PR #5: Persistent localStorage-backed state
- PR #4: Local test suite implementation
- PR #3: Performance improvements

## License

This project is a Web3 domain registration platform on Solana.

## Support

- 📧 Open an issue for bug reports or feature requests
- 💬 Use the provided issue templates for structured feedback
- 🔒 Report security issues responsibly (see SECURITY.md)

## Acknowledgments

Built with modern web technologies and Solana blockchain integration.
