import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Wallet, Send, CheckCircle2, Shield, Zap, AlertCircle, X, Share2, Copy, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function ConversionPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [step, setStep] = useState<'form' | 'connecting' | 'confirming' | 'sending' | 'success' | 'error'>('form');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transactionHash, setTransactionHash] = useState('');
  const [errorType, setErrorType] = useState<'insufficient' | 'network' | 'general'>('general');
  const { toast } = useToast();

  const chains = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', logo: '⟠', description: 'Secure Layer 1' },
    { id: 'base', name: 'Base', symbol: 'BASE', logo: '🔵', description: 'Fast Layer 2' },
    { id: 'lisk', name: 'Lisk', symbol: 'LSK', logo: '🟢', description: 'Developer Friendly' },
  ];

  const countries = [
    { id: 'kenya', name: 'Kenya', flag: '🇰🇪', providers: ['mpesa', 'airtel'] },
    { id: 'nigeria', name: 'Nigeria', flag: '🇳🇬', providers: ['opay', 'kuda', 'mtn'] },
    { id: 'ghana', name: 'Ghana', flag: '🇬🇭', providers: ['mtn', 'airtel'] },
    { id: 'uganda', name: 'Uganda', flag: '🇺🇬', providers: ['mtn', 'airtel'] },
  ];

  const providers = {
    mpesa: { name: 'M-Pesa', icon: '📱' },
    opay: { name: 'Opay', icon: '💳' },
    kuda: { name: 'Kuda Bank', icon: '🏦' },
    mtn: { name: 'MTN MoMo', icon: '📞' },
    airtel: { name: 'Airtel Money', icon: '💰' },
  };

  const handleConnectWallet = async () => {
    setStep('connecting');
    setTimeout(() => {
      setIsWalletConnected(true);
      setStep('form');
      toast({
        title: "Wallet Connected",
        description: "MetaMask wallet connected successfully.",
      });
    }, 2000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!selectedChain) {
      newErrors.chain = 'Please select a blockchain';
    }
    if (!selectedCountry) {
      newErrors.country = 'Please select a country';
    }
    if (!selectedProvider) {
      newErrors.provider = 'Please select a provider';
    }
    if (!recipientNumber || recipientNumber.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConvertSend = () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmTransaction = async () => {
    setShowConfirmModal(false);
    setStep('sending');
    
    // Generate mock transaction hash
    const mockHash = '0x' + Math.random().toString(16).substr(2, 64);
    setTransactionHash(mockHash);
    
    // Simulate transaction processing with potential errors
    setTimeout(() => {
      const random = Math.random();
      if (random < 0.1) { // 10% chance of insufficient balance error
        setErrorType('insufficient');
        setStep('error');
        setShowErrorModal(true);
      } else if (random < 0.2) { // 10% chance of network error
        setErrorType('network');
        setStep('error');
        setShowErrorModal(true);
      } else { // 80% success rate
        setStep('success');
        setShowSuccessModal(true);
      }
    }, 3000);
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setStep('form');
    setErrors({});
  };

  const resetForm = () => {
    setShowSuccessModal(false);
    setStep('form');
    setAmount('');
    setRecipientNumber('');
    setSelectedChain('');
    setSelectedCountry('');
    setSelectedProvider('');
    setErrors({});
    setTransactionHash('');
  };

  const copyTransactionHash = () => {
    navigator.clipboard.writeText(transactionHash);
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard.",
    });
  };

  const shareOnX = () => {
    const text = `Just sent $${parseFloat(usdEquivalent).toLocaleString()} instantly to mobile money using @EthSpenda! 🚀 #DeFi #Africa #Crypto`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const usdEquivalent = amount ? (parseFloat(amount) * 3250).toFixed(2) : '0.00';
  const selectedCountryData = countries.find(c => c.id === selectedCountry);
  const availableProviders = selectedCountryData?.providers || [];

  const getErrorMessage = () => {
    switch (errorType) {
      case 'insufficient':
        return {
          title: 'Insufficient Balance',
          description: 'You don\'t have enough ETH to complete this transaction.',
          icon: AlertTriangle,
        };
      case 'network':
        return {
          title: 'Network Error',
          description: 'Unable to connect to the blockchain network. Please try again.',
          icon: AlertCircle,
        };
      default:
        return {
          title: 'Transaction Failed',
          description: 'Something went wrong. Please try again.',
          icon: X,
        };
    }
  };

  const errorInfo = getErrorMessage();
  const ErrorIcon = errorInfo.icon;

  return (
    <div className="min-h-screen py-8" role="main" aria-label="Crypto conversion interface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent mb-4">
            Convert & Send
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Send ETH and tokens to mobile money wallets instantly
          </p>
        </header>

        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Crypto to Mobile Money
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Secure, instant, and fee-free transfers
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6" role="form" aria-label="Conversion form">
            <AnimatePresence mode="wait">
              {!isWalletConnected ? (
                <motion.div
                  key="wallet-connect"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12"
                >
                  {step === 'connecting' ? (
                    <div role="status" aria-live="polite" aria-label="Connecting wallet">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-4"
                        aria-hidden="true"
                      >
                        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 rounded-full"></div>
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Connecting Wallet...
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Please approve the connection in MetaMask
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full flex items-center justify-center">
                        <Wallet className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Connect Your Wallet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Connect MetaMask or WalletConnect to get started
                        </p>
                      </div>
                      <Button
                        onClick={handleConnectWallet}
                        size="lg"
                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white border-0 focus-ring"
                        aria-label="Connect wallet to start sending crypto"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : step === 'form' ? (
                <motion.div
                  key="conversion-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Chain Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="chain">Blockchain Network</Label>
                    <Select value={selectedChain} onValueChange={setSelectedChain}>
                      <SelectTrigger 
                        className={`h-12 focus-ring ${errors.chain ? 'border-red-500' : ''}`}
                        aria-label="Select blockchain network"
                        aria-describedby={errors.chain ? 'chain-error' : undefined}
                      >
                        <SelectValue placeholder="Select blockchain" />
                      </SelectTrigger>
                      <SelectContent>
                        {chains.map((chain) => (
                          <SelectItem key={chain.id} value={chain.id}>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{chain.logo}</span>
                              <div>
                                <div className="font-medium">{chain.name}</div>
                                <div className="text-sm text-gray-500">{chain.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.chain && <p id="chain-error" className="text-red-500 text-sm" role="alert">{errors.chain}</p>}
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (ETH)</Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        step="0.001"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`text-lg h-12 pr-16 focus-ring ${errors.amount ? 'border-red-500' : ''}`}
                        aria-label="Enter amount in ETH"
                        aria-describedby={errors.amount ? 'amount-error' : 'amount-help'}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ETH
                      </div>
                    </div>
                    <p id="amount-help" className="text-sm text-gray-500 dark:text-gray-400">
                      Minimum: 0.001 ETH
                    </p>
                    {errors.amount && <p id="amount-error" className="text-red-500 text-sm" role="alert">{errors.amount}</p>}
                  </div>

                  {/* USD Equivalent */}
                  {amount && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
                      role="region"
                      aria-label="USD conversion preview"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">USD Equivalent</span>
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                      </div>
                      <div 
                        className="text-2xl font-bold text-gray-900 dark:text-white mt-1"
                        aria-label={`${parseFloat(usdEquivalent).toLocaleString()} US dollars`}
                      >
                        ${parseFloat(usdEquivalent).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Rate: 1 ETH = $3,250 USD
                      </div>
                    </motion.div>
                  )}

                  {/* Country Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={selectedCountry} onValueChange={(value) => {
                      setSelectedCountry(value);
                      setSelectedProvider('');
                    }}>
                      <SelectTrigger 
                        className={`h-12 focus-ring ${errors.country ? 'border-red-500' : ''}`}
                        aria-label="Select recipient country"
                        aria-describedby={errors.country ? 'country-error' : undefined}
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{country.flag}</span>
                              <span className="font-medium">{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p id="country-error" className="text-red-500 text-sm" role="alert">{errors.country}</p>}
                  </div>

                  {/* Provider Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="provider">Mobile Money Provider</Label>
                    <Select 
                      value={selectedProvider} 
                      onValueChange={setSelectedProvider}
                      disabled={!selectedCountry}
                    >
                      <SelectTrigger 
                        className={`h-12 focus-ring ${errors.provider ? 'border-red-500' : ''}`}
                        aria-label="Select mobile money provider"
                        aria-describedby={errors.provider ? 'provider-error' : undefined}
                        disabled={!selectedCountry}
                      >
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProviders.map((providerId) => {
                          const provider = providers[providerId as keyof typeof providers];
                          return (
                            <SelectItem key={providerId} value={providerId}>
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{provider.icon}</span>
                                <span className="font-medium">{provider.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.provider && <p id="provider-error" className="text-red-500 text-sm" role="alert">{errors.provider}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Recipient Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 901 234 5678"
                      value={recipientNumber}
                      onChange={(e) => setRecipientNumber(e.target.value)}
                      className={`text-lg h-12 focus-ring ${errors.phone ? 'border-red-500' : ''}`}
                      aria-label="Enter recipient phone number"
                      aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
                    />
                    <p id="phone-help" className="text-sm text-gray-500 dark:text-gray-400">
                      Include country code (e.g., +234 for Nigeria)
                    </p>
                    {errors.phone && <p id="phone-error" className="text-red-500 text-sm" role="alert">{errors.phone}</p>}
                  </div>

                  {/* Fee Display */}
                  <div 
                    className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50"
                    role="region"
                    aria-label="Fee information"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-800 dark:text-emerald-200">Transaction Fee</span>
                      </div>
                      <span className="text-2xl font-bold text-emerald-600" aria-label="Zero dollars fee">$0</span>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                      Only network gas fees apply
                    </p>
                  </div>

                  {/* Safety Notes */}
                  <div 
                    className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
                    role="region"
                    aria-label="Security information"
                  >
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Secure On-Chain Transaction</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Your transaction is secured by blockchain technology. Funds are never held by EthSpenda.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Convert & Send Button */}
                  <Button
                    onClick={handleConvertSend}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 focus-ring"
                    aria-label="Convert and send crypto to mobile money"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Convert & Send
                  </Button>
                </motion.div>
              ) : step === 'sending' ? (
                <motion.div
                  key="sending"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                  role="status"
                  aria-live="polite"
                  aria-label="Processing transaction"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Send className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Processing Transaction...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your transfer is being processed on the blockchain
                  </p>
                  {transactionHash && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg" role="region" aria-label="Transaction hash">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Transaction Hash:</p>
                      <p className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all" aria-label={`Transaction hash: ${transactionHash}`}>
                        {transactionHash}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="max-w-md" role="dialog" aria-labelledby="confirm-title" aria-describedby="confirm-description">
            <DialogHeader>
              <DialogTitle id="confirm-title" className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span>Confirm Transaction</span>
              </DialogTitle>
              <DialogDescription id="confirm-description">
                Please review your transaction details before confirming.
              </DialogDescription>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3" role="region" aria-label="Transaction summary">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                  <span className="font-semibold">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">USD Value:</span>
                  <span className="font-semibold">${parseFloat(usdEquivalent).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Network:</span>
                  <span className="font-semibold">{chains.find(c => c.id === selectedChain)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Recipient:</span>
                  <span className="font-semibold">{recipientNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Provider:</span>
                  <span className="font-semibold">{providers[selectedProvider as keyof typeof providers]?.name}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 dark:text-gray-300">Fee:</span>
                  <span className="font-semibold text-emerald-600">$0</span>
                </div>
              </div>
              <div className="flex space-x-3" role="group" aria-label="Confirmation actions">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 focus-ring"
                  aria-label="Cancel transaction"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmTransaction}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white border-0 focus-ring"
                  aria-label="Confirm and send transaction"
                >
                  Confirm & Send
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-md" role="dialog" aria-labelledby="success-title">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              
              <div>
                <h3 id="success-title" className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  Funds Sent Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your transaction has been completed
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3 text-left" role="region" aria-label="Transaction details">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Amount Sent:</span>
                  <span className="font-semibold">${parseFloat(usdEquivalent).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Network:</span>
                  <span className="font-semibold">{chains.find(c => c.id === selectedChain)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Recipient:</span>
                  <span className="font-semibold">{recipientNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Provider:</span>
                  <span className="font-semibold">{providers[selectedProvider as keyof typeof providers]?.name}</span>
                </div>
              </div>

              {transactionHash && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg" role="region" aria-label="Transaction hash details">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Transaction Hash:</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all flex-1" aria-label={`Transaction hash: ${transactionHash}`}>
                      {transactionHash.slice(0, 20)}...{transactionHash.slice(-10)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyTransactionHash}
                      className="h-8 w-8 p-0 focus-ring"
                      aria-label="Copy transaction hash"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 focus-ring"
                      aria-label="View transaction on blockchain explorer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3" role="group" aria-label="Success actions">
                <Button
                  variant="outline"
                  onClick={shareOnX}
                  className="flex-1 focus-ring"
                  aria-label="Share success on X (Twitter)"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on X
                </Button>
                <Button
                  onClick={resetForm}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white border-0 focus-ring"
                  aria-label="Send another transfer"
                >
                  Send Another
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Error Modal */}
        <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
          <DialogContent className="max-w-md" role="dialog" aria-labelledby="error-title">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <ErrorIcon className="w-8 h-8 text-white" />
              </motion.div>
              
              <div>
                <h3 id="error-title" className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {errorInfo.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {errorInfo.description}
                </p>
              </div>

              {errorType === 'insufficient' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50" role="region" aria-label="Balance information">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Current Balance:</strong> 0.5 ETH<br />
                    <strong>Required:</strong> {amount} ETH + gas fees
                  </p>
                </div>
              )}

              <div className="flex space-x-3" role="group" aria-label="Error actions">
                <Button
                  variant="outline"
                  onClick={() => setShowErrorModal(false)}
                  className="flex-1 focus-ring"
                  aria-label="Cancel and close error dialog"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRetry}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white border-0 focus-ring"
                  aria-label="Try transaction again"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}