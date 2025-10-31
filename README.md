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

### Option 1: GitHub Pages (FREE)

1. Create a new GitHub repository
2. Push these files to the repository
3. Go to Settings → Pages
4. Select "main" branch as source
5. Your site will be live at `https://yourusername.github.io/repo-name/`

**DNS Setup for chainpulse.network:**
```
Type: CNAME
Name: www
Value: yourusername.github.io
TTL: 600
```

### Option 2: Vercel (FREE)

1. Push files to GitHub
2. Import repository to Vercel
3. Deploy automatically
4. Add custom domain in Vercel settings

### Option 3: Netlify (FREE)

1. Drag and drop the folder to Netlify
2. Or connect GitHub repository
3. Add custom domain in settings

## 🔗 Custom Domain Setup

### For chainpulse.network:

**In GoDaddy (or your DNS provider):**

1. Add CNAME record:
   - Name: `www`
   - Value: `your-deployment-url` (from GitHub Pages/Vercel/Netlify)
   - TTL: 600

2. Add URL redirect (optional):
   - Redirect `chainpulse.network` → `www.chainpulse.network`

**Wait 5-30 minutes for DNS propagation**

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

