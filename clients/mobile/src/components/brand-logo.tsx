import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { MessagesSquare } from 'lucide-react-native';
import { View } from 'react-native';

type BrandLogoProps = {
  className?: string;
  inverted?: boolean;
  compact?: boolean;
};

export function BrandLogo({ className, inverted = false, compact = false }: BrandLogoProps) {
  return (
    <View className={cn('flex-row items-center gap-2.5', className)}>
      <View
        className={cn(
          'items-center justify-center rounded-2xl bg-blue-600',
          compact ? 'size-9' : 'size-11'
        )}>
        <Icon as={MessagesSquare} className="text-white" size={compact ? 19 : 23} />
      </View>
      <Text
        className={cn(
          'font-bold tracking-tight',
          compact ? 'text-xl' : 'text-2xl',
          inverted && 'text-white'
        )}>
        Chillspace
      </Text>
    </View>
  );
}
