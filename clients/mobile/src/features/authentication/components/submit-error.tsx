import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircleAlert } from 'lucide-react-native';

export function SubmitError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <Alert icon={CircleAlert} variant="destructive" className="mb-1">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
