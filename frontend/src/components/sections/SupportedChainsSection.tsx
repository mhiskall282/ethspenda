import { motion } from 'framer-motion';
import { Globe, Zap, Network } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SupportedChainsSection() {
  const chains = [
    {
      name: 'Ethereum',
      type: 'Layer 1',
      icon: Globe,
      color: 'from-blue-600 to-blue-700',
      description: 'The most secure and decentralized network with the largest ecosystem',
      features: ['Highest Security', 'Largest Ecosystem', 'Most Liquidity'],
    },
    {
      name: 'Base',
      type: 'Layer 2',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      description: 'Coinbase L2 solution offering fast transactions and low fees',
      features: ['Ultra Fast', 'Low Fees', 'Coinbase Backed'],
    },
    {
      name: 'Lisk',
      type: 'Layer 2',
      icon: Network,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Developer-friendly blockchain with excellent tooling and support',
      features: ['Developer Friendly', 'Great Tooling', 'Growing Ecosystem'],
    },
  ];

  return (
    <section className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Supported Blockchain Networks
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Send from multiple networks with optimized routing and best exchange rates
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {chains.map((chain, index) => {
          const IconComponent = chain.icon;
          return (
            <motion.div
              key={chain.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${chain.color}`}></div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${chain.color} rounded-lg flex items-center justify-center shadow-md`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {chain.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {chain.type}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {chain.description}
                  </p>
                  <div className="space-y-2">
                    {chain.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}