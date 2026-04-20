# Veri-Med — First-Time Setup Guide

> **Veri-Med** is a blockchain-powered medicine provenance platform built on Polygon Mumbai.
> This guide walks you through setting up every external service and running the full stack.

---

## Prerequisites

- **Node.js** ≥ 18 (recommended: 20+)
- **npm** ≥ 9
- **MetaMask** browser extension
- **Git**

---

## 📁 Project Structure

```
Pharma-track/
├── contracts/          # Solidity smart contract + Hardhat
│   ├── contracts/      # PharmaTrack.sol
│   ├── scripts/        # deploy.ts, seed.ts
│   ├── test/           # 25 test cases
│   └── hardhat.config.ts
├── backend/            # Express + TypeScript + Drizzle ORM
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── db/
│   │   └── lib/
│   └── package.json
├── frontend/           # React 18 + Vite + TailwindCSS + wagmi v2
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── store/
│   └── package.json
└── SETUP.md            # ← You are here
```

---

## Step 1 — MetaMask Wallets

You need **4 MetaMask wallets** (or 4 accounts within MetaMask):

| Wallet | Purpose | Variable |
|--------|---------|----------|
| **Deployer** | Deploys the contract, gets ADMIN role | `PRIVATE_KEY` |
| **Manufacturer** | Registers batches | `MANUFACTURER_WALLET` |
| **Distributor** | Receives from manufacturer | `DISTRIBUTOR_WALLET` |
| **Pharmacy** | Sells to patients | `PHARMACY_WALLET` |

### How to create accounts:
1. Open MetaMask → click your account icon → "Add Account"
2. Name them: `Veri-Med Admin`, `Veri-Med Manufacturer`, `Veri-Med Distributor`, `Veri-Med Pharmacy`
3. Copy each wallet address (0x...)
4. For the deployer: click the three dots → "Account Details" → "Export Private Key"

⚠️ **Never share or commit your private key!**

---

## Step 2 — Alchemy RPC (Polygon Mumbai)

1. Go to [alchemy.com](https://alchemy.com) → Create a free account
2. Click **"Create New App"**
3. Select:
   - **Chain**: Polygon
   - **Network**: Polygon Mumbai
4. After creation, click on the app → **"API Key"**
5. Copy the **HTTPS** endpoint → This is your `POLYGON_RPC` / `VITE_POLYGON_RPC`
6. Copy the **WSS** (WebSocket) endpoint → This is your `POLYGON_WS_RPC`

### Get test MATIC:
- [Official Polygon Faucet](https://faucet.polygon.technology)
- [Alternative: Mumbai Faucet](https://mumbaifaucet.com)

Request test MATIC for **all 4 wallets** (deployer needs the most — at least 1 MATIC).

---

## Step 3 — Supabase (PostgreSQL Database)

1. Go to [supabase.com](https://supabase.com) → Create a free account
2. Click **"New Project"**
   - Name: `veri-med` or `pharmatrack`
   - Database Password: choose a strong password (save it!)
   - Region: closest to you
3. Wait for the project to provision (~2 minutes)
4. Go to **Settings → Database → Connection String** → select **URI**
5. Copy the URI — replace `[YOUR-PASSWORD]` with your actual password

```
postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres
```

This is your `DATABASE_URL`.

---

## Step 4 — Upstash Redis

1. Go to [upstash.com](https://upstash.com) → Create a free account
2. Click **"Create Database"**
   - Name: `veri-med-cache`
   - Type: Regional
   - Region: `ap-south-1` (Mumbai) or closest to you
3. After creation, go to the **REST API** tab
4. Copy:
   - **UPSTASH_REDIS_REST_URL** → This is your `UPSTASH_REDIS_URL`
   - **UPSTASH_REDIS_REST_TOKEN** → This is your `UPSTASH_REDIS_TOKEN`

---

## Step 5 — Install Dependencies

```bash
# Install all packages
cd contracts && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## Step 6 — Configure Environment Variables

### `contracts/.env`
```bash
cp contracts/.env.example contracts/.env
```
Fill in:
- `PRIVATE_KEY` (deployer wallet, 0x prefixed)
- `POLYGON_MUMBAI_RPC` (from Alchemy)
- `MANUFACTURER_WALLET`, `DISTRIBUTOR_WALLET`, `PHARMACY_WALLET`
- `DATABASE_URL` (from Supabase)

### `backend/.env`
```bash
cp backend/.env.example backend/.env
```
Fill in:
- `DATABASE_URL` (from Supabase)
- `JWT_SECRET` (any random 32+ character string)
- `POLYGON_RPC` and `POLYGON_WS_RPC` (from Alchemy)
- `PRIVATE_KEY` (deployer/admin wallet)
- `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` (from Upstash)

### `frontend/.env`
```bash
cp frontend/.env.example frontend/.env
```
Fill in:
- `VITE_POLYGON_RPC` (from Alchemy — same HTTPS URL)
- `VITE_CONTRACT_ADDRESS` will be filled after deployment

---

## Step 7 — Compile & Test the Smart Contract

```bash
cd contracts

# Compile
npm run compile

# Run 25 test cases
npm test
```

Expected output: `25 passing`

---

## Step 8 — Deploy the Smart Contract

### Option A: Local Hardhat Network (for testing)
```bash
# Terminal 1: Start local node
cd contracts && npm run node

# Terminal 2: Deploy to local
cd contracts && npm run deploy:local
```

### Option B: Polygon Mumbai Testnet
```bash
cd contracts && npm run deploy
```

After deployment:
1. Copy the contract address from the terminal output
2. Update `backend/.env`: `CONTRACT_ADDRESS=0x...`
3. Update `frontend/.env`: `VITE_CONTRACT_ADDRESS=0x...`
4. The ABI is automatically copied to both `frontend/` and `backend/`

---

## Step 9 — Database Migration

```bash
cd backend

# Generate migration files from schema
npx drizzle-kit generate

# Apply migrations to Supabase
npx drizzle-kit migrate
```

### Verify tables were created:
- Open Supabase → **Table Editor** → you should see 7 tables:
  `actors`, `batches`, `strips`, `supply_chain_events`, `sale_tokens`, `counterfeit_reports`, `auth_nonces`

---

## Step 10 — Seed Test Data

```bash
# Seed actors into PostgreSQL
cd backend && npm run seed

# Seed on-chain batch + strips (requires deployed contract)
cd contracts && npm run seed
```

---

## Step 11 — Run the Application

```bash
# Terminal 1: Backend (port 5000)
cd backend && npm run dev

# Terminal 2: Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Step 12 — Test the Flow

1. **Landing Page**: Click "Connect Wallet" → MetaMask will prompt
2. **Sign In**: Approve the signature request → you'll be redirected to your role's dashboard
3. **Manufacturer**: Register a new batch → watch the blockchain transaction
4. **Distributor**: View incoming batches → confirm receipt
5. **Pharmacy**: View inventory → sell tablets → generate QR code
6. **Verify**: Scan any sale QR code → see the full supply chain history

---

## Polygonscan Verification

If deployed to Mumbai and you have a `POLYGONSCAN_API_KEY`:
```bash
cd contracts
npx hardhat verify --network mumbai CONTRACT_ADDRESS
```

Get your API key at: [polygonscan.com/myapikey](https://polygonscan.com/myapikey)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Invalid URL` error on backend start | Fill in real values in `backend/.env` (replace all placeholders) |
| MetaMask "wrong network" | Switch MetaMask to Polygon Mumbai (Chain ID: 80001) |
| "Insufficient funds" on deploy | Get test MATIC from the faucet |
| Database connection refused | Check your Supabase project is active and the connection string is correct |
| Redis connection error | Check Upstash REST URL and token |
| Contract verification fails | Wait ~60s after deployment, then retry |

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  React+wagmi │     │  Express+TS  │     │  (Supabase)  │
│  port 5173   │     │  port 5000   │     └──────────────┘
└──────────────┘     │              │
       │             │              │────▶┌──────────────┐
       │             │              │     │    Redis     │
       │             └──────────────┘     │  (Upstash)   │
       │                    │             └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────────────────────┐
│     Polygon Mumbai Chain     │
│     PharmaTrack.sol          │
└──────────────────────────────┘
```
