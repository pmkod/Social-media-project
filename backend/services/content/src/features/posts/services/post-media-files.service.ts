import { prisma } from "@/core/databases";
import type { Prisma } from "@/generated/prisma/client";

const postMediaWithFileIdsSelect = {
	id: true,
	postId: true,
	position: true,
	mediaType: true,
	createdAt: true,
	lowQualityFileId: true,
	highQualityFileId: true,
} satisfies Prisma.PostMediaSelect;

type PostMediaWithFileIds = Prisma.PostMediaGetPayload<{
	select: typeof postMediaWithFileIdsSelect;
}>;

const hydratePostMediaFiles = async <
	TPost extends { medias: PostMediaWithFileIds[] },
>(posts: TPost[]) => {
	const fileIds = Array.from(
		new Set(
			posts.flatMap((post) =>
				post.medias.flatMap((media) => [
					media.lowQualityFileId,
					media.highQualityFileId,
				]),
			),
		),
	).filter((fileId): fileId is string => Boolean(fileId));

	const files =
		fileIds.length > 0
			? await prisma.file.findMany({
					where: { id: { in: fileIds } },
					select: {
						id: true,
						mimeType: true,
						filename: true,
						createdAt: true,
					},
				})
			: [];
	const filesById = new Map(files.map((file) => [file.id, file]));

	return posts.map((post) => ({
		...post,
		medias: post.medias.map((media) => ({
			...media,
			lowQualityFile: media.lowQualityFileId
				? (filesById.get(media.lowQualityFileId) ?? null)
				: null,
			highQualityFile: media.highQualityFileId
				? (filesById.get(media.highQualityFileId) ?? null)
				: null,
		})),
	}));
};

export { hydratePostMediaFiles, postMediaWithFileIdsSelect };
