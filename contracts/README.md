# EthSpenda Smart Contracts

This directory contains the smart contracts for EthSpenda, a platform that enables instant conversion and transfer of cryptocurrency (ETH and ERC20 tokens) to mobile money wallets across Africa.

## 📋 Overview

The EthSpenda smart contract system consists of:

1. **EthSpenda.sol** - Main contract handling crypto-to-mobile-money transfers
2. **EthSpendaFactory.sol** - Factory contract for multi-chain deployment
3. **Test contracts** - MockV3Aggregator and MockERC20 for testing

## 🏗️ Architecture

### EthSpenda Contract Features

- **Multi-Chain Support**: Ethereum L1, Base L2, Lisk L2
- **Multi-Token Support**: ETH and ERC20 tokens
- **Real-time Price Feeds**: Chainlink integration for accurate USD conversion
- **Fee Management**: Configurable platform fees (currently 0%)
- **Security Features**: 
  - Reentrancy protection
  - Pausable functionality
  - Access control for operators
  - Emergency withdrawal capabilities
- **Mobile Money Integration**: Support for multiple African providers
- **Comprehensive Event Logging**: For off-chain processing

### Supported Countries & Providers

| Country | Providers |
|---------|-----------|
| Kenya (KE) | M-Pesa, Airtel Money |
| Nigeria (NG) | Opay, Kuda Bank, MTN MoMo |
| Ghana (GH) | MTN MoMo, Airtel Money |
| Uganda (UG) | MTN MoMo, Airtel Money |
| Tanzania (TZ) | M-Pesa, Airtel Money |
| Rwanda (RW) | MTN MoMo, Airtel Money |

## 🚀 Deployment

### Prerequisites

```bash
npm install
```

### Local Deployment

```bash
# Start local Hardhat network
npm run node

# Deploy to local network
npm run deploy:localhost
```

### Testnet Deployment

```bash
# Deploy to Base Sepolia
npm run deploy:baseSepolia

# Deploy to other networks (configure RPC URLs in .env)
npm run deploy:base
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Required environment variables:
- `PRIVATE_KEY` - Deployer private key
- `*_RPC_URL` - RPC endpoints for different networks
- `*_API_KEY` - API keys for contract verification

## 📊 Contract Addresses

### Testnet Deployments

| Network | Factory Address | EthSpenda Address |
|---------|----------------|-------------------|
| Base Sepolia | TBD | TBD |
| Lisk Sepolia | TBD | TBD |

### Mainnet Deployments

| Network | Factory Address | EthSpenda Address |
|---------|----------------|-------------------|
| Ethereum | TBD | TBD |
| Base | TBD | TBD |
| Lisk | TBD | TBD |

## 🔧 Usage

### Basic Transfer Flow

1. **User initiates transfer**:
   ```solidity
   ethSpenda.initiateTransfer(
       tokenAddress,    // address(0) for ETH
       amount,          // Amount in wei
       "+254712345678", // Recipient phone
       "KE",           // Country code
       "mpesa"         // Provider code
   );
   ```

2. **System processes transfer**:
   - Validates parameters
   - Calculates USD value using Chainlink
   - Collects platform fees (if any)
   - Emits `TransferInitiated` event

3. **Off-chain service**:
   - Listens for events
   - Processes mobile money transfer
   - Calls `completeTransfer()` or `failTransfer()`

### Key Functions

#### For Users
- `initiateTransfer()` - Start a crypto-to-mobile-money transfer
- `getUSDValue()` - Get current USD value of tokens
- `getLatestPrice()` - Get latest price from oracle

#### For Operators
- `completeTransfer()` - Mark transfer as completed
- `failTransfer()` - Mark transfer as failed

#### For Admin
- `setPlatformFeeRate()` - Update fee rate
- `addOperator()` - Add authorized operator
- `addCountry()` / `addProvider()` - Add supported regions
- `pause()` / `unpause()` - Emergency controls

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

Test coverage includes:
- ✅ Contract deployment and initialization
- ✅ ETH transfers with validation
- ✅ ERC20 token transfers
- ✅ Fee collection mechanisms
- ✅ Operator permissions
- ✅ Emergency functions
- ✅ Price feed integration

## 🔒 Security Features

### Access Control
- **Owner**: Contract deployer, can modify settings
- **Operators**: Authorized addresses that can complete transfers
- **Users**: Anyone can initiate transfers

### Safety Mechanisms
- **Reentrancy Guard**: Prevents reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Parameter Validation**: Comprehensive input validation
- **Price Staleness Check**: Rejects outdated price data

### Emergency Procedures
- **Pause Contract**: Stop all operations
- **Emergency Withdraw**: Recover funds (only when paused)
- **Operator Management**: Add/remove authorized operators

## 📈 Gas Optimization

The contracts are optimized for gas efficiency:
- **Stack Depth Management**: Functions split to avoid "stack too deep" errors
- **Efficient Storage**: Minimal storage operations
- **Batch Operations**: Factory pattern for deployment
- **Optimized Compiler Settings**: 200 runs optimization

## 🔗 Integration

### Frontend Integration

```javascript
// Contract ABI and addresses available after deployment
import { EthSpenda__factory } from './typechain-types';

// Connect to deployed contract
const ethSpenda = EthSpenda__factory.connect(
  contractAddress,
  signer
);

// Initiate transfer
const tx = await ethSpenda.initiateTransfer(
  ethers.ZeroAddress, // ETH
  ethers.parseEther("0.1"),
  "+254712345678",
  "KE", 
  "mpesa",
  { value: ethers.parseEther("0.1") }
);
```

### Event Monitoring

```javascript
// Listen for transfer events
ethSpenda.on("TransferInitiated", (
  requestId,
  sender,
  token,
  amount,
  recipientPhone,
  countryCode,
  providerCode,
  usdAmount,
  timestamp
) => {
  // Process mobile money transfer
  console.log(`Transfer initiated: ${requestId}`);
});
```

## 🛠️ Development

### Project Structure

```
contracts/
├── contracts/
│   ├── EthSpenda.sol          # Main contract
│   ├── EthSpendaFactory.sol   # Factory contract
│   └── test/                  # Mock contracts
├── scripts/
│   └── deploy.js              # Deployment script
├── test/
│   └── EthSpenda.test.ts      # Test suite
├── hardhat.config.js          # Hardhat configuration
└── package.json               # Dependencies
```

### Build Commands

```bash
npm run compile     # Compile contracts
npm run test        # Run tests
npm run deploy      # Deploy to default network
npm run node        # Start local node
npm run clean       # Clean artifacts
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

For technical support or questions:
- GitHub Issues: [ethspenda/contracts](https://github.com/dr-winner/ethspenda)
- Documentation: [docs.ethspenda.com](https://docs.ethspenda.com)

---

Built with ❤️ for Africa's financial future
