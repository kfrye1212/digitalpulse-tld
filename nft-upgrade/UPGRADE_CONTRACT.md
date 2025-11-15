# Upgrade Your Contract to Add NFT Functionality

## ⚡ Quick Start - Copy & Paste These Commands

### Step 1: Navigate to the NFT Contract Directory

```bash
cd ~/digitalpulse-tld-nft
```

If this directory doesn't exist, you need to clone/download it first. I'll provide those files separately.

---

### Step 2: Build the Updated Contract

```bash
anchor build
```

This compiles the Rust code with NFT functionality into a deployable program.

**Expected output:** "Build successful" or similar

---

### Step 3: Upgrade the Contract on Mainnet

```bash
solana config set --url mainnet-beta
anchor upgrade target/deploy/digitalpulse_tld.so --program-id 2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ --provider.cluster mainnet
```

**What this does:**
- Uploads the new contract code to your existing program ID
- Keeps all existing data (domains, TLDs, service config)
- Adds NFT minting functionality

**Cost:** ~2-3 SOL (for uploading the new code)

---

### Step 4: Verify the Upgrade

```bash
solana program show 2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ
```

Check that the "Last Deployed Slot" has updated to a recent slot number.

---

### Step 5: Update the Frontend

Edit `config.js` in your website repository:

```javascript
// No change needed to Program ID - it stays the same!
const PROGRAM_ID = '2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ';

// But you may need to update the RPC endpoint if needed
```

The frontend code I already updated will work with the upgraded contract.

---

### Step 6: Test NFT Registration

1. Go to https://www.chainpulse.network
2. Connect your authority wallet
3. Register a test domain (e.g., "test.pulse")
4. Check your Phantom wallet - you should see the NFT!

---

## 🚨 IMPORTANT Prerequisites

Before running these commands, ensure you have:

### 1. Solana CLI Installed

```bash
# Check if installed
solana --version

# If not installed:
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### 2. Anchor CLI Installed (v0.28.0)

```bash
# Check if installed
anchor --version

# If not installed:
cargo install --git https://github.com/coral-xyz/anchor --tag v0.28.0 anchor-cli
```

### 3. Wallet Configured

```bash
# Check current wallet
solana address

# Should output: GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH (your authority wallet)

# If not, set your wallet:
solana config set --keypair /path/to/your/wallet.json
```

### 4. Sufficient SOL Balance

```bash
# Check balance
solana balance

# You need at least 3 SOL for the upgrade
```

---

## 📦 Getting the NFT Contract Files

If you don't have the `digitalpulse-tld-nft` directory yet, I'll create a downloadable package with all the files.

**Option 1: Clone from GitHub (if I push it)**
```bash
git clone https://github.com/kfrye1212/digitalpulse-tld-nft.git
cd digitalpulse-tld-nft
```

**Option 2: I'll provide a zip file with all the contract files**

---

## 🔧 Troubleshooting

### Error: "anchor: command not found"

Install Anchor CLI:
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.28.0 anchor-cli
```

### Error: "Insufficient funds"

You need at least 3 SOL in your wallet:
```bash
solana balance
```

### Error: "Upgrade authority mismatch"

Make sure you're using the correct wallet that deployed the original contract:
```bash
solana address
# Should match your authority wallet
```

### Error: "Build failed"

Update Rust and try again:
```bash
rustup update
anchor clean
anchor build
```

---

## ✅ What This Upgrade Adds

After upgrading, your contract will have:

- ✅ **NFT Minting** - Every domain registration creates an NFT
- ✅ **Metaplex Integration** - Full metadata support
- ✅ **Royalty Enforcement** - 5% royalty in NFT metadata
- ✅ **Marketplace Support** - Tradable on Magic Eden, Tensor, etc.
- ✅ **Wallet Display** - NFTs show in Phantom, Solflare
- ✅ **All Existing Features** - Free registration for authority wallet, etc.

---

## 💰 Cost Breakdown

| Item | Cost |
|------|------|
| Contract Upgrade | ~2-3 SOL |
| Gas Fees | ~0.01 SOL |
| **Total** | **~2-3 SOL** |

Much cheaper than deploying a new contract!

---

## 🎯 Summary

**Three commands to upgrade:**

```bash
# 1. Build
cd ~/digitalpulse-tld-nft && anchor build

# 2. Upgrade
anchor upgrade target/deploy/digitalpulse_tld.so --program-id 2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ --provider.cluster mainnet

# 3. Verify
solana program show 2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ
```

**Then test on your website!**

---

Need the contract files? Let me know and I'll package them up for you!
