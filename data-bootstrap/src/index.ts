import { Config } from "./config";
import { disconnectDatabases, resetDatabases } from "./lib/database";
import { logger } from "./lib/logger";
import { seedUsers } from "./seeders/users.seeder";
import { seedPosts } from "./seeders/posts.seeder";
import { seedComments } from "./seeders/comments.seeder";
import { seedLikes } from "./seeders/likes.seeder";
import { cleanupApiSessions } from "./lib/api";

const main = async () => {
	logger.info("Starting data bootstrap...");
	logger.info(
		`Mode: ${Config.useApi ? "API calls through gateway" : "Direct database seeding"}`,
	);
	try {
		logger.info("Resetting databases...");
		await resetDatabases();
		logger.success("Databases reset.");

		const users = await seedUsers();
		const posts = await seedPosts(users);
		const comments = await seedComments(users, posts);
		const { postLikes, commentLikes } = await seedLikes(users, posts, comments);

		logger.info("Bootstrap summary:");
		logger.info(`  Users: ${users.length}`);
		logger.info(`  Posts: ${posts.length}`);
		logger.info(`  Comments: ${comments.length}`);
		logger.info(`  Post likes: ${postLikes}`);
		logger.info(`  Comment likes: ${commentLikes}`);
		logger.success("Data bootstrap completed successfully.");
	} catch (error) {
		logger.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	} finally {
		if (Config.useApi) await cleanupApiSessions();
		await disconnectDatabases();
	}
};

main();
