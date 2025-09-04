import { motion } from 'framer-motion';
import { Globe, Zap, Network } from 'lucide-react';

export function SupportedNetworks() {
  const networks = [
    {
      name: 'Ethereum',
      type: 'Layer 1',
      icon: Globe,
      color: 'from-blue-600 to-blue-700',
      description: 'The original and most secure Ethereum network',
    },
    {
      name: 'Base',
      type: 'Layer 2',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      description: 'Fast and low-cost Coinbase L2 solution',
    },
    {
      name: 'Lisk',
      type: 'Layer 2',
      icon: Network,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Developer-friendly blockchain platform',
    },
  ];

  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Supported Networks
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Send from multiple blockchain networks with optimized routing and best rates
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {networks.map((network, index) => {
          const IconComponent = network.icon;
          return (
            <motion.div
              key={network.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${network.color} opacity-5`}></div>
              <div className="relative p-6 text-center space-y-4">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${network.color} rounded-full flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {network.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {network.type}
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {network.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}