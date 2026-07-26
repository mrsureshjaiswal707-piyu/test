# EscrowChain — Soroban Escrow on Delivery

A decentralized escrow platform built on Stellar Soroban. Buyers lock funds into a smart contract, sellers confirm shipment with a tracking hash, and funds release automatically when the buyer confirms receipt.

## Features

- **Smart Contract Escrow** — Funds held in a Soroban smart contract on Stellar Testnet
- **Multi-Wallet Support** — Connect via Freighter, LOBSTR, xBull, Albedo, and more via StellarWalletsKit
- **Full Escrow Lifecycle** — Create, Ship, Deliver, Dispute
- **Transaction Tracking** — Real-time pending/success/failed status for every transaction
- **Event System** — Live activity feed of all contract interactions
- **Dark Mode** — Full dark mode support via shadcn/ui
- **Responsive** — Mobile-first design that works on all devices
- **Type-Safe** — Full TypeScript with typed contract interactions

## Tech Stack

| Technology | Purpose |
|---|---|
| **Soroban SDK v25** | Smart contract (Rust) |
| **Next.js 16** | Frontend framework (App Router) |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui** | UI component library |
| **@creit.tech/stellar-wallets-kit** | Multi-wallet integration |
| **@stellar/stellar-sdk** | Stellar JavaScript SDK |
| **@tanstack/react-query** | Server state management |
| **Zustand** | Client state management |
| **sonner** | Toast notifications |
| **Lucide React** | Icons |

## Setup Instructions

### Prerequisites

- [Rust](https://rustup.rs/) (for smart contract)
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) (`cargo install --locked stellar-cli`)
- [Bun](https://bun.sh/) (for frontend)
- A Stellar wallet extension (Freighter recommended)

### 1. Clone & Install

```bash
# Clone the repo
git clone <repo-url>
cd escrow-chain

# Install contract dependencies
cd contract
cargo install --locked stellar-cli --features opt

# Install client dependencies
cd ../client
bun install
```

### 2. Deploy Smart Contract

```bash
# From the project root
cd scripts
bash deploy.sh
```

This will:
1. Build the Soroban contract to WASM
2. Generate a deployer key (or use existing)
3. Deploy to Stellar Testnet
4. Write the contract address to `client/.env.local`

### 3. Run Development Server

```bash
cd client
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `client/.env.local`:

```bash
# Contract address (set by deploy script or manually)
NEXT_PUBLIC_CONTRACT_ADDRESS=C...
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed Soroban contract address | `CONTRACT_ADDRESS_HERE` |

## Wallet Setup

1. Install [Freighter](https://freighter.app/) browser extension (Chrome/Firefox)
2. Create or import a Stellar account
3. Switch to **Testnet** in Freighter settings
4. Fund your account via [Friendbot](https://friendbot.stellar.org/)
5. Click "Connect Wallet" in the app

## Contract Deployment

### Manual Deployment

```bash
cd contract

# Build
stellar contract build

# Generate key
stellar keys generate dev --network testnet --fund

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/contract.wasm \
  --source-account dev \
  --network testnet

# Copy the contract address (C...) and set in .env.local
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=<your-contract-id>" > ../client/.env.local
```

### Contract Functions

| Function | Auth | Description |
|---|---|---|
| `create_escrow(buyer, seller, amount, token, description)` | Buyer | Locks funds into escrow |
| `confirm_shipment(escrow_id, shipment_hash)` | Seller | Confirms shipment with tracking hash |
| `confirm_receipt(escrow_id)` | Buyer | Confirms receipt, releases funds |
| `raise_dispute(escrow_id, caller)` | Buyer/Seller | Raises a dispute |
| `get_escrow(escrow_id)` | None | Returns escrow details |

## Running Locally

```bash
# Start the development server
cd client
bun run dev

# Run contract tests
cd ../contract
cargo test
```

## Deployment

### Vercel

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Set environment variable:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = your deployed contract address
5. Deploy

### Manual Build

```bash
cd client
bun run build    # Build for production
bun run start    # Start production server
```

## Project Structure

```
escrow-chain/
├── contract/                    # Soroban smart contract
│   ├── Cargo.toml              # Workspace (soroban-sdk v25)
│   └── contracts/contract/
│       └── src/
│           ├── lib.rs          # Contract implementation (~85 lines)
│           └── test.rs         # 10 passing tests
├── client/                      # Next.js frontend
│   └── src/
│       ├── app/                # Pages (App Router)
│       │   ├── layout.tsx      # Root layout + providers
│       │   ├── page.tsx        # Home page
│       │   ├── dashboard/      # Wallet dashboard
│       │   ├── escrow/         # Create & manage escrows
│       │   ├── activity/       # Real-time event feed
│       │   └── transactions/   # Transaction history
│       ├── components/         # React components
│       │   ├── Navbar.tsx      # Navigation bar
│       │   ├── EscrowCard.tsx  # Escrow display card
│       │   ├── EscrowForm.tsx  # Create escrow form
│       │   ├── EventCard.tsx   # Event display card
│       │   ├── EventFeed.tsx   # Event feed list
│       │   ├── TransactionTracker.tsx
│       │   ├── ShipmentHashDialog.tsx
│       │   ├── EscrowStatusBadge.tsx
│       │   ├── EmptyState.tsx
│       │   ├── Providers.tsx   # React Query + Sonner
│       │   └── ui/            # shadcn/ui components
│       ├── hooks/
│       │   ├── use-wallet.ts  # Wallet connection + signing
│       │   └── use-contract.ts # Contract interactions
│       ├── store/
│       │   ├── wallet.ts      # Zustand wallet state
│       │   └── transactions.ts # Transaction & event state
│       ├── lib/
│       │   ├── constants.ts   # Network config & helpers
│       │   ├── stellar.ts     # Stellar SDK utilities
│       │   └── utils.ts       # cn() helper
│       └── types/
│           └── index.ts       # TypeScript types
└── scripts/
    └── deploy.sh              # Contract deployment script
```

## Contract Address

```
CONTRACT_ADDRESS_HERE
```

> Deploy the contract using `scripts/deploy.sh` and replace this placeholder.

## Example Transaction Hash

```
TRANSACTION_HASH_HERE
```

> After deploying and creating your first escrow, paste the transaction hash here.

## License

MIT
