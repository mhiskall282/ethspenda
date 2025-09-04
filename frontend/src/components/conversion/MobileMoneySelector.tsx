import { Smartphone, CreditCard, Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MobileMoneySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function MobileMoneySelector({ value, onValueChange }: MobileMoneySelectorProps) {
  const providers = [
    { id: 'mpesa', name: 'M-Pesa', country: 'Kenya', icon: Smartphone, color: 'text-emerald-600' },
    { id: 'mtn', name: 'MTN MoMo', country: 'Multiple', icon: CreditCard, color: 'text-yellow-600' },
    { id: 'airtel', name: 'Airtel Money', country: 'Multiple', icon: Wallet, color: 'text-red-600' },
    { id: 'opay', name: 'Opay', country: 'Nigeria', icon: Smartphone, color: 'text-blue-600' },
    { id: 'kuda', name: 'Kuda Bank', country: 'Nigeria', icon: CreditCard, color: 'text-purple-600' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-12" aria-label="Select mobile money provider">
        <SelectValue placeholder="Select mobile money provider" />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider) => {
          const IconComponent = provider.icon;
          return (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex items-center space-x-3">
                <IconComponent className={`w-5 h-5 ${provider.color}`} />
                <div className="text-left">
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{provider.country}</div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}