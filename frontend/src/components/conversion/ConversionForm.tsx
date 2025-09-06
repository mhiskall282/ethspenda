import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Wallet, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TokenSelector } from './TokenSelector';
import { NetworkSelector } from './NetworkSelector';
import { MobileMoneySelector } from './MobileMoneySelector';
import { useToast } from '@/hooks/use-toast';
import { useRealTimePrice } from '@/services/priceService';

export function ConversionForm() {
  const [step, setStep] = useState<'form' | 'connecting' | 'sending' | 'success'>('form');
  const [amount, setAmount] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [selectedProvider, setSelectedProvider] = useState('');
  const { toast } = useToast();
  
  // Real-time price data
  const { price: ethPrice, loading: priceLoading } = useRealTimePrice('ethereum');
  const currentETHPrice = ethPrice || 2500; // fallback price

  const handleConnect = async () => {
    setStep('connecting');
    // Simulate wallet connection
    setTimeout(() => {
      setStep('form');
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
      });
    }, 2000);
  };

  const handleSend = async () => {
    if (!amount || !recipientNumber || !selectedProvider) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to process the transaction.",
        variant: "destructive",
      });
      return;
    }

    setStep('sending');
    // Simulate transaction
    setTimeout(() => {
      setStep('success');
    }, 3000);
  };

  const resetForm = () => {
    setStep('form');
    setAmount('');
    setRecipientNumber('');
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      layout
    >
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Send Crypto to Mobile Money
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Convert and send instantly across Africa
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Network Selection */}
                <div className="space-y-2">
                  <Label htmlFor="network">Network</Label>
                  <NetworkSelector value={selectedNetwork} onValueChange={setSelectedNetwork} />
                </div>

                {/* Token and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Token</Label>
                    <TokenSelector value={selectedToken} onValueChange={setSelectedToken} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg"
                      aria-label="Amount to send"
                    />
                  </div>
                </div>

                {/* Conversion Preview */}
                {amount && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">You'll receive</span>
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      ≈ ${(parseFloat(amount) * currentETHPrice).toLocaleString()} USD
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Rate: 1 ETH = ${currentETHPrice.toLocaleString()} USD {priceLoading && '(Loading...)'}
                    </div>
                  </motion.div>
                )}

                {/* Mobile Money Provider */}
                <div className="space-y-2">
                  <Label htmlFor="provider">Mobile Money Provider</Label>
                  <MobileMoneySelector value={selectedProvider} onValueChange={setSelectedProvider} />
                </div>

                {/* Recipient Number */}
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Phone Number</Label>
                  <Input
                    id="recipient"
                    type="tel"
                    placeholder="Enter phone number with country code"
                    value={recipientNumber}
                    onChange={(e) => setRecipientNumber(e.target.value)}
                    className="text-lg"
                    aria-label="Recipient phone number"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  <Button
                    onClick={handleConnect}
                    variant="outline"
                    className="h-12 text-base font-medium"
                    aria-label="Connect wallet"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </Button>
                  <Button
                    onClick={handleSend}
                    className="h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white border-0"
                    aria-label="Send transaction"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Now
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'connecting' && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 rounded-full"></div>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Connecting Wallet...
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Please approve the connection in your wallet
                </p>
              </motion.div>
            )}

            {step === 'sending' && (
              <motion.div
                key="sending"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full flex items-center justify-center"
                >
                  <Send className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Processing Transaction...
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your transfer is being processed on the blockchain
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  Transfer Successful!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ${(parseFloat(amount || '0') * currentETHPrice).toLocaleString()} USD has been sent to {recipientNumber}
                </p>
                <Button onClick={resetForm} variant="outline">
                  Send Another Transfer
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}