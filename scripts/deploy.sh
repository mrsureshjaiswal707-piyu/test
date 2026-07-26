#!/bin/bash
set -e

echo "============================================"
echo "  EscrowChain - Contract Deployment Script"
echo "============================================"
echo ""

# Config
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
CONTRACT_DIR="../contract"
WASM_PATH="$CONTRACT_DIR/target/wasm32v1-none/release/contract.wasm"
SOURCE_ACCOUNT="dev"

echo "Step 1: Build the contract"
cd "$CONTRACT_DIR"
stellar contract build
echo "  Build complete: $WASM_PATH"
echo ""

echo "Step 2: Generate/verify deployer key"
if ! stellar keys address "$SOURCE_ACCOUNT" >/dev/null 2>&1; then
  echo "  Creating and funding account: $SOURCE_ACCOUNT"
  stellar keys generate "$SOURCE_ACCOUNT" --network testnet --fund
else
  echo "  Account $SOURCE_ACCOUNT already exists"
  echo "  Public key: $(stellar keys address "$SOURCE_ACCOUNT")"
fi
echo ""

echo "Step 3: Deploy contract to testnet"
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account "$SOURCE_ACCOUNT" \
  --network testnet \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$PASSPHRASE" 2>&1)

# Trim whitespace
CONTRACT_ID=$(echo "$CONTRACT_ID" | tr -d '[:space:]')

echo "  Contract deployed!"
echo "  Contract ID: $CONTRACT_ID"
echo ""

echo "Step 4: Write contract address to .env"
ENV_FILE="../client/.env.local"
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID" > "$ENV_FILE"
echo "  Written to: $ENV_FILE"
echo ""

echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "Contract Address: $CONTRACT_ID"
echo ""
echo "Next steps:"
echo "  1. cd ../client && bun install"
echo "  2. bun run dev"
echo "  3. Open http://localhost:3000"
echo ""
echo "To verify on Stellar Explorer:"
echo "  https://stellar.expert/testnet/contract/$CONTRACT_ID"
echo ""
