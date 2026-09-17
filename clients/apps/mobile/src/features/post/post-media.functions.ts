import { ApiConfig } from "@/core/configs/api.config";

/**
 * Builds the full URL for the image download/streaming route.
 * @param fileName The image file name or full URL
 */
export function buildImageUrl(fileName?: string | null): string {
	if (!fileName) return "";
	if (
		fileName.startsWith("http://") ||
		fileName.startsWith("https://") ||
		fileName.startsWith("file://") ||
		fileName.startsWith("content://") ||
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
 * @param fileName The video file name or full URL
 */
export function buildVideoUrl(fileName?: string | null): string {
	if (!fileName) return "";
	if (
		fileName.startsWith("http://") ||
		fileName.startsWith("https://") ||
		fileName.startsWith("file://") ||
		fileName.startsWith("content://") ||
		fileName.startsWith("blob:") ||
		fileName.startsWith("data:")
	) {
		return fileName;
	}
	const cleanFileName = fileName.startsWith("/") ? fileName.slice(1) : fileName;
	return `${ApiConfig.baseUrl}/videos/${cleanFileName}`;
}
