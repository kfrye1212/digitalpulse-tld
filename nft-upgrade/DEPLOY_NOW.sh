#!/bin/bash

# DigitalPulse TLD NFT - One-Command Deployment Script
# This script deploys the NFT-enabled contract to Solana mainnet

set -e

echo "=========================================="
echo "DigitalPulse TLD NFT Deployment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AUTHORITY_WALLET="GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH"
TREASURY_WALLET="ETGuhexB39NqELD9RFkqtCELPsAB7KsNLFUbQxcLLzpe"

echo -e "${YELLOW}⚠️  IMPORTANT: This will deploy to MAINNET and cost ~3-5 SOL${NC}"
echo ""
echo "Authority Wallet: $AUTHORITY_WALLET"
echo "Treasury Wallet: $TREASURY_WALLET"
echo ""
read -p "Continue with deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Step 1: Checking prerequisites..."
echo "=========================================="

# Check Solana CLI
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi
echo -e "${GREEN}✅ Solana CLI found${NC}"

# Check Anchor
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found${NC}"
    echo "Install: cargo install --git https://github.com/coral-xyz/anchor --tag v0.28.0 anchor-cli"
    exit 1
fi
echo -e "${GREEN}✅ Anchor CLI found${NC}"

# Check wallet
WALLET_PATH="$HOME/.config/solana/id.json"
if [ ! -f "$WALLET_PATH" ]; then
    echo -e "${RED}❌ Wallet not found at $WALLET_PATH${NC}"
    echo "Please set up your Solana wallet first"
    exit 1
fi
echo -e "${GREEN}✅ Wallet found${NC}"

# Check balance
BALANCE=$(solana balance --url mainnet-beta | awk '{print $1}')
echo "Wallet balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 5" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Warning: Low balance. Deployment requires ~3-5 SOL${NC}"
    read -p "Continue anyway? (yes/no): " continue_low_balance
    if [ "$continue_low_balance" != "yes" ]; then
        exit 0
    fi
fi

echo ""
echo "Step 2: Building contract..."
echo "=========================================="

anchor build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

echo ""
echo "Step 3: Deploying to mainnet..."
echo "=========================================="

solana config set --url mainnet-beta

anchor deploy --provider.cluster mainnet

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"

# Get the program ID
PROGRAM_ID=$(solana address -k target/deploy/digitalpulse_tld-keypair.json)

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Program ID: $PROGRAM_ID"
echo ""
echo "⚠️  IMPORTANT: Save this Program ID!"
echo ""
echo "Next steps:"
echo "1. Update config.js with new Program ID"
echo "2. Run ./initialize_service.sh to set up the contract"
echo "3. Run ./create_tlds.sh to create the 4 TLDs"
echo "4. Test domain registration"
echo ""
echo "See DEPLOYMENT_COMPLETE.md for detailed next steps"
echo ""
