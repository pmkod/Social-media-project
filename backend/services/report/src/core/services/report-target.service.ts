import { Configurations } from "@/core/configurations";
import type { ReportTargetTypeValue } from "@/features/reports/reports.validation-schemas";

const getTargetUrl = (targetType: ReportTargetTypeValue, targetId: string) => {
	const encodedTargetId = encodeURIComponent(targetId);

	if (targetType === "user") {
		return `${Configurations.server.userServiceUrl}/internal/users/${encodedTargetId}/exists`;
	}

	return `${Configurations.server.contentServiceUrl}/internal/${targetType}s/${encodedTargetId}/exists`;
};

const reportTargetExists = async (
	targetType: ReportTargetTypeValue,
	targetId: string,
) => {
	try {
		const response = await fetch(getTargetUrl(targetType, targetId), {
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

export { reportTargetExists };
