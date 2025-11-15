# DigitalPulse TLD - Deployment & Testing Guide

## Overview

This guide covers deploying the DigitalPulse TLD website with full Solana blockchain integration.

## Prerequisites

- Solana wallet (Phantom recommended)
- SOL tokens for testing transactions
- Modern web browser with wallet extension

## Deployment Options

### Option 1: GitHub Pages (Recommended)

The repository is already configured for GitHub Pages deployment.

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Save

2. **Access the site**:
   - URL: `https://kfrye1212.github.io/digitalpulse-tld/`
   - The site will auto-deploy on every push to main

### Option 2: Custom Domain (chainpulse.network)

1. **Update CNAME file** (already exists):
   ```
   chainpulse.network
   ```

2. **Configure DNS**:
   - Add A records pointing to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or add CNAME record: `kfrye1212.github.io`

3. **Enable HTTPS** in GitHub Pages settings

### Option 3: AWS/Google Cloud

1. **Build static files**:
   ```bash
   # All files are already static HTML/CSS/JS
   # No build step required
   ```

2. **Upload to S3 or Cloud Storage**:
   ```bash
   # Example for S3
   aws s3 sync . s3://your-bucket-name --exclude ".git/*"
   ```

3. **Configure CloudFront/CDN** for HTTPS

## Testing Locally

### Start Local Server

```bash
cd digitalpulse-tld
python3 -m http.server 8000
# or
npx serve
```

Access at: `http://localhost:8000`

### Testing Checklist

#### 1. Wallet Connection
- [ ] Phantom wallet detection works
- [ ] "Install Phantom" button appears if not installed
- [ ] "Connect Wallet" button appears if installed
- [ ] Wallet connects successfully
- [ ] Wallet address displays correctly
- [ ] Balance loads correctly

#### 2. Domain Search
- [ ] Search input accepts valid domain names
- [ ] Invalid characters are rejected
- [ ] Search queries blockchain for availability
- [ ] Results show correct availability status
- [ ] Registered domains show owner info
- [ ] Available domains show "Register" button

#### 3. Domain Registration
- [ ] Registration requires connected wallet
- [ ] Insufficient balance is detected
- [ ] Confirmation dialog shows correct info
- [ ] Transaction is sent to blockchain
- [ ] Loading indicator appears
- [ ] Success notification appears
- [ ] Domain status updates after registration
- [ ] Balance updates after transaction

#### 4. Security Features
- [ ] XSS protection (HTML escaping works)
- [ ] Input validation prevents invalid domains
- [ ] Error messages are user-friendly
- [ ] Transaction errors are handled gracefully

## Contract Verification

### Verify on Solana Explorer

The contract is deployed but not yet verified. To verify:

1. **Build the contract**:
   ```bash
   cd contract
   anchor build
   ```

2. **Verify on Solana Explorer**:
   ```bash
   solana-verify verify-from-repo \
     --program-id 2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ \
     --commit-hash <git-commit-hash> \
     https://github.com/kfrye1212/digitalpulse-tld
   ```

### Add Security.txt

```bash
# Install the tool
npm install -g @solana-program/program-metadata

# Add security.txt
npx @solana-program/program-metadata write security \
  2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ \
  ./security.json
```

## Configuration

### Network Settings

Edit `config.js` to change network or RPC endpoint:

```javascript
const SOLANA_NETWORK = 'mainnet-beta'; // or 'devnet' for testing
const RPC_ENDPOINT = 'https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY';
```

### Contract Settings

Current mainnet deployment:
- **Program ID**: `2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ`
- **Treasury**: `ETGuhexB39NqELD9RFkqtCELPsAB7KsNLFUbQxcLLzpe`
- **Authority**: `GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH`

## Monitoring

### Transaction Monitoring

View all contract transactions:
https://explorer.solana.com/address/2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ

### Treasury Balance

Check treasury wallet:
https://explorer.solana.com/address/ETGuhexB39NqELD9RFkqtCELPsAB7KsNLFUbQxcLLzpe

## Troubleshooting

### Wallet Won't Connect

1. Check if Phantom is installed
2. Refresh the page
3. Try disconnecting and reconnecting
4. Check browser console for errors

### Transactions Failing

1. Check wallet balance (need > 0.25 SOL)
2. Check network status
3. Verify RPC endpoint is working
4. Check Solana Explorer for network issues

### Domain Search Not Working

1. Check browser console for errors
2. Verify RPC endpoint is accessible
3. Check if scripts loaded correctly
4. Try refreshing the page

### Script Loading Errors

If you see 404 errors for scripts:
1. Verify all files are deployed
2. Check file paths in index.html
3. Clear browser cache
4. Check CDN availability

## Performance Optimization

### CDN Configuration

Add SRI (Subresource Integrity) hashes to script tags:

```html
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### Caching

Configure cache headers:
- HTML: no-cache
- CSS/JS: max-age=31536000 (1 year)
- Images: max-age=31536000

## Security Checklist

- [x] XSS protection implemented
- [x] Input validation on all user inputs
- [x] HTML escaping for all dynamic content
- [x] Error handling for all transactions
- [ ] SRI hashes for CDN scripts (recommended)
- [ ] CSP headers (recommended)
- [ ] Contract verified on Solana Explorer
- [ ] Security.txt added to contract

## Next Steps

1. **Deploy to GitHub Pages** or custom domain
2. **Verify the contract** on Solana Explorer
3. **Add security.txt** to the contract
4. **Test all functionality** with real wallet
5. **Monitor transactions** and user feedback
6. **Implement marketplace** and my-domains pages
7. **Add analytics** for usage tracking

## Support

For issues or questions:
- GitHub Issues: https://github.com/kfrye1212/digitalpulse-tld/issues
- Security: See SECURITY.md
- Documentation: See README.md

## License

This is a production deployment on Solana mainnet. All rights reserved.
