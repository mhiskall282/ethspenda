// Real-time price data service using CoinGecko API
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export interface PriceData {
  usd: number
  usd_24h_change: number
  last_updated_at: number
}

export interface TokenPrices {
  [tokenId: string]: PriceData
}

class PriceService {
  private cache: Map<string, { data: TokenPrices; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 60000 // 1 minute cache

  async getTokenPrices(tokenIds: string[]): Promise<TokenPrices> {
    const cacheKey = tokenIds.sort().join(',')
    const cached = this.cache.get(cacheKey)
    
    // Return cached data if still fresh
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`
      )
      
      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform to our format
      const priceData: TokenPrices = {}
      for (const [tokenId, tokenData] of Object.entries(data)) {
        priceData[tokenId] = {
          usd: (tokenData as any).usd,
          usd_24h_change: (tokenData as any).usd_24h_change || 0,
          last_updated_at: (tokenData as any).last_updated_at || Date.now() / 1000
        }
      }
      
      // Cache the result
      this.cache.set(cacheKey, { data: priceData, timestamp: Date.now() })
      
      return priceData
    } catch (error) {
      console.error('Failed to fetch prices:', error)
      
      // Return cached data if available, even if stale
      if (cached) {
        console.warn('Using stale price data due to API error')
        return cached.data
      }
      
      // Fallback to default prices if no cache available
      console.warn('Using fallback prices due to API error')
      return this.getFallbackPrices(tokenIds)
    }
  }

  async getEthPrice(): Promise<number> {
    try {
      const prices = await this.getTokenPrices(['ethereum'])
      return prices.ethereum?.usd || 0
    } catch (error) {
      console.error('Failed to get ETH price:', error)
      return 0
    }
  }

  async getEthPriceWithChange(): Promise<{ price: number; change24h: number }> {
    try {
      const prices = await this.getTokenPrices(['ethereum'])
      const ethData = prices.ethereum
      return {
        price: ethData?.usd || 0,
        change24h: ethData?.usd_24h_change || 0
      }
    } catch (error) {
      console.error('Failed to get ETH price with change:', error)
      return { price: 0, change24h: 0 }
    }
  }

  private getFallbackPrices(tokenIds: string[]): TokenPrices {
    const fallbackPrices: TokenPrices = {}
    
    for (const tokenId of tokenIds) {
      switch (tokenId) {
        case 'ethereum':
          fallbackPrices[tokenId] = {
            usd: 2500, // Conservative fallback price
            usd_24h_change: 0,
            last_updated_at: Date.now() / 1000
          }
          break
        case 'usd-coin':
          fallbackPrices[tokenId] = {
            usd: 1.0,
            usd_24h_change: 0,
            last_updated_at: Date.now() / 1000
          }
          break
        case 'tether':
          fallbackPrices[tokenId] = {
            usd: 1.0,
            usd_24h_change: 0,
            last_updated_at: Date.now() / 1000
          }
          break
        default:
          fallbackPrices[tokenId] = {
            usd: 0,
            usd_24h_change: 0,
            last_updated_at: Date.now() / 1000
          }
      }
    }
    
    return fallbackPrices
  }

  // Get exchange rates for supported fiat currencies
  async getFiatExchangeRates(): Promise<Record<string, number>> {
    try {
      // Using a free exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Extract rates for supported African currencies
      return {
        KES: data.rates.KES || 150, // Kenya Shilling
        NGN: data.rates.NGN || 800, // Nigerian Naira  
        GHS: data.rates.GHS || 12,  // Ghanaian Cedi
        UGX: data.rates.UGX || 3700, // Ugandan Shilling
        TZS: data.rates.TZS || 2300, // Tanzanian Shilling
        RWF: data.rates.RWF || 1100, // Rwandan Franc
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
      
      // Fallback exchange rates (approximate)
      return {
        KES: 150,
        NGN: 800, 
        GHS: 12,
        UGX: 3700,
        TZS: 2300,
        RWF: 1100,
      }
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const priceService = new PriceService()

// React hook for real-time price data
export function useRealTimePrice(tokenSymbol: string = 'ethereum') {
  const [priceData, setPriceData] = React.useState<{
    price: number
    change24h: number
    loading: boolean
    error: string | null
  }>({
    price: 0,
    change24h: 0,
    loading: true,
    error: null
  })

  React.useEffect(() => {
    let interval: NodeJS.Timeout

    const fetchPrice = async () => {
      try {
        setPriceData(prev => ({ ...prev, loading: true, error: null }))
        
        const { price, change24h } = await priceService.getEthPriceWithChange()
        
        setPriceData({
          price,
          change24h,
          loading: false,
          error: null
        })
      } catch (error) {
        setPriceData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      }
    }

    // Initial fetch
    fetchPrice()

    // Update every 30 seconds
    interval = setInterval(fetchPrice, 30000)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [tokenSymbol])

  return priceData
}

// Add React import for the hook
import React from 'react'
