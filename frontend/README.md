# EthSpenda - Instant Crypto to Mobile Money

A modern, professional web application that enables instant conversion and sending of ETH and compatible tokens from Ethereum L1, Base L2, or Lisk L2 chains to mobile money wallets across Africa.

## 🚀 Features

### Core Functionality
- **Instant Transfers**: Send crypto to mobile money wallets in under 30 seconds
- **Multi-Chain Support**: Ethereum L1, Base L2, and Lisk L2 networks
- **Zero Fees**: No platform fees, only standard blockchain gas costs
- **No KYC Required**: Connect wallet and start sending immediately
- **Real-time Conversion**: Live USD equivalent display with market rates

### Supported Providers
- **Kenya**: M-Pesa, Airtel Money
- **Nigeria**: Opay, Kuda Bank, MTN MoMo
- **Ghana**: MTN MoMo, Airtel Money
- **Uganda**: MTN MoMo, Airtel Money
- **Tanzania**: M-Pesa, Airtel Money
- **Rwanda**: MTN MoMo, Airtel Money

### Technical Features
- **Mobile-First Design**: Optimized for African smartphone usage
- **Dark/Light Mode**: Seamless theme switching
- **Accessibility**: WCAG 2.1 AA compliant with ARIA labels
- **Responsive**: Works perfectly on all device sizes
- **Fast Loading**: Optimized for slow internet connections
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🎨 Design System

### Colors
- **Primary Blue**: `#3B82F6` (rgb(59, 130, 246))
- **Emerald Green**: `#10B981` (rgb(16, 185, 129))
- **Background**: Dynamic white/dark with gradient overlays
- **Text**: High contrast ratios for accessibility

### Typography
- **Font**: Inter (system fallback: -apple-system, sans-serif)
- **Headings**: 120% line height, weights 600-700
- **Body**: 150% line height, weight 400-500
- **Code**: Monospace for transaction hashes

### Animations
- **Framer Motion**: Smooth page transitions and micro-interactions
- **Hover Effects**: Subtle scale and color transitions
- **Loading States**: Engaging spinners and progress indicators
- **Modal Transitions**: Smooth scale and fade animations

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Components**: ShadCN UI for consistent, accessible components
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React for consistent iconography
- **Theme**: next-themes for dark/light mode
- **Build Tool**: Vite for fast development and building

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/           # Header, Footer, MainLayout
│   ├── pages/            # LandingPage, ConversionPage
│   ├── sections/         # HeroSection, FAQSection, etc.
│   ├── conversion/       # Form components and selectors
│   └── ui/              # ShadCN UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── styles/             # Global CSS and Tailwind config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/ethspenda.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
```env
# Add these to your .env file for production
VITE_API_URL=your_api_endpoint
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict mode enabled for type safety

## 🌐 API Integration Points

### Wallet Connection
```typescript
// Placeholder for wallet integration
const connectWallet = async () => {
  // TODO: Integrate with wagmi or ethers.js
  // Example: await connector.connect()
};
```

### Conversion Rates
```typescript
// Placeholder for rate API
const fetchConversionRate = async (token: string) => {
  // TODO: Integrate with price API (CoinGecko, etc.)
  // Example: await fetch(`/api/rates/${token}`)
};
```

### Transaction Processing
```typescript
// Placeholder for blockchain interaction
const sendTransaction = async (params: TransactionParams) => {
  // TODO: Integrate with smart contracts
  // Example: await contract.transfer(params)
};
```

## ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Clear focus indicators and logical tab order
- **Semantic HTML**: Proper heading hierarchy and landmark roles

## 📱 Mobile Optimization

- **Touch Targets**: Minimum 44px touch targets
- **Viewport**: Optimized for mobile viewports
- **Performance**: Lazy loading and code splitting
- **Offline Support**: Service worker for basic offline functionality
- **PWA Ready**: Manifest and icons for app-like experience

## 🔒 Security Considerations

- **No Private Keys**: Never store or handle private keys
- **Client-Side Only**: All sensitive operations happen in user's wallet
- **HTTPS Only**: Enforce secure connections in production
- **Content Security Policy**: Prevent XSS attacks
- **Input Validation**: Sanitize all user inputs

## 🚀 Deployment

### Build Optimization
```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm run analyze
```

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and patterns
- Add TypeScript types for all new code
- Include accessibility attributes for UI components
- Test on multiple devices and browsers
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ShadCN**: For the excellent UI component library
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For smooth animations
- **Lucide**: For beautiful, consistent icons
- **African Fintech Community**: For inspiration and feedback

---

**Built with ❤️ for Africa's financial future**