import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { Configurations } from "@/core/configurations";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { PostsRoutesTag } from "../posts.constants";

const getFilePublicUrl = (filename?: string | null): string => {
	if (!filename) return "";
	const publicUrl =
		Configurations.storage.s3.publicUrl ||
		`${Configurations.storage.s3.endpoint}/${Configurations.storage.s3.bucket}`;
	return `${publicUrl}/${filename}`;
};

const routeDef = createRoute({
	method: "get",
	path: "/posts/{id}",
	summary: "Get single post by ID",
	tags: [PostsRoutesTag],
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Post details with medias",
		},
	},
});

const getPostByIdRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { id } = c.req.valid("param");

		const post = await prisma.post.findUnique({
			where: { id },
			select: {
				id: true,
				authorId: true,
				content: true,
				createdAt: true,
				updatedAt: true,
				medias: {
					select: {
						id: true,
						position: true,
						mediaType: true,
						lowQualityFile: {
							select: {
								id: true,
								mimeType: true,
								filename: true,
							},
						},
						highQualityFile: {
							select: {
								id: true,
								mimeType: true,
								filename: true,
							},
						},
					},
					orderBy: { position: "asc" },
				},
				_count: {
					select: {
						comments: true,
						postLikes: true,
					},
				},
			},
		});

		if (!post) {
			throw new Error("Post not found");
		}

		const { content, medias, ...rest } = post;

		const formattedMedias = (medias || []).map((m) => ({
			id: m.id,
			position: m.position,
			mediaType: m.mediaType,
			lowQualityUrl: getFilePublicUrl(m.lowQualityFile?.filename),
			highQualityUrl: getFilePublicUrl(m.highQualityFile?.filename),
			lowQualityFile: m.lowQualityFile,
			highQualityFile: m.highQualityFile,
		}));

		return c.json({
			...rest,
			text: content,
			medias: formattedMedias,
			mediaUrls: formattedMedias.map(
				(m) => m.highQualityUrl || m.lowQualityUrl,
			),
		});
	},
});

export { getPostByIdRoute };
