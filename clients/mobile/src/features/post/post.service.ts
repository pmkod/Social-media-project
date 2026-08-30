import { API_BASE_URL } from '@/core/config/api.config';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export function createPostFormData(text: string, medias: ImagePickerAsset[]) {
  const formData = new FormData();
  formData.append('text', text.trim());

  medias.forEach((asset, index) => {
    const webFile = (asset as ImagePickerAsset & { file?: File }).file;
    if (Platform.OS === 'web' && webFile) {
      formData.append('medias', webFile);
      return;
    }

    const fallbackExtension = asset.type === 'video' ? 'mp4' : 'jpg';
    const name = asset.fileName ?? `chillspace-media-${Date.now()}-${index}.${fallbackExtension}`;
    const type = asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');

    formData.append(
      'medias',
      {
        uri: asset.uri,
        name,
        type,
      } as unknown as Blob
    );
  });

  return formData;
}

export function buildMediaUrl(filename?: string | null, isVideo = false) {
  if (!filename) return '';
  if (/^(https?:|blob:|data:)/.test(filename)) return filename;
  const cleanFilename = filename.replace(/^\//, '');
  return `${API_BASE_URL}/${isVideo ? 'videos' : 'images'}/${cleanFilename}`;
}
