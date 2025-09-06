import { ThemeProvider } from 'next-themes';
import { motion } from 'framer-motion';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/web3';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './components/pages/LandingPage';
import { ConversionPage } from './components/pages/ConversionPage';
import { useState } from 'react';

// Create a client for React Query
const queryClient = new QueryClient()

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'conversion'>('landing');

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <MainLayout onNavigate={setCurrentPage}>
                {currentPage === 'landing' ? (
                  <LandingPage onStartSending={() => setCurrentPage('conversion')} />
                ) : (
                  <ConversionPage />
                )}
              </MainLayout>
            </motion.div>
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;