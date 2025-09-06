import { motion } from 'framer-motion';
import { Zap, Moon, Sun, Menu, Wallet } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface HeaderProps {
  onNavigate: (page: 'landing' | 'conversion') => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
    } else {
      // Connect with the first available connector (usually MetaMask)
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    }
    onNavigate('conversion');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          role="button"
          tabIndex={0}
          aria-label="Navigate to home page"
          onClick={() => onNavigate('landing')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('landing')}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            EthSpenda
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
          <a 
            href="#how-it-works" 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus-ring rounded-md px-2 py-1"
            aria-label="Learn how EthSpenda works"
          >
            How It Works
          </a>
          <a 
            href="#faq" 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus-ring rounded-md px-2 py-1"
            aria-label="View frequently asked questions"
          >
            FAQ
          </a>
          <a 
            href="#about" 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus-ring rounded-md px-2 py-1"
            aria-label="Learn about EthSpenda"
          >
            About
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWalletAction}
            className="hidden md:flex items-center space-x-2 h-9 focus-ring"
            aria-label={isConnected ? "Disconnect wallet" : "Connect wallet to start sending"}
          >
            <Wallet className="w-4 h-4" />
            <span>{isConnected ? formatAddress(address!) : "Connect Wallet"}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 focus-ring"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-9 h-9 focus-ring"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <a 
              href="#how-it-works" 
              className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus-ring rounded-md px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Learn how EthSpenda works"
            >
              How It Works
            </a>
            <a 
              href="#faq" 
              className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus-ring rounded-md px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
              aria-label="View frequently asked questions"
            >
              FAQ
            </a>
            <a 
              href="#about" 
              className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium focus-ring rounded-md px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Learn about EthSpenda"
            >
              About
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleWalletAction();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 h-10 focus-ring"
              aria-label={isConnected ? "Disconnect wallet" : "Connect wallet to start sending"}
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnected ? formatAddress(address!) : "Connect Wallet"}</span>
            </Button>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}