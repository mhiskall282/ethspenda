import { motion } from 'framer-motion';
import { Smartphone, CreditCard, Wallet, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SupportedCountriesSection() {
  const countries = [
    {
      name: 'Kenya',
      flag: '🇰🇪',
      providers: ['M-Pesa', 'Airtel Money'],
      icon: Smartphone,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      name: 'Nigeria',
      flag: '🇳🇬',
      providers: ['Opay', 'Kuda Bank', 'MTN MoMo'],
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Ghana',
      flag: '🇬🇭',
      providers: ['MTN MoMo', 'Airtel Money'],
      icon: Wallet,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Uganda',
      flag: '🇺🇬',
      providers: ['MTN MoMo', 'Airtel Money'],
      icon: Smartphone,
      color: 'from-orange-500 to-orange-600',
    },
    {
      name: 'Tanzania',
      flag: '🇹🇿',
      providers: ['M-Pesa', 'Airtel Money'],
      icon: CreditCard,
      color: 'from-teal-500 to-teal-600',
    },
    {
      name: 'Rwanda',
      flag: '🇷🇼',
      providers: ['MTN MoMo', 'Airtel Money'],
      icon: Wallet,
      color: 'from-indigo-500 to-indigo-600',
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
          Supported Countries & Providers
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Send money to mobile wallets across Africa with instant delivery
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country, index) => {
          const IconComponent = country.icon;
          return (
            <motion.div
              key={country.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${country.color} rounded-lg flex items-center justify-center shadow-md`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{country.flag}</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {country.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>Available Providers:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {country.providers.map((provider) => (
                        <span
                          key={provider}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                        >
                          {provider}
                        </span>
                      ))}
                    </div>
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