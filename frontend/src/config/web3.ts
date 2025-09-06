import { http, createConfig } from 'wagmi'
import { base, baseSepolia, localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Contract addresses - update these after deployment
export const CONTRACTS = {
  [localhost.id]: {
    ethSpendaAddress: "0xCafac3dD18aC6c6e92c921884f9E4176737C052c",
    factoryAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  },
  [baseSepolia.id]: {
    ethSpendaAddress: "0x0000000000000000000000000000000000000000", // Update after deployment
    factoryAddress: "0x0000000000000000000000000000000000000000", // Update after deployment
  },
  [base.id]: {
    ethSpendaAddress: "0x0000000000000000000000000000000000000000", // Update after deployment
    factoryAddress: "0x0000000000000000000000000000000000000000", // Update after deployment
  }
}

export const SUPPORTED_NETWORKS = [localhost, baseSepolia, base]

export const config = createConfig({
  chains: [localhost, baseSepolia, base],
  connectors: [
    injected(),
  ],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
  },
})

// EthSpenda Contract ABI - key functions only
export const ETHSPENDA_ABI = [
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "recipientPhone", "type": "string" },
      { "name": "countryCode", "type": "string" },
      { "name": "provider", "type": "string" }
    ],
    "name": "initiateTransfer",
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "transferId", "type": "bytes32" }],
    "name": "getTransfer",
    "outputs": [
      { "name": "sender", "type": "address" },
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "recipientPhone", "type": "string" },
      { "name": "countryCode", "type": "string" },
      { "name": "provider", "type": "string" },
      { "name": "status", "type": "uint8" },
      { "name": "createdAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "getUSDValue",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "token", "type": "address" }],
    "name": "getLatestPrice",
    "outputs": [
      { "name": "price", "type": "int256" },
      { "name": "updatedAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_TRANSFER_AMOUNT",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Supported countries and providers - real data
export const SUPPORTED_COUNTRIES = [
  {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    providers: ["mpesa", "airtel"],
    currency: "KES",
    phoneFormat: "+254XXXXXXXXX"
  },
  {
    code: "NG", 
    name: "Nigeria",
    flag: "🇳🇬",
    providers: ["opay", "kuda", "airtel"],
    currency: "NGN",
    phoneFormat: "+234XXXXXXXXXX"
  },
  {
    code: "GH",
    name: "Ghana", 
    flag: "🇬🇭",
    providers: ["mtn", "airtel"],
    currency: "GHS",
    phoneFormat: "+233XXXXXXXXX"
  },
  {
    code: "UG",
    name: "Uganda",
    flag: "🇺🇬", 
    providers: ["mtn", "airtel"],
    currency: "UGX",
    phoneFormat: "+256XXXXXXXXX"
  },
  {
    code: "TZ",
    name: "Tanzania",
    flag: "🇹🇿",
    providers: ["mpesa", "airtel"],
    currency: "TZS", 
    phoneFormat: "+255XXXXXXXXX"
  },
  {
    code: "RW",
    name: "Rwanda",
    flag: "🇷🇼",
    providers: ["mtn", "airtel"],
    currency: "RWF",
    phoneFormat: "+250XXXXXXXXX"
  }
]

export const MOBILE_MONEY_PROVIDERS = {
  mpesa: {
    name: "M-Pesa",
    icon: "📱",
    countries: ["KE", "TZ"],
    description: "Leading mobile money service in East Africa"
  },
  airtel: {
    name: "Airtel Money", 
    icon: "💰",
    countries: ["KE", "NG", "GH", "UG", "TZ", "RW"],
    description: "Pan-African mobile money platform"
  },
  opay: {
    name: "OPay",
    icon: "💳",
    countries: ["NG"],
    description: "Digital payment platform in Nigeria"
  },
  kuda: {
    name: "Kuda Bank",
    icon: "🏦", 
    countries: ["NG"],
    description: "Digital bank in Nigeria"
  },
  mtn: {
    name: "MTN Mobile Money",
    icon: "📲",
    countries: ["GH", "UG", "RW"],
    description: "MTN's mobile financial services"
  }
}

// Token configurations
export const SUPPORTED_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000", // Zero address for native ETH
    decimals: 18,
    icon: "⚡"
  }
  // Add more tokens later (USDC, USDT, etc.)
]
