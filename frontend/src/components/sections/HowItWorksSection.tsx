import { motion } from 'framer-motion';
import { Wallet, Network, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: 'Connect Wallet',
      description: 'Connect your MetaMask, WalletConnect, or any Web3 wallet',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: 2,
      title: 'Select Chain',
      description: 'Choose from Ethereum, Base, or Lisk networks',
      icon: Network,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      number: 3,
      title: 'Enter Details',
      description: 'Set amount, recipient phone number, and mobile money provider',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
    },
    {
      number: 4,
      title: 'Confirm & Send',
      description: 'Review and confirm your transaction for instant delivery',
      icon: CheckCircle,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <section id="how-it-works" className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Four simple steps to send crypto to any mobile money wallet in Africa
        </p>
      </motion.div>

      <div className="relative">
        {/* Connection Lines */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 via-purple-200 to-orange-200 dark:from-blue-800 dark:via-emerald-800 dark:via-purple-800 dark:to-orange-800 transform -translate-y-1/2"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="relative mx-auto w-fit">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center pt-2">
                      <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        </div>
      </div>
    </section>
  );
}