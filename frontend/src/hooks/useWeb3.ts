import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, Address } from 'viem'
import { CONTRACTS, ETHSPENDA_ABI } from '../config/web3'
import { useState, useCallback } from 'react'
import { priceService } from '../services/priceService'

export function useEthSpenda() {
  const { address, chain } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null)

  // Get contract address for current chain
    const getContractAddress = (): Address | undefined => {
    const chainId = chain?.id
    if (!chainId || !CONTRACTS[chainId as keyof typeof CONTRACTS]) return undefined
    return CONTRACTS[chainId as keyof typeof CONTRACTS]?.ethSpendaAddress as Address
  }

  // Read minimum transfer amount
  const { data: minTransferAmount } = useReadContract({
    address: getContractAddress(),
    abi: ETHSPENDA_ABI,
    functionName: 'MIN_TRANSFER_AMOUNT',
  })

  // Read ETH price from contract
  const { data: ethPriceData } = useReadContract({
    address: getContractAddress(),
    abi: ETHSPENDA_ABI,
    functionName: 'getLatestPrice',
    args: ['0x0000000000000000000000000000000000000000'], // ETH address
  })

  // Initiate transfer function
  const initiateTransfer = useCallback(async (
    tokenAddress: string,
    amount: string,
    phoneNumber: string,
    countryCode: string,
    provider: string
  ) => {
    const contractAddress = getContractAddress()
    if (!contractAddress) {
      throw new Error('Contract not available on this network')
    }

    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      const amountWei = parseEther(amount)
      
      // For ETH transfers, send value with transaction
      const value = tokenAddress === '0x0000000000000000000000000000000000000000' ? amountWei : 0n

      writeContract({
        address: contractAddress,
        abi: ETHSPENDA_ABI,
        functionName: 'initiateTransfer',
        args: [tokenAddress as Address, amountWei, phoneNumber, countryCode, provider],
        value,
      })

      if (hash) {
        setLastTransactionHash(hash)
      }

      return hash
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }, [address, writeContract, hash, getContractAddress])

  // Get transfer details
  const { data: transferData, refetch: refetchTransfer } = useReadContract({
    address: getContractAddress(),
    abi: ETHSPENDA_ABI,
    functionName: 'getTransfer',
    args: [lastTransactionHash as `0x${string}`],
    query: {
      enabled: !!lastTransactionHash,
    },
  })

  // Calculate USD value of amount
  const calculateUSDValue = useCallback(async (amount: string) => {
    const contractAddress = getContractAddress()
    if (!contractAddress) return null

    try {
      // Get current ETH price from price service
      const ethPrice = await priceService.getEthPrice()
      const numericAmount = parseFloat(amount)
      return numericAmount * ethPrice
    } catch (error) {
      console.error('Failed to calculate USD value:', error)
      return null
    }
  }, [getContractAddress])

  // Get formatted minimum amount
  const getMinimumAmountFormatted = useCallback(() => {
    if (!minTransferAmount) return '0'
    return formatEther(minTransferAmount)
  }, [minTransferAmount])

  // Get ETH price from contract
  const getContractETHPrice = useCallback(() => {
    if (!ethPriceData) return null
    
    const [price] = ethPriceData as [bigint, bigint]
    // Chainlink prices are in 8 decimals, convert to regular number
    return Number(price) / 1e8
  }, [ethPriceData])

  return {
    // Contract interaction
    initiateTransfer,
    calculateUSDValue,
    
    // Transaction state
    isTransactionPending: isPending,
    isTransactionConfirming: isConfirming,
    isTransactionConfirmed: isConfirmed,
    transactionHash: hash,
    lastTransactionHash,
    
    // Contract data
    minTransferAmount: getMinimumAmountFormatted(),
    contractETHPrice: getContractETHPrice(),
    transferData,
    refetchTransfer,
    
    // Wallet state
    isConnected: !!address,
    userAddress: address,
    chain,
    contractAddress: getContractAddress(),
  }
}

// Hook for validating phone numbers based on country
export function usePhoneValidation() {
  const validatePhone = useCallback((phone: string, countryCode: string): { isValid: boolean; message?: string } => {
    if (!phone || !countryCode) {
      return { isValid: false, message: 'Phone number and country are required' }
    }

    // Remove spaces and special characters except +
    const cleanPhone = phone.replace(/[\s\-()]/g, '')
    
    // Country-specific validation patterns
    const patterns: Record<string, { pattern: RegExp; example: string }> = {
      KE: { pattern: /^\+254[0-9]{9}$/, example: '+254712345678' },
      NG: { pattern: /^\+234[0-9]{10}$/, example: '+2349012345678' },
      GH: { pattern: /^\+233[0-9]{9}$/, example: '+233501234567' },
      UG: { pattern: /^\+256[0-9]{9}$/, example: '+256712345678' },
      TZ: { pattern: /^\+255[0-9]{9}$/, example: '+255712345678' },
      RW: { pattern: /^\+250[0-9]{9}$/, example: '+250712345678' },
    }

    const countryPattern = patterns[countryCode]
    if (!countryPattern) {
      return { isValid: false, message: 'Unsupported country code' }
    }

    if (!countryPattern.pattern.test(cleanPhone)) {
      return { 
        isValid: false, 
        message: `Invalid phone format. Expected: ${countryPattern.example}` 
      }
    }

    return { isValid: true }
  }, [])

  return { validatePhone }
}

// Hook for currency conversion
export function useCurrencyConverter() {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const fetchExchangeRates = useCallback(async () => {
    setLoading(true)
    try {
      // This would use the price service to get exchange rates
      const rates = {
        KES: 150,
        NGN: 800,
        GHS: 12,
        UGX: 3700,
        TZS: 2300,
        RWF: 1100,
      }
      setExchangeRates(rates)
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const convertUSDToLocal = useCallback((usdAmount: number, currencyCode: string): number => {
    const rate = exchangeRates[currencyCode]
    if (!rate) return 0
    return usdAmount * rate
  }, [exchangeRates])

  return {
    exchangeRates,
    loading,
    fetchExchangeRates,
    convertUSDToLocal,
  }
}
