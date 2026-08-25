import { Configurations } from "@/core/configurations";

type ReportTargetInput = {
	postId?: string;
	commentId?: string;
	userId?: string;
};

type ReportTarget =
	| { field: "postId"; id: string; resource: "posts" }
	| { field: "commentId"; id: string; resource: "comments" }
	| { field: "userId"; id: string; resource: "users" };

const resolveReportTarget = (input: ReportTargetInput): ReportTarget => {
	if (input.postId) {
		return { field: "postId", id: input.postId, resource: "posts" };
	}
	if (input.commentId) {
		return { field: "commentId", id: input.commentId, resource: "comments" };
	}
	if (input.userId) {
		return { field: "userId", id: input.userId, resource: "users" };
	}

	throw new Error("A report target is required");
};

const getTargetUrl = (target: ReportTarget) => {
	const encodedId = encodeURIComponent(target.id);

	if (target.field === "userId") {
		return `${Configurations.server.userServiceUrl}/internal/users/${encodedId}/exists`;
	}

	return `${Configurations.server.contentServiceUrl}/internal/${target.resource}/${encodedId}/exists`;
};

const reportTargetExists = async (target: ReportTarget) => {
	try {
		const response = await fetch(getTargetUrl(target), {
			signal: AbortSignal.timeout(5_000),
		});
		if (response.status === 404) return false;
		if (!response.ok) {
			throw new Error(`Target service returned status ${response.status}`);
		}
		return true;
	} catch (error) {
		console.error("[REPORT SERVICE] Unable to verify report target", error);
		throw new Error("Unable to verify the reported content");
	}
};

const getReportTargetFields = (target: ReportTarget) => {
	switch (target.field) {
		case "postId":
			return { postId: target.id };
		case "commentId":
			return { commentId: target.id };
		case "userId":
			return { userId: target.id };
	}
};

export { getReportTargetFields, reportTargetExists, resolveReportTarget };
