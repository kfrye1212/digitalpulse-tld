# DigitalPulse TLD NFT - Complete Deployment Guide

## 🚀 Deploy in 15 Minutes

This guide will help you deploy the NFT-enabled smart contract to Solana mainnet.

---

## Prerequisites

Before starting, ensure you have:

1. **Solana CLI installed**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Anchor CLI installed (v0.28.0)**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor --tag v0.28.0 anchor-cli
   ```

3. **Your wallet configured**
   ```bash
   # If you don't have a wallet yet:
   solana-keygen new

   # Or import your existing wallet:
   # Place your wallet JSON at ~/.config/solana/id.json
   ```

4. **At least 5 SOL in your wallet**
   ```bash
   solana balance --url mainnet-beta
   ```

---

## 🎯 One-Command Deployment

### Option 1: Automated Deployment (Recommended)

```bash
cd /path/to/digitalpulse-tld-nft
./DEPLOY_NOW.sh
```

This script will:
- ✅ Check all prerequisites
- ✅ Build the contract
- ✅ Deploy to mainnet
- ✅ Show you the new Program ID

**That's it!** The script handles everything.

---

### Option 2: Manual Step-by-Step

If you prefer to run commands manually:

#### Step 1: Build the Contract

```bash
cd /path/to/digitalpulse-tld-nft
anchor build
```

#### Step 2: Deploy to Mainnet

```bash
solana config set --url mainnet-beta
anchor deploy --provider.cluster mainnet
```

#### Step 3: Get the Program ID

```bash
solana address -k target/deploy/digitalpulse_tld-keypair.json
```

**Save this Program ID!** You'll need it for the next steps.

---

## 📋 After Deployment

Once deployed, you need to initialize the contract:

### Step 1: Update Frontend Configuration

Edit `config.js` in your website:

```javascript
// OLD Program ID (no NFT support)
// const PROGRAM_ID = '2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ';

// NEW Program ID (with NFT support)
const PROGRAM_ID = 'YOUR_NEW_PROGRAM_ID_HERE';  // From deployment
```

### Step 2: Initialize the Service

The service PDA must be initialized before use:

```bash
# Using Anchor (recommended)
anchor run initialize --provider.cluster mainnet

# Or manually with Solana CLI
solana program invoke \
  --program-id YOUR_PROGRAM_ID \
  --keypair ~/.config/solana/id.json \
  --url mainnet-beta \
  initialize_service
```

### Step 3: Create the 4 TLDs

Create .pulse, .verse, .cp, and .pv TLDs:

```bash
# Run the TLD creation script
./create_tlds.sh

# Or manually for each TLD:
anchor run create-tld -- --name pulse --price 250000000
anchor run create-tld -- --name verse --price 250000000
anchor run create-tld -- --name cp --price 250000000
anchor run create-tld -- --name pv --price 250000000
```

### Step 4: Test Domain Registration

Register a test domain to verify everything works:

```bash
# Connect with your authority wallet
# Visit your website
# Register a domain
# It should be FREE for authority wallet
# You should receive an NFT in your wallet
```

---

## 💰 Cost Breakdown

| Item | Estimated Cost |
|------|----------------|
| Program Deployment | 3-5 SOL |
| Service Initialization | 0.002 SOL |
| TLD Creation (×4) | 0.008 SOL |
| **TOTAL** | **~3-5 SOL** |

**Note:** Actual cost depends on program size and current network fees.

---

## ✅ Verification Checklist

After deployment, verify everything is working:

- [ ] Contract deployed successfully
- [ ] Program ID saved
- [ ] Service PDA initialized
- [ ] All 4 TLDs created (.pulse, .verse, .cp, .pv)
- [ ] Frontend updated with new Program ID
- [ ] Test domain registered as NFT
- [ ] NFT appears in Phantom wallet
- [ ] Metadata is correct
- [ ] Authority wallet gets free registration
- [ ] Regular users pay 0.25 SOL

---

## 🔧 Troubleshooting

### Build Fails

**Error:** "anchor: command not found"
```bash
# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.28.0 anchor-cli
```

**Error:** "failed to compile"
```bash
# Update Rust
rustup update

# Clean and rebuild
anchor clean
anchor build
```

### Deployment Fails

**Error:** "Insufficient funds"
```bash
# Check balance
solana balance --url mainnet-beta

# You need at least 5 SOL
```

**Error:** "Transaction simulation failed"
```bash
# Try with more compute units
anchor deploy --provider.cluster mainnet -- --max-sign-off-compute-units 1400000
```

### Initialization Fails

**Error:** "Account already initialized"
```bash
# The service is already initialized
# Skip to TLD creation
```

**Error:** "Invalid authority"
```bash
# Make sure you're using the authority wallet
solana address
# Should match: GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. **Deployment completes** without errors
2. **You get a Program ID** (starts with a letter/number, 44 characters)
3. **Service initializes** successfully
4. **TLDs are created** (you can query them on Solana Explorer)
5. **Test domain registers** and you receive an NFT
6. **NFT shows in wallet** (Phantom, Solflare, etc.)
7. **Metadata loads** correctly

---

## 📞 Need Help?

If you encounter issues:

1. **Check the logs** - Anchor provides detailed error messages
2. **Verify prerequisites** - Ensure Solana CLI and Anchor are installed
3. **Check balance** - Make sure you have enough SOL
4. **Review transaction** - Use Solana Explorer to see what failed
5. **Ask for help** - security@chainpulse.network

---

## 🚀 Quick Start Summary

**For the impatient:**

```bash
# 1. Navigate to project
cd /path/to/digitalpulse-tld-nft

# 2. Run deployment script
./DEPLOY_NOW.sh

# 3. Save the Program ID it gives you

# 4. Update config.js with new Program ID

# 5. Initialize service
anchor run initialize --provider.cluster mainnet

# 6. Create TLDs
./create_tlds.sh

# 7. Test on your website

# Done! 🎉
```

---

## 📄 Next Steps

After successful deployment:

1. **Update frontend** - Use new Program ID
2. **Test thoroughly** - Register test domains
3. **Create metadata** - JSON files for NFTs
4. **Generate images** - Domain NFT visuals
5. **Launch marketing** - Announce NFT support
6. **Monitor** - Watch for issues

---

## 🔒 Security Notes

**Important:**
- Never share your wallet private key
- Keep the program keypair secure
- Consider using a hardware wallet for authority
- Move treasury to cold storage when ready
- Regularly backup your wallet

**After Deployment:**
- Verify the contract on Solana Explorer
- Run the verification script
- Test with small amounts first
- Monitor for unusual activity

---

## 📊 What You Get

After deployment, your domains will:

- ✅ Be minted as NFTs automatically
- ✅ Show in NFT wallets (Phantom, Solflare)
- ✅ Be tradable on marketplaces (Magic Eden, Tensor)
- ✅ Have 5% royalty enforced automatically
- ✅ Include full Metaplex metadata
- ✅ Support all standard NFT features

---

**Ready to deploy? Run `./DEPLOY_NOW.sh` and let's go! 🚀**
