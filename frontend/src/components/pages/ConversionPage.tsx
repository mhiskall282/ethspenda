import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Wallet, Send, CheckCircle2, Shield, AlertTriangle, RefreshCw, Copy, Share2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { useEthSpenda, usePhoneValidation } from '@/hooks/useWeb3';
import { useRealTimePrice } from '@/services/priceService';
import { SUPPORTED_COUNTRIES, MOBILE_MONEY_PROVIDERS } from '@/config/web3';

export function ConversionPage() {
  // Web3 hooks
  const { isConnected } = useAccount();
  const { 
    initiateTransfer, 
    isTransactionPending, 
    transactionHash: contractTransactionHash,
    minTransferAmount,
    contractETHPrice
  } = useEthSpenda();
  
  // Real-time price data
  const { price: liveETHPrice, loading: priceLoading } = useRealTimePrice('ethereum');
  
  // Phone validation
  const { validatePhone } = usePhoneValidation();
  
  // Use contract price if available, otherwise use live price
  const ethPrice = contractETHPrice || liveETHPrice || 2500; // fallback to conservative price
  
  // UI State
  const [step, setStep] = useState<'form' | 'connecting' | 'confirming' | 'sending' | 'success' | 'error'>('form');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorType, setErrorType] = useState<'insufficient' | 'network' | 'validation' | 'unknown'>('unknown');
  
  // Form State
  const [amount, setAmount] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('base');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Networks - these could be expanded based on deployment
  const networks = [
    { id: 'base', name: 'Base', symbol: 'ETH', logo: '🔵', description: 'Fast & Low Cost' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', logo: '⚡', description: 'Most Secure' },
    { id: 'lisk', name: 'Lisk', symbol: 'LSK', logo: '🟢', description: 'Developer Friendly' },
  ];

  // Use real data from config
  const countries = SUPPORTED_COUNTRIES;
  const providers = MOBILE_MONEY_PROVIDERS;

  // Derived data
  const selectedCountryData = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry);
  const availableProviders = selectedCountryData?.providers || [];

  // Calculate USD equivalent
  const usdEquivalent = (parseFloat(amount || '0') * ethPrice).toFixed(2);

  const handleConnectWallet = async () => {
    // The wallet connection is now handled by the Header component
    // This function is kept for backward compatibility
    toast({
      title: "Wallet Connection",
      description: "Please use the Connect Wallet button in the header.",
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!selectedNetwork) {
      newErrors.network = 'Please select a blockchain';
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
    
    try {
      // Validate inputs before sending
      if (!amount || !recipientNumber || !selectedCountry || !selectedProvider) {
        throw new Error('Please fill in all required fields');
      }
      
      // Validate phone number
      const phoneValidation = validatePhone(recipientNumber, selectedCountry);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message || 'Invalid phone number');
      }
      
      // Check minimum amount
      const minAmount = parseFloat(minTransferAmount || '0.001');
      if (parseFloat(amount) < minAmount) {
        throw new Error(`Minimum transfer amount is ${minAmount} ETH`);
      }
      
      // Initiate real blockchain transaction
      await initiateTransfer(
        '0x0000000000000000000000000000000000000000', // ETH address
        amount,
        recipientNumber,
        selectedCountry,
        selectedProvider
      );
      
      // Transaction hash will be available from the hook
      setStep('success');
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      // Set appropriate error type based on error message
      if (error.message?.includes('insufficient')) {
        setErrorType('insufficient');
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        setErrorType('network');
      } else if (error.message?.includes('phone') || error.message?.includes('minimum')) {
        setErrorType('validation');
      } else {
        setErrorType('unknown');
      }
      
      setStep('error');
      setShowErrorModal(true);
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setStep('form');
  };

  const resetForm = () => {
    setAmount('');
    setRecipientNumber('');
    setSelectedNetwork('base');
    setSelectedCountry('');
    setSelectedProvider('');
    setErrors({});
    setStep('form');
    setShowSuccessModal(false);
    setShowErrorModal(false);
  };

  const copyTransactionHash = () => {
    if (contractTransactionHash) {
      navigator.clipboard.writeText(contractTransactionHash);
      toast({
        title: "Copied!",
        description: "Transaction hash copied to clipboard",
      });
    }
  };

  const shareTransaction = () => {
    if (contractTransactionHash) {
      const url = `https://etherscan.io/tx/${contractTransactionHash}`;
      navigator.share({
        title: 'EthSpenda Transaction',
        text: 'Check out my crypto-to-mobile money transfer',
        url: url,
      }).catch(() => {
        // Fallback to copying URL
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "Transaction link copied to clipboard",
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Send Crypto to Mobile Money
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Convert your cryptocurrency to mobile money in seconds
            </p>
          </motion.div>

          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                <Send className="w-6 h-6 text-blue-600" />
                Quick Transfer
              </CardTitle>
              <CardDescription>
                Fast, secure, and affordable crypto-to-mobile money transfers
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {!isConnected ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <Wallet className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Please connect your wallet to start sending transfers
                    </p>
                    <Button onClick={handleConnectWallet} size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Network Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="network">Blockchain Network</Label>
                      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectTrigger 
                          className={`h-12 focus-ring ${errors.network ? 'border-red-500' : ''}`}
                          aria-label="Select blockchain network"
                          aria-describedby={errors.network ? 'network-error' : undefined}
                        >
                          <SelectValue placeholder="Select blockchain" />
                        </SelectTrigger>
                        <SelectContent>
                          {networks.map((network) => (
                            <SelectItem key={network.id} value={network.id}>
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{network.logo}</span>
                                <div>
                                  <div className="font-medium">{network.name}</div>
                                  <div className="text-sm text-gray-500">{network.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.network && <p id="network-error" className="text-red-500 text-sm" role="alert">{errors.network}</p>}
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount to Send</Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={`text-2xl h-16 pr-16 focus-ring ${errors.amount ? 'border-red-500' : ''}`}
                          aria-label="Amount to send"
                          aria-describedby={errors.amount ? 'amount-error' : undefined}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          ETH
                        </div>
                      </div>
                      {errors.amount && <p id="amount-error" className="text-red-500 text-sm" role="alert">{errors.amount}</p>}
                      
                      {/* Price Display */}
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
                            ≈ ${usdEquivalent} USD
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Rate: 1 ETH = ${ethPrice.toLocaleString()} USD {priceLoading && '(Loading...)'}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Country Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="country">Recipient Country</Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger 
                          className={`h-12 focus-ring ${errors.country ? 'border-red-500' : ''}`}
                          aria-label="Select recipient country"
                          aria-describedby={errors.country ? 'country-error' : undefined}
                        >
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
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
                        placeholder={selectedCountryData?.phoneFormat || "+234 901 234 5678"}
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

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={handleConvertSend}
                        disabled={isTransactionPending || step === 'sending'}
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {step === 'sending' ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Transfer
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Security Note */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Protected by blockchain security and smart contracts</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Confirmation Modal */}
          <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Confirm Transfer
                </DialogTitle>
                <DialogDescription>
                  Please review your transfer details before confirming
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
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
                    <span className="font-semibold">{networks.find(n => n.id === selectedNetwork)?.name}</span>
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
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmTransaction}
                    disabled={isTransactionPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isTransactionPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm Transfer'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Success Modal */}
          <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  Transfer Successful!
                </DialogTitle>
                <DialogDescription>
                  Your transfer has been completed successfully
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Amount Sent:</span>
                    <span className="font-semibold">${parseFloat(usdEquivalent).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Network:</span>
                    <span className="font-semibold">{networks.find(n => n.id === selectedNetwork)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Recipient:</span>
                    <span className="font-semibold">{recipientNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Provider:</span>
                    <span className="font-semibold">{providers[selectedProvider as keyof typeof providers]?.name}</span>
                  </div>
                  
                  {contractTransactionHash && (
                    <div className="pt-2 border-t border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Transaction:</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyTransactionHash}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={shareTransaction}
                            className="h-8 w-8 p-0"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a 
                              href={`https://etherscan.io/tx/${contractTransactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {contractTransactionHash?.slice(0, 20)}...
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={resetForm}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Send Another
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Error Modal */}
          <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Transfer Failed
                </DialogTitle>
                <DialogDescription>
                  {errorType === 'insufficient' && 'Insufficient funds for this transaction'}
                  {errorType === 'network' && 'Network connection error. Please try again.'}
                  {errorType === 'validation' && 'Please check your input and try again.'}
                  {errorType === 'unknown' && 'An unexpected error occurred. Please try again.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowErrorModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRetry}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
    </div>
  );
}
