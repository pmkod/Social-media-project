import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

type PasswordInputProps = React.ComponentProps<typeof Input>;

function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="relative justify-center">
      <Input {...props} className="h-13 pr-12" secureTextEntry={!isVisible} />
      <Button
        accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
        className="absolute right-1"
        variant="ghost"
        size="icon"
        onPress={() => setIsVisible((value) => !value)}>
        <Icon as={isVisible ? EyeOff : Eye} className="text-muted-foreground" size={19} />
      </Button>
    </View>
  );
}

export { PasswordInput };
export type { PasswordInputProps };
