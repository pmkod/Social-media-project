import type { Prisma } from "@/generated/prisma/client";

const profileMediaSelect = {
	lowQualityProfilePictureFile: { select: { id: true, filename: true } },
	bestQualityProfilePictureFile: { select: { id: true, filename: true } },
	lowQualityCoverPictureFile: { select: { id: true, filename: true } },
	bestQualityCoverPictureFile: { select: { id: true, filename: true } },
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
		lowQualityProfilePictureFile: lowQualityProfilePictureFile
			? {
					id: lowQualityProfilePictureFile.id,
					name: lowQualityProfilePictureFile.filename,
				}
			: null,
		bestQualityProfilePictureFile: bestQualityProfilePictureFile
			? {
					id: bestQualityProfilePictureFile.id,
					name: bestQualityProfilePictureFile.filename,
				}
			: null,
		lowQualityCoverPictureFile: lowQualityCoverPictureFile
			? {
					id: lowQualityCoverPictureFile.id,
					name: lowQualityCoverPictureFile.filename,
				}
			: null,
		bestQualityCoverPictureFile: bestQualityCoverPictureFile
			? {
					id: bestQualityCoverPictureFile.id,
					name: bestQualityCoverPictureFile.filename,
				}
			: null,
	};
};

export { profileMediaSelect, serializeProfileMedia };
