#!/bin/bash

# DigitalPulse TLD Contract Verification Script
# This script helps verify the deployed contract matches the source code

set -e

echo "=========================================="
echo "DigitalPulse TLD Contract Verification"
echo "=========================================="
echo ""

# Configuration
PROGRAM_ID="2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ"
NETWORK="mainnet-beta"
CONTRACT_DIR="/home/ubuntu/digitalpulse-tld/contract"

echo "Program ID: $PROGRAM_ID"
echo "Network: $NETWORK"
echo "Contract Directory: $CONTRACT_DIR"
echo ""

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first."
    echo "   Visit: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

echo "✅ Solana CLI found"

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install it first."
    echo "   Visit: https://www.anchor-lang.com/docs/installation"
    exit 1
fi

echo "✅ Anchor CLI found"
echo ""

# Set network
echo "Setting network to $NETWORK..."
solana config set --url $NETWORK

# Get program info
echo ""
echo "Fetching program information..."
solana program show $PROGRAM_ID

# Get program account data
echo ""
echo "Program account details:"
solana account $PROGRAM_ID

# Check if source code exists
if [ ! -f "$CONTRACT_DIR/src/lib.rs" ]; then
    echo ""
    echo "❌ Source code not found at $CONTRACT_DIR/src/lib.rs"
    exit 1
fi

echo ""
echo "✅ Source code found"

# Build the contract
echo ""
echo "Building contract from source..."
cd $CONTRACT_DIR
anchor build

# Get the build hash
BUILD_HASH=$(sha256sum target/deploy/digitalpulse_tld.so | awk '{print $1}')
echo ""
echo "Build hash: $BUILD_HASH"

# Download deployed program
echo ""
echo "Downloading deployed program..."
solana program dump $PROGRAM_ID deployed_program.so

# Get deployed hash
DEPLOYED_HASH=$(sha256sum deployed_program.so | awk '{print $1}')
echo "Deployed hash: $DEPLOYED_HASH"

# Compare hashes
echo ""
echo "=========================================="
if [ "$BUILD_HASH" == "$DEPLOYED_HASH" ]; then
    echo "✅ VERIFICATION SUCCESSFUL!"
    echo "   The deployed program matches the source code."
else
    echo "⚠️  HASHES DO NOT MATCH"
    echo "   This could mean:"
    echo "   1. The source code has been updated since deployment"
    echo "   2. The build environment is different"
    echo "   3. The Anchor version is different"
    echo ""
    echo "   Build hash:    $BUILD_HASH"
    echo "   Deployed hash: $DEPLOYED_HASH"
fi
echo "=========================================="

# Clean up
rm -f deployed_program.so

echo ""
echo "Verification complete!"
echo ""
echo "To verify manually:"
echo "1. Clone the repository: git clone https://github.com/kfrye1212/digitalpulse-tld"
echo "2. Navigate to contract: cd digitalpulse-tld/contract"
echo "3. Build: anchor build"
echo "4. Compare: solana program dump $PROGRAM_ID deployed.so && sha256sum target/deploy/digitalpulse_tld.so deployed.so"
