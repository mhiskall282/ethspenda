import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartSending: () => void;
}

export function HeroSection({ onStartSending }: HeroSectionProps) {
  return (
    <section className="text-center space-y-8 py-12 md:py-20" role="banner" aria-label="Hero section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center space-x-3 mb-8"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent"
            aria-label="EthSpenda - Instant ETH to Mobile Money in Africa"
          >
            EthSpenda
          </h1>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight"
        >
          Instant ETH to Mobile Money in Africa
          <br />
          <span className="text-emerald-600 dark:text-emerald-400">Borderless, Fee-Free</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
        >
          Send Ethereum and tokens directly to mobile money wallets across Africa. 
          No accounts, no verification, no hidden fees. Just instant transfers powered by blockchain technology.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <Button
          onClick={onStartSending}
          size="lg"
          className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 focus-ring"
          aria-label="Start sending crypto to mobile money"
        >
          Start Sending
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-14 px-8 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 focus-ring"
          aria-label="Learn more about EthSpenda"
        >
          Learn More
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12"
        role="region"
        aria-label="Key statistics"
      >
        {[
          { label: 'Countries Supported', value: '15+' },
          { label: 'Average Transfer Time', value: '<30s' },
          { label: 'Transaction Fees', value: '$0' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
            className="text-center"
          >
            <div 
              className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400"
              aria-label={`${stat.value} ${stat.label}`}
            >
              {stat.value}
            </div>
            <div className="text-gray-600 dark:text-gray-300 mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}