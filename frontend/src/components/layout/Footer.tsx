import { motion } from 'framer-motion';
import { Github, Twitter, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                EthSpenda
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Instant crypto to mobile money transfers across Africa. No accounts, no KYC, no fees.
          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white" id="footer-links">Quick Links</h4>
            <nav className="space-y-2" aria-labelledby="footer-links">
              <a 
                href="#how-it-works" 
                className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm focus-ring rounded px-1 py-0.5"
                aria-label="Learn how EthSpenda works"
              >
                How It Works
              </a>
              <a 
                href="#faq" 
                className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm focus-ring rounded px-1 py-0.5"
                aria-label="View frequently asked questions"
              >
                FAQ
              </a>
              <a 
                href="#about" 
                className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm focus-ring rounded px-1 py-0.5"
                aria-label="Learn about EthSpenda"
              >
                About
              </a>
              <a 
                href="#privacy" 
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm focus-ring rounded px-1 py-0.5"
                aria-label="View privacy policy"
              >
                <Shield className="w-3 h-3" />
                <span>Privacy Policy</span>
              </a>
            </nav>
          </div>
            </p>
          {/* Social & Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white" id="footer-social">Connect</h4>
            <div className="flex space-x-3" role="group" aria-labelledby="footer-social">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus-ring"
                aria-label="Follow on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus-ring"
                aria-label="View on GitHub"
              >
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
          </div>
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 EthSpenda. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}