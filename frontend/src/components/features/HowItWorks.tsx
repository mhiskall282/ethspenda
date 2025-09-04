import { motion } from 'framer-motion';
import { ArrowRight, Wallet, RefreshCcw, Send } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Connect Wallet',
      description: 'Connect your preferred crypto wallet to get started',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: 2,
      title: 'Set Amount & Recipient',
      description: 'Choose your token, amount, and recipient details',
      icon: RefreshCcw,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      number: 3,
      title: 'Send Instantly',
      description: 'Confirm the transaction and money arrives instantly',
      icon: Send,
      color: 'from-purple-500 to-purple-600',
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
          How It Works
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Three simple steps to send crypto to any mobile money wallet in Africa
        </p>
      </motion.div>

      <div className="relative">
        {/* Connection Lines */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 dark:from-blue-800 dark:via-emerald-800 dark:to-purple-800"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center space-y-4"
              >
                <div className="relative mx-auto w-fit">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-xl`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700">
                    {step.number}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-gray-300 dark:text-gray-600">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}