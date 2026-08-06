import { ApiConfig } from "@/core/configs/api.config";

/**
 * Construit l'URL complète pour la route de téléchargement/streaming d'une image.
 * @param fileName Le nom du fichier image (ex: "upload_high_12345.webp") ou son chemin/URL
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
 * Construit l'URL complète pour la route de streaming d'une vidéo.
 * @param fileName Le nom du fichier vidéo (ex: "upload_high_12345.mp4") ou son chemin/URL
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
 * Aliases de rétrocompatibilité
 */
export const buildPostImageUrl = buildImageUrl;
export const buildPostVideoUrl = buildVideoUrl;
export const postVideoUrl = buildVideoUrl;
