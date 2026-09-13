import { prisma } from "@/core/databases";

type UserProfileMediaFileIds = {
	id: string;
	lowQualityProfilePictureFileId: string | null;
	bestQualityProfilePictureFileId: string | null;
	lowQualityCoverPictureFileId?: string | null;
	bestQualityCoverPictureFileId?: string | null;
};

type ProfileMediaFiles = {
	lowQualityProfilePictureFile: { id: string; filename: string } | null;
	bestQualityProfilePictureFile: { id: string; filename: string } | null;
	lowQualityCoverPictureFile: { id: string; filename: string } | null;
	bestQualityCoverPictureFile: { id: string; filename: string } | null;
};

const emptyProfileMediaFiles: ProfileMediaFiles = {
	lowQualityProfilePictureFile: null,
	bestQualityProfilePictureFile: null,
	lowQualityCoverPictureFile: null,
	bestQualityCoverPictureFile: null,
};

const getProfileMediaFilesByUsers = async (
	users: UserProfileMediaFileIds[],
) => {
	const fileIds = Array.from(
		new Set(
			users.flatMap((user) => [
				user.lowQualityProfilePictureFileId,
				user.bestQualityProfilePictureFileId,
				user.lowQualityCoverPictureFileId,
				user.bestQualityCoverPictureFileId,
			]),
		),
	).filter((fileId): fileId is string => Boolean(fileId));

	if (fileIds.length === 0) {
		return new Map(users.map((user) => [user.id, emptyProfileMediaFiles]));
	}

	const files = await prisma.file.findMany({
		where: { id: { in: fileIds } },
		select: { id: true, filename: true },
	});
	const filesById = new Map(files.map((file) => [file.id, file]));
	const getFile = (fileId: string | null | undefined) =>
		fileId ? (filesById.get(fileId) ?? null) : null;

	return new Map(
		users.map((user) => [
			user.id,
			{
				lowQualityProfilePictureFile: getFile(
					user.lowQualityProfilePictureFileId,
				),
				bestQualityProfilePictureFile: getFile(
					user.bestQualityProfilePictureFileId,
				),
				lowQualityCoverPictureFile: getFile(user.lowQualityCoverPictureFileId),
				bestQualityCoverPictureFile: getFile(
					user.bestQualityCoverPictureFileId,
				),
			},
		]),
	);
};

export { emptyProfileMediaFiles, getProfileMediaFilesByUsers };
