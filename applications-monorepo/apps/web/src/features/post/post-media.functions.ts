import { ApiConfig } from "@/core/configs/api.config";

/**
 * Builds the full URL for the image download/streaming route.
 * @param fileName The image file name (e.g. "upload_high_12345.webp") or its path/URL
 * @returns L'URL de la route /content/get-image/$fileName
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
	return `${ApiConfig.baseUrl}/content/get-image/${cleanFileName}`;
}

/**
 * Builds the full URL for the video streaming route.
 * @param fileName The video file name (e.g. "upload_high_12345.mp4") or its path/URL
 * @returns L'URL de la route /content/get-video/$fileName
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
	return `${ApiConfig.baseUrl}/content/get-video/${cleanFileName}`;
}
