# TrunkSwap

TrunkSwap is a decentralized exchange (DEX) that allows users to swap tokens, add liquidity, and remove liquidity in a seamless and user-friendly manner.

## 🌐 Website

https://trunkswap.vercel.app/swap

## 🚀 Features

- Swap tokens with real-time pricing
- Add liquidity to earn LP rewards
- Remove liquidity with detailed breakdowns
- Dynamic price updates every 10 seconds
- Responsive, intuitive UI

## 📦 Technologies Used

- **Next.js** for frontend
- **Ethers.js** for blockchain interactions
- **Smart Contracts** for liquidity pool management
- **Chainlink Price Feeds** for accurate pricing

## 💧 Add Liquidity

### UI

- Select two tokens
- Input token amounts
- View pool share and price impact
- Confirm and send transaction

### Smart Contract Flow

1. Approve tokens
2. Call `addLiquidity(token0, token1, amountA, amountB)`
3. Receive LP tokens

---

## 🧹 Remove Liquidity

### UI

- Select token pair
- Input LP amount to remove
- Show estimated return in tokens
- Confirm and receive tokens

### Smart Contract Flow

1. Approve LP tokens
2. Call `removeLiquidity(token0, token1, lpAmount)`
3. Receive original tokens proportionally

---

## 🛠️ Installation

```bash
git clone https://github.com/sammed-21/trunkswap.git
cd trunkswap
npm install
npm run dev
```

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you would like to change.

---

## 📄 License

MIT

---

## 📬 Contact

- Twitter: [@0xSam_21](https://twitter.com/0xSam_21)
