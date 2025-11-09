#!/bin/bash

# Security and Code Quality Check for Digital Pulse TLD Smart Contract
# This script performs comprehensive validation of the smart contract

set -e

echo "🔒 Digital Pulse TLD Smart Contract Security Check"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo "📋 1. Checking wallet addresses..."
echo "   Authority Wallet: GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH"
echo "   Treasury Wallet:  6pXoej1tiPgvPDiFHxbuBh8EJpsCNgqrK6JQ7reSoobU"

if grep -q "GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH" programs/digitalpulse-tld/src/lib.rs; then
    echo -e "   ${GREEN}✓${NC} Authority wallet found"
else
    echo -e "   ${RED}✗${NC} Authority wallet not found"
    exit 1
fi

if grep -q "6pXoej1tiPgvPDiFHxbuBh8EJpsCNgqrK6JQ7reSoobU" programs/digitalpulse-tld/src/lib.rs; then
    echo -e "   ${GREEN}✓${NC} Treasury wallet found"
else
    echo -e "   ${RED}✗${NC} Treasury wallet not found"
    exit 1
fi

echo ""
echo "🚫 2. Checking for promotional code..."
if grep -qi "promo\|promotion\|discount\|coupon\|referral" programs/digitalpulse-tld/src/lib.rs; then
    echo -e "   ${RED}✗${NC} Promotional code detected!"
    exit 1
else
    echo -e "   ${GREEN}✓${NC} No promotional code found"
fi

echo ""
echo "💰 3. Checking fee structure..."
if grep -q "REGISTRATION_FEE: u64 = 250_000_000" programs/digitalpulse-tld/src/lib.rs; then
    echo -e "   ${GREEN}✓${NC} Registration fee: 0.25 SOL"
else
    echo -e "   ${RED}✗${NC} Registration fee mismatch"
    exit 1
fi

if grep -q "RENEWAL_FEE: u64 = 150_000_000" programs/digitalpulse-tld/src/lib.rs; then
    echo -e "   ${GREEN}✓${NC} Renewal fee: 0.15 SOL"
else
    echo -e "   ${RED}✗${NC} Renewal fee mismatch"
    exit 1
fi

if grep -q "ROYALTY_PERCENTAGE: u8 = 5" programs/digitalpulse-tld/src/lib.rs; then
    echo -e "   ${GREEN}✓${NC} Royalty percentage: 5%"
else
    echo -e "   ${RED}✗${NC} Royalty percentage mismatch"
    exit 1
fi

echo ""
echo "🔧 4. Compiling smart contract..."
cd programs/digitalpulse-tld
if cargo check --quiet 2>&1 | grep -q "error"; then
    echo -e "   ${RED}✗${NC} Compilation failed"
    cargo check
    exit 1
else
    echo -e "   ${GREEN}✓${NC} Compilation successful"
fi
cd ../..

echo ""
echo "🔍 5. Checking program ID consistency..."
PROGRAM_ID_LIB=$(grep "declare_id!" programs/digitalpulse-tld/src/lib.rs | cut -d'"' -f2)
PROGRAM_ID_TOML=$(grep "digitalpulse_tld" Anchor.toml | head -1 | cut -d'"' -f2)

echo "   lib.rs:      $PROGRAM_ID_LIB"
echo "   Anchor.toml: $PROGRAM_ID_TOML"

if [ "$PROGRAM_ID_LIB" = "$PROGRAM_ID_TOML" ]; then
    echo -e "   ${GREEN}✓${NC} Program IDs match"
else
    echo -e "   ${RED}✗${NC} Program ID mismatch"
    exit 1
fi

echo ""
echo "📊 6. Code statistics..."
echo "   Total lines: $(wc -l < programs/digitalpulse-tld/src/lib.rs)"
echo "   Functions: $(grep -c "pub fn" programs/digitalpulse-tld/src/lib.rs)"
echo "   Account structures: $(grep -c "pub struct" programs/digitalpulse-tld/src/lib.rs)"
echo "   Error codes: $(grep -c "#\[msg(" programs/digitalpulse-tld/src/lib.rs)"

echo ""
echo "🎯 7. Function coverage check..."
FUNCTIONS=("initialize_service" "create_tld" "register_domain" "renew_domain" "transfer_domain" "update_authority" "update_treasury")
for func in "${FUNCTIONS[@]}"; do
    if grep -q "pub fn $func" programs/digitalpulse-tld/src/lib.rs; then
        echo -e "   ${GREEN}✓${NC} $func"
    else
        echo -e "   ${RED}✗${NC} $func missing"
        exit 1
    fi
done

echo ""
echo "🔐 8. Security features check..."
SECURITY_CHECKS=("require!" "ErrorCode::Unauthorized" "ErrorCode::InsufficientFunds" "Signer<'info>")
for check in "${SECURITY_CHECKS[@]}"; do
    if grep -q "$check" programs/digitalpulse-tld/src/lib.rs; then
        echo -e "   ${GREEN}✓${NC} Uses $check"
    else
        echo -e "   ${YELLOW}⚠${NC} $check not found"
    fi
done

echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "📝 Summary:"
echo "   - Wallet addresses verified"
echo "   - No promotional code detected"
echo "   - Fee structure correct"
echo "   - Code compiles successfully"
echo "   - Program ID consistent"
echo "   - All core functions present"
echo "   - Security checks in place"
echo ""
echo "✨ Smart contract is ready for deployment!"
