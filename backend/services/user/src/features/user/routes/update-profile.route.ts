import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { deleteFile, setFile } from "@/core/services/storage.service";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import {
	profileMediaSelect,
	serializeProfileMedia,
} from "../services/profile-media.service";
import { compressProfileMediaFile } from "../services/profile-media-compression.service";
import { UserRoutesTag } from "../user.constants";
import { UpdateProfileValidationSchema } from "../user.validation-schemas";

const routeDef = createRoute({
	method: "put",
	path: "/users/me",
	summary: "Update current authenticated user profile",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: UpdateProfileValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
		[HttpStatus.CONFLICT.code]: {
			description: "Username already exists",
		},
	},
});

const getFileExtension = (file: File) => {
	if (file.type === "image/webp") return "webp";
	return file.name.split(".").pop()?.toLowerCase() || "bin";
};

const removeStoredFiles = async (
	fileNames: Array<string | null | undefined>,
) => {
	await Promise.all(
		Array.from(
			new Set(
				fileNames.filter((fileName): fileName is string => Boolean(fileName)),
			),
		).map(async (fileName) => {
			try {
				await deleteFile({ fileName });
			} catch (error) {
				console.warn("Failed to remove previous profile image:", error);
			}
		}),
	);
};

const updateProfileRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) {
			throw new Error("Unauthorized");
		}

		const {
			username,
			fullName,
			bio,
			profilePicture,
			coverPicture,
			removeProfilePicture,
			removeCoverPicture,
		} = c.req.valid("form");
		const normalizedUsername = username.trim();
		const shouldRemoveProfilePicture = removeProfilePicture === "true";
		const shouldRemoveCoverPicture = removeCoverPicture === "true";

		const [existingUsernameUser, previousUser] = await Promise.all([
			prisma.user.findFirst({
				where: {
					username: normalizedUsername,
					NOT: { id: authenticatedUser.id },
				},
				select: { id: true },
			}),
			prisma.user.findUniqueOrThrow({
				where: { id: authenticatedUser.id },
				select: {
					lowQualityProfilePictureFile: {
						select: { id: true, filename: true },
					},
					bestQualityProfilePictureFile: {
						select: { id: true, filename: true },
					},
					lowQualityCoverPictureFile: {
						select: { id: true, filename: true },
					},
					bestQualityCoverPictureFile: {
						select: { id: true, filename: true },
					},
				},
			}),
		]);

		if (existingUsernameUser) {
			return c.json(
				{ message: "This username is already taken" },
				HttpStatus.CONFLICT.code,
			);
		}

		const timestamp = Date.now();
		let profilePictureFiles: {
			lowQualityFile: { id: string; filename: string };
			bestQualityFile: { id: string; filename: string };
		} | null = null;
		let coverPictureFiles: {
			lowQualityFile: { id: string; filename: string };
			bestQualityFile: { id: string; filename: string };
		} | null = null;

		if (profilePicture instanceof File) {
			const lowQualityProfilePictureFile = await compressProfileMediaFile({
				file: profilePicture,
				quality: 40,
			});
			const bestQualityProfilePictureFile = await compressProfileMediaFile({
				file: profilePicture,
				quality: 90,
			});
			const lowQualityProfilePictureFileName = `profile_${authenticatedUser.id}_low_${timestamp}.${getFileExtension(lowQualityProfilePictureFile)}`;
			const bestQualityProfilePictureFileName = `profile_${authenticatedUser.id}_best_${timestamp}.${getFileExtension(bestQualityProfilePictureFile)}`;

			await Promise.all([
				setFile({
					file: lowQualityProfilePictureFile,
					filename: lowQualityProfilePictureFileName,
				}),
				setFile({
					file: bestQualityProfilePictureFile,
					filename: bestQualityProfilePictureFileName,
				}),
			]);
			const [lowQualityFile, bestQualityFile] = await Promise.all([
				prisma.file.create({
					data: {
						filename: lowQualityProfilePictureFileName,
						mimeType: lowQualityProfilePictureFile.type,
					},
					select: { id: true, filename: true },
				}),
				prisma.file.create({
					data: {
						filename: bestQualityProfilePictureFileName,
						mimeType: bestQualityProfilePictureFile.type,
					},
					select: { id: true, filename: true },
				}),
			]);

			profilePictureFiles = {
				lowQualityFile,
				bestQualityFile,
			};
		}

		if (coverPicture instanceof File) {
			const lowQualityCoverPictureFile = await compressProfileMediaFile({
				file: coverPicture,
				quality: 40,
			});
			const bestQualityCoverPictureFile = await compressProfileMediaFile({
				file: coverPicture,
				quality: 90,
			});
			const lowQualityCoverPictureFileName = `cover_${authenticatedUser.id}_low_${timestamp}.${getFileExtension(lowQualityCoverPictureFile)}`;
			const bestQualityCoverPictureFileName = `cover_${authenticatedUser.id}_best_${timestamp}.${getFileExtension(bestQualityCoverPictureFile)}`;

			await Promise.all([
				setFile({
					file: lowQualityCoverPictureFile,
					filename: lowQualityCoverPictureFileName,
				}),
				setFile({
					file: bestQualityCoverPictureFile,
					filename: bestQualityCoverPictureFileName,
				}),
			]);
			const [lowQualityFile, bestQualityFile] = await Promise.all([
				prisma.file.create({
					data: {
						filename: lowQualityCoverPictureFileName,
						mimeType: lowQualityCoverPictureFile.type,
					},
					select: { id: true, filename: true },
				}),
				prisma.file.create({
					data: {
						filename: bestQualityCoverPictureFileName,
						mimeType: bestQualityCoverPictureFile.type,
					},
					select: { id: true, filename: true },
				}),
			]);

			coverPictureFiles = {
				lowQualityFile,
				bestQualityFile,
			};
		}

		const updatedUser = await prisma.user.update({
			where: { id: authenticatedUser.id },
			data: {
				username: normalizedUsername,
				fullName: fullName.trim(),
				bio: bio?.trim() || null,
				...(profilePictureFiles
					? {
							lowQualityProfilePictureFile: {
								connect: { id: profilePictureFiles.lowQualityFile.id },
							},
							bestQualityProfilePictureFile: {
								connect: { id: profilePictureFiles.bestQualityFile.id },
							},
						}
					: shouldRemoveProfilePicture
						? {
								lowQualityProfilePictureFile: { disconnect: true },
								bestQualityProfilePictureFile: { disconnect: true },
							}
						: {}),
				...(coverPictureFiles
					? {
							lowQualityCoverPictureFile: {
								connect: { id: coverPictureFiles.lowQualityFile.id },
							},
							bestQualityCoverPictureFile: {
								connect: { id: coverPictureFiles.bestQualityFile.id },
							},
						}
					: shouldRemoveCoverPicture
						? {
								lowQualityCoverPictureFile: { disconnect: true },
								bestQualityCoverPictureFile: { disconnect: true },
							}
						: {}),
			},
			select: {
				id: true,
				email: true,
				username: true,
				fullName: true,
				bio: true,
				...profileMediaSelect,
				postCount: true,
				followersCount: true,
				followingCount: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		const previousFileNames = [
			profilePictureFiles || shouldRemoveProfilePicture
				? previousUser.lowQualityProfilePictureFile?.filename
				: null,
			profilePictureFiles || shouldRemoveProfilePicture
				? previousUser.bestQualityProfilePictureFile?.filename
				: null,
			coverPictureFiles || shouldRemoveCoverPicture
				? previousUser.lowQualityCoverPictureFile?.filename
				: null,
			coverPictureFiles || shouldRemoveCoverPicture
				? previousUser.bestQualityCoverPictureFile?.filename
				: null,
		];
		await removeStoredFiles(previousFileNames);

		const previousFileIds = [
			profilePictureFiles || shouldRemoveProfilePicture
				? previousUser.lowQualityProfilePictureFile?.id
				: null,
			profilePictureFiles || shouldRemoveProfilePicture
				? previousUser.bestQualityProfilePictureFile?.id
				: null,
			coverPictureFiles || shouldRemoveCoverPicture
				? previousUser.lowQualityCoverPictureFile?.id
				: null,
			coverPictureFiles || shouldRemoveCoverPicture
				? previousUser.bestQualityCoverPictureFile?.id
				: null,
		].filter((id): id is string => Boolean(id));
		if (previousFileIds.length > 0) {
			await prisma.file.deleteMany({ where: { id: { in: previousFileIds } } });
		}

		return c.json(serializeProfileMedia(updatedUser));
	},
});

export { updateProfileRoute };
