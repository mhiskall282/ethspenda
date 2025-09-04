import { ThemeProvider } from 'next-themes';
import { motion } from 'framer-motion';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './components/pages/LandingPage';
import { ConversionPage } from './components/pages/ConversionPage';
import { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'conversion'>('landing');


  return (
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
  );
}

export default App;