import { motion } from 'framer-motion';
import { HeroSection } from '../sections/HeroSection';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { SupportedChainsSection } from '../sections/SupportedChainsSection';
import { SupportedCountriesSection } from '../sections/SupportedCountriesSection';
import { FAQSection } from '../sections/FAQSection';

interface LandingPageProps {
  onStartSending: () => void;
}

export function LandingPage({ onStartSending }: LandingPageProps) {
  return (
    <div className="space-y-20">
      <HeroSection onStartSending={onStartSending} />
      <HowItWorksSection />
      <SupportedChainsSection />
      <SupportedCountriesSection />
      <FAQSection />
    </div>
  );
}