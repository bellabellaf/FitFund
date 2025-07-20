# 🏥 FitFund – Health Goals on Stacks

**FitFund** is a decentralized health incentive platform built on the **Stacks blockchain** using **Clarity smart contracts**. Users set fitness or wellness goals, verify completion via off-chain oracles (like wearable devices), and earn rewards in $STX or platform tokens. Optional NFTs reflect progress for insurance or gamification use.

---

## 🔗 Built with Stacks

- ✅ **Clarity** smart contracts (predictable, secure)
- 🔐 **Stacks blockchain** for decentralized execution
- 🌐 **Hiro Wallet** for Web3 login
- ⚡ Oracle integration (via backend API or Chainlink/API3-like off-chain service)

---

## ⚙️ Smart Contract Overview (Clarity)

### 1. `goal-contract.clar`
Handles goal creation and completion verification.

**Key Functions:**
- `(create-goal (user principal) (goal-type (string-ascii 32)) (target int) (deadline uint))`
- `(submit-verification (goal-id uint) (data-hash (buff 32)))`
- `(claim-reward (goal-id uint))`

### 2. `reward-pool.clar`
Manages sponsor-funded reward pools.

**Key Functions:**
- `(fund-reward-pool (amount uint))`
- `(release-reward (recipient principal) (amount uint))`

### 3. `health-nft.clar` *(Optional)*
Issues dynamic NFTs tied to user fitness achievements.

**Key Functions:**
- `(mint (recipient principal))`
- `(update-score (token-id uint) (score-metadata (string-ascii 128)))`

---

## 🧠 How It Works

1. 🧍 User sets a health goal (e.g., 70,000 steps in 7 days).
2. 📲 Wearable device sends data to off-chain oracle service.
3. 🔗 Oracle verifies goal and submits a hash to `goal-contract`.
4. 💸 User claims their reward (STX or platform tokens).
5. 🧬 Optional: user receives or upgrades a dynamic NFT.

---

## 📦 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org)
- [Clarinet](https://docs.stacks.co/clarity/clarinet-cli) for local Clarity development
- [Hiro Wallet](https://www.hiro.so/wallet)

### Clone and Install
```bash
git clone https://github.com/your-org/fitfund-stacks.git
cd fitfund-stacks
npm install
