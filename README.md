# Digital Pulse TLD dApp

Web3 domain registration platform for .pulse, .verse, .cp, and .pv domains on Solana blockchain.

## 🎨 Features

- **Domain Search & Registration** - Instant search and registration for Web3 domains
- **My Domains Dashboard** - Manage your domain portfolio
- **Marketplace** - Buy and sell premium domains
- **Wallet Integration** - Phantom wallet support
- **Cyberpunk Design** - Modern neon aesthetic with cyan-magenta gradients

## 📁 Files Included

```
digitalpulse-tld/
├── index.html           # Main search/registration page
├── my-domains.html      # Domain management dashboard
├── marketplace.html     # Domain marketplace
├── styles.css           # Global styles
├── app.js               # Main JavaScript (wallet, search, registration)
├── my-domains.js        # My Domains page logic
├── marketplace.js       # Marketplace page logic
└── README.md            # This file
```

## 🚀 Deployment Options

### Option 1: GitHub Pages (FREE) - RECOMMENDED

This repository is configured with GitHub Actions for automatic deployment to GitHub Pages.

**Automatic Deployment:**
1. The site is automatically deployed when you push to the `main` branch
2. GitHub Actions workflow (`.github/workflows/pages.yml`) handles the deployment
3. No manual configuration needed - it's already set up!

**Enable GitHub Pages (One-time setup):**
1. Go to your repository Settings → Pages
2. Under "Build and deployment":
   - Source: Select "GitHub Actions"
3. Your site will be live at `https://kfrye1212.github.io/digitalpulse-tld/`

**Custom Domain Setup (chainpulse.network):**

The repository includes a `CNAME` file configured for `chainpulse.network`.

To activate the custom domain:
1. In your GitHub repository: Settings → Pages → Custom domain
2. Enter: `chainpulse.network`
3. Click "Save"
4. Wait for DNS check to complete

**DNS Configuration at your domain provider:**
```
Type: A Records (for apex domain)
Name: @
Values: 
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
TTL: 600

Type: CNAME (for www subdomain)
Name: www
Value: kfrye1212.github.io
TTL: 600
```

**Alternative: Use www subdomain only**
```
Type: CNAME
Name: @
Value: kfrye1212.github.io
TTL: 600
```

### Option 2: Vercel (Alternative)

1. Push files to GitHub
2. Import repository to Vercel
3. Deploy automatically
4. Add custom domain in Vercel settings

### Option 3: Netlify (Alternative)

1. Drag and drop the folder to Netlify
2. Or connect GitHub repository
3. Add custom domain in settings

## 🔗 Custom Domain Verification

After DNS setup, verify your configuration:
1. Visit https://www.whatsmydns.net/
2. Enter your domain name
3. Check A or CNAME records globally
4. Wait 5-30 minutes for full DNS propagation
5. Enable "Enforce HTTPS" in GitHub Pages settings (recommended)

**Troubleshooting:**
- Clear your browser cache if the site doesn't load
- Verify DNS records are pointing to the correct values
- Check GitHub Pages build status in Actions tab
- Ensure CNAME file contains only the domain name (no http:// or trailing slash)

## ⚙️ Configuration

### Update Links to PULSE Landing Page

The site links to `https://chainpulse.info` for the PULSE token landing page.

Once your landing page is live, verify these links in:
- `index.html` (navigation and footer)
- `my-domains.html` (navigation and footer)
- `marketplace.html` (navigation and footer)

### Connect to Solana Smart Contract

**Currently in Preview Mode** - The site uses demo data and simulated transactions.

**When your smart contract is deployed to Solana mainnet:**

1. Install dependencies:
```bash
npm install @solana/web3.js @project-serum/anchor
```

2. Update `app.js` with your program ID:
```javascript
const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
```

3. Replace demo functions with actual blockchain calls:
   - `searchDomain()` - Query domain availability
   - `registerDomain()` - Execute registration transaction
   - `renewDomain()` - Execute renewal transaction
   - `transferDomain()` - Execute transfer transaction
   - `listForSale()` - Create marketplace listing
   - `completePurchase()` - Execute purchase transaction

## 💰 Pricing

- **Registration:** 0.25 SOL
- **Renewal:** 0.15 SOL/year
- **Marketplace Royalty:** 5%

## 🎯 Supported TLDs

- `.pulse` - Core PULSE ecosystem
- `.verse` - Metaverse ready
- `.cp` - Cyberpunk style
- `.pv` - Premium choice

## 🔐 Security Notes

- Never commit private keys or sensitive data
- Always verify transactions before signing
- Use environment variables for configuration
- Validate all user inputs

## 📱 Browser Support

- Chrome/Brave (recommended for Phantom wallet)
- Firefox
- Safari
- Edge

## 🆘 Support

For issues or questions:
- Check Phantom wallet is installed and connected
- Ensure you're on Solana mainnet
- Verify custom domain DNS settings
- Contact PULSE team for smart contract questions

## 📄 License

Part of the PULSE ecosystem. All rights reserved.

---

**Built with ❤️ for the PULSE community**

**Note:** This is a preview version. Smart contract integration will be added when deployed to Solana mainnet.

