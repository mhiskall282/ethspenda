import { Bitcoin, Coins } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TokenSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TokenSelector({ value, onValueChange }: TokenSelectorProps) {
  const tokens = [
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH', icon: Bitcoin },
    { id: 'USDC', name: 'USD Coin', symbol: 'USDC', icon: Coins },
    { id: 'USDT', name: 'Tether', symbol: 'USDT', icon: Coins },
    { id: 'DAI', name: 'Dai Stablecoin', symbol: 'DAI', icon: Coins },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-12" aria-label="Select token">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => {
          const IconComponent = token.icon;
          return (
            <SelectItem key={token.id} value={token.id}>
              <div className="flex items-center space-x-3">
                <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div className="text-left">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{token.name}</div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}