import { Globe, Zap, Network } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NetworkSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function NetworkSelector({ value, onValueChange }: NetworkSelectorProps) {
  const networks = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'L1', icon: Globe, color: 'text-blue-600' },
    { id: 'base', name: 'Base', symbol: 'L2', icon: Zap, color: 'text-blue-500' },
    { id: 'lisk', name: 'Lisk', symbol: 'L2', icon: Network, color: 'text-emerald-600' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-12" aria-label="Select network">
        <SelectValue placeholder="Select network" />
      </SelectTrigger>
      <SelectContent>
        {networks.map((network) => {
          const IconComponent = network.icon;
          return (
            <SelectItem key={network.id} value={network.id}>
              <div className="flex items-center space-x-3">
                <IconComponent className={`w-5 h-5 ${network.color}`} />
                <div className="text-left">
                  <div className="font-medium">{network.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{network.symbol}</div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}