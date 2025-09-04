import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQSection() {
  const faqs = [
    {
      question: 'How fast are the transfers?',
      answer: 'Transfers typically complete within 30 seconds. The speed depends on network congestion and the mobile money provider processing time.',
    },
    {
      question: 'Are there any fees?',
      answer: 'No, EthSpenda charges zero fees. You only pay the standard blockchain gas fees for your transaction, which are typically very low on L2 networks.',
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No account required! Simply connect your wallet and start sending. We believe in true decentralization and privacy.',
    },
    {
      question: 'Which tokens are supported?',
      answer: 'We support ETH and major stablecoins like USDC, USDT, and DAI across Ethereum, Base, and Lisk networks.',
    },
    {
      question: 'Is my transaction secure?',
      answer: 'Yes, all transactions are secured by blockchain technology. We never hold your funds - everything is processed directly through smart contracts.',
    },
    {
      question: 'What if my transaction fails?',
      answer: 'Failed transactions are automatically refunded to your wallet. Our smart contracts ensure you never lose your funds.',
    },
    {
      question: 'Which countries do you support?',
      answer: 'We currently support 15+ African countries including Kenya, Nigeria, Ghana, Uganda, Tanzania, Rwanda, and more.',
    },
    {
      question: 'How do exchange rates work?',
      answer: 'We use real-time market rates from multiple sources to ensure you get the best possible exchange rate for your conversion.',
    },
  ];

  return (
    <section id="faq" className="space-y-12" role="region" aria-labelledby="faq-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Everything you need to know about using EthSpenda
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <Accordion type="single" collapsible className="space-y-4" role="region" aria-label="Frequently asked questions">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <AccordionTrigger 
                  className="text-left font-semibold text-gray-900 dark:text-white hover:no-underline py-4 focus-ring rounded"
                  aria-label={`Question: ${faq.question}`}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent 
                  className="text-gray-600 dark:text-gray-300 pb-4 leading-relaxed"
                  role="region"
                  aria-label="Answer"
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}