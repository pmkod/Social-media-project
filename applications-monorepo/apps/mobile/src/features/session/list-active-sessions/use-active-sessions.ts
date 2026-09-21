import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { activeSessionsQueryKey } from "../common/session.query-key";
import type { Session } from "../common/session";

export const useActiveSessions = () =>
	useQuery({
		queryKey: activeSessionsQueryKey.build(),
		queryFn: () =>
			httpClient
				.get("session/get-all-active-sessions")
				.json<{ sessions: Session[] }>()
				.then((response) => response.sessions),
	});
