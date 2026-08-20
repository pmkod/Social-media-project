import { getPublicFileUrl } from "@/core/services/storage.service";
import type { Prisma } from "@/generated/prisma/client";

const profileMediaSelect = {
	lowQualityProfilePictureFile: { select: { filename: true } },
	bestQualityProfilePictureFile: { select: { filename: true } },
	lowQualityCoverPictureFile: { select: { filename: true } },
	bestQualityCoverPictureFile: { select: { filename: true } },
} satisfies Prisma.UserSelect;

type UserWithProfileMedia = Prisma.UserGetPayload<{
	select: typeof profileMediaSelect;
}>;

const serializeProfileMedia = <T extends UserWithProfileMedia>(user: T) => {
	const {
		lowQualityProfilePictureFile,
		bestQualityProfilePictureFile,
		lowQualityCoverPictureFile,
		bestQualityCoverPictureFile,
		...userWithoutFiles
	} = user;

	return {
		...userWithoutFiles,
		profilePictureUrl: bestQualityProfilePictureFile
			? getPublicFileUrl(bestQualityProfilePictureFile.filename)
			: null,
		lowQualityProfilePictureUrl: lowQualityProfilePictureFile
			? getPublicFileUrl(lowQualityProfilePictureFile.filename)
			: null,
		coverPictureUrl: bestQualityCoverPictureFile
			? getPublicFileUrl(bestQualityCoverPictureFile.filename)
			: null,
		lowQualityCoverPictureUrl: lowQualityCoverPictureFile
			? getPublicFileUrl(lowQualityCoverPictureFile.filename)
			: null,
	};
};

export { profileMediaSelect, serializeProfileMedia };
