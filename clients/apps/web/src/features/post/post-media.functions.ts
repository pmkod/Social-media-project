import { ApiConfig } from "@/core/configs/api.config";

/**
 * Builds the full URL for the image download/streaming route.
 * @param fileName The image file name (e.g. "upload_high_12345.webp") or its path/URL
 * @returns L'URL de la route /images/$fileName
 */
export function buildImageUrl(fileName?: string | null): string {
	if (!fileName) return "";
	if (
		fileName.startsWith("http://") ||
		fileName.startsWith("https://") ||
		fileName.startsWith("blob:") ||
		fileName.startsWith("data:")
	) {
		return fileName;
	}
	const cleanFileName = fileName.startsWith("/") ? fileName.slice(1) : fileName;
	return `${ApiConfig.baseUrl}/images/${cleanFileName}`;
}

/**
 * Builds the full URL for the video streaming route.
 * @param fileName The video file name (e.g. "upload_high_12345.mp4") or its path/URL
 * @returns L'URL de la route /videos/$fileName
 */
export function buildVideoUrl(fileName?: string | null): string {
	if (!fileName) return "";
	if (
		fileName.startsWith("http://") ||
		fileName.startsWith("https://") ||
		fileName.startsWith("blob:") ||
		fileName.startsWith("data:")
	) {
		return fileName;
	}
	const cleanFileName = fileName.startsWith("/") ? fileName.slice(1) : fileName;
	return `${ApiConfig.baseUrl}/videos/${cleanFileName}`;
}

/**
 * Backward-compatible aliases
 */
export const buildPostImageUrl = buildImageUrl;
export const buildPostVideoUrl = buildVideoUrl;
export const postVideoUrl = buildVideoUrl;
