#!/bin/bash

# Digital Pulse TLD Deployment Script
# This script deploys the smart contract to Solana

set -e

echo "🚀 Digital Pulse TLD Deployment Script"
echo "========================================"

# Check for required tools
command -v anchor >/dev/null 2>&1 || { echo "❌ Anchor is not installed. Please install Anchor CLI first."; exit 1; }
command -v solana >/dev/null 2>&1 || { echo "❌ Solana CLI is not installed. Please install Solana CLI first."; exit 1; }

# Get cluster from argument or use devnet as default
CLUSTER=${1:-devnet}

echo ""
echo "📋 Configuration:"
echo "   Cluster: $CLUSTER"
echo "   Wallet: $(solana config get | grep "Keypair Path" | awk '{print $3}')"
echo ""

# Confirm wallet has SOL
BALANCE=$(solana balance --url $CLUSTER)
echo "💰 Wallet balance: $BALANCE"

if [ "$CLUSTER" = "mainnet" ]; then
    echo ""
    echo "⚠️  WARNING: You are about to deploy to MAINNET!"
    echo "   This will use real SOL tokens."
    read -p "   Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

echo ""
echo "🔨 Building program..."
anchor build

echo ""
echo "🚀 Deploying to $CLUSTER..."
anchor deploy --provider.cluster $CLUSTER

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Update the program ID in app.js and other frontend files"
echo "   2. Test the deployment with: anchor test --skip-build"
echo "   3. Verify the program at: https://explorer.solana.com/address/$(solana-keygen pubkey target/deploy/digitalpulse_tld-keypair.json)?cluster=$CLUSTER"
