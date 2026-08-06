import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";
import { CreateCommentValidationSchema } from "../comments.validation-schemas";
import { createCommentMedias } from "../services/comment-media.service";

const CreateCommentRequestBody = z.object({
	content: CreateCommentValidationSchema.shape.content.optional(),
	medias: CreateCommentValidationSchema.shape.medias.optional(),
});

const routeDef = createRoute({
	method: "post",
	path: "/posts/{postId}/comments",
	summary: "Add a comment to a post",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			postId: z.string(),
		}),
		body: {
			content: {
				"multipart/form-data": {
					schema: CreateCommentRequestBody,
				},
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Comment created",
		},
	},
});

const createCommentRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { postId } = c.req.valid("param");
		const { content, medias } = c.req.valid("form");

		const hasContent = Boolean(content?.trim());
		const hasMedias = Boolean(medias && medias.length > 0);
		if (!hasContent && !hasMedias) {
			return c.json(
				{
					error: "Le commentaire doit contenir du texte ou au moins un média",
				},
				HttpStatus.BAD_REQUEST.code,
			);
		}

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { id: true },
		});

		if (!post) {
			return c.json({ error: "Post not found" }, HttpStatus.NOT_FOUND.code);
		}

		const comment = await prisma.comment.create({
			data: {
				postId,
				authorId: authenticatedUserId,
				content: content?.trim() ?? "",
			},
			select: {
				id: true,
			},
		});

		if (medias && medias.length > 0) {
			await createCommentMedias({
				commentId: comment.id,
				medias,
			});
		}

		const commentToSend = await prisma.comment.findUniqueOrThrow({
			where: {
				id: comment.id,
			},
			select: {
				id: true,
				postId: true,
				authorId: true,
				content: true,
				createdAt: true,
				updatedAt: true,
				medias: {
					select: {
						id: true,
						position: true,
						mediaType: true,
						createdAt: true,
						lowQualityFileId: true,
						lowQualityFile: {
							select: {
								id: true,
								mimeType: true,
								filename: true,
								createdAt: true,
							},
						},
						highQualityFileId: true,
						highQualityFile: {
							select: {
								id: true,
								mimeType: true,
								filename: true,
								createdAt: true,
							},
						},
					},
					orderBy: { position: "asc" },
				},
				_count: {
					select: { commentLikes: true },
				},
			},
		});

		return c.json(
			{ message: "Comment created successfully", comment: commentToSend },
			HttpStatus.CREATED.code,
		);
	},
});

export { createCommentRoute };
