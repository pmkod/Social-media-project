import { eq } from "drizzle-orm";
import { db } from "@/core/db";
import { userProfiles } from "@/core/db/schema";
import { AppError, ErrorCodes } from "@/core/errors/app-error";

export async function getUserProfileByUserId(userId: string) {
	const profile = await db.query.userProfiles.findFirst({
		where: eq(userProfiles.userId, userId),
	});

	if (!profile) {
		throw new AppError({
			message: "User profile not found",
			code: ErrorCodes.NOT_FOUND,
			statusCode: 404,
		});
	}

	return profile;
}
