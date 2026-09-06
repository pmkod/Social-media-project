import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { activeSessionsQueryKey } from "./common/session.query-key.ts";
import type { Session } from "./common/session.ts";

const useActiveSessions = () =>
	useQuery({
		queryKey: activeSessionsQueryKey,
		queryFn: () =>
			httpClient
				.get("sessions/active")
				.json<{ sessions: Session[] }>()
				.then((response) => response.sessions),
	});

export { useActiveSessions };
