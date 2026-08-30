import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import type { AuthUser } from '@/core/auth/auth.types';
import { buildMediaUrl } from '@/features/post/post.service';
import type { PostAuthor } from '@/features/post/post.types';
import { cn } from '@/lib/utils';
import { UserRound } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

function getInitials(name?: string | null) {
  if (!name?.trim()) return '';
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''}`.toUpperCase();
}

type UserAvatarProps = {
  user?: PostAuthor | AuthUser | null;
  className?: string;
};

export function UserAvatar({ user, className }: UserAvatarProps) {
  const postAuthor = user as PostAuthor | null | undefined;
  const filename =
    postAuthor?.lowQualityProfilePictureFile?.filename ??
    postAuthor?.bestQualityProfilePictureFile?.filename;
  const imageUrl = buildMediaUrl(filename);
  const initials = getInitials(user?.fullName);

  return (
    <Avatar className={cn('size-11 border border-border', className)} alt={user?.fullName ?? 'User'}>
      {imageUrl ? <AvatarImage source={{ uri: imageUrl }} /> : null}
      <AvatarFallback>
        {initials ? (
          <Text className="text-sm font-bold">{initials}</Text>
        ) : (
          <Icon as={UserRound} className="text-muted-foreground" size={19} />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
