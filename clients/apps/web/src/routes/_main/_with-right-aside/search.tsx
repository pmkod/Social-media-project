import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { PostSearchList } from "@/features/post/search/post-search-list.tsx";
import { SearchBar } from "@/features/search/search-bar.tsx";
import { useCreateSearchHistory } from "@/features/search/use-create-search-history.ts";
import type { User } from "@/features/user/common/user.ts";
import { UserSearchList } from "@/features/user/search/user-search-list.tsx";

const searchPageSearchParams = z.object({
	q: z.string().trim().max(100).optional(),
});

export const Route = createFileRoute("/_main/_with-right-aside/search")({
	validateSearch: searchPageSearchParams,
	component: SearchPage,
});

function SearchPage() {
	const { q } = Route.useSearch();
	const navigate = Route.useNavigate();
	const committedQuery = q?.trim() ?? "";
	const [search, setSearch] = useState(committedQuery);
	const createSearchHistory = useCreateSearchHistory();

	useEffect(() => {
		setSearch(committedQuery);
	}, [committedQuery]);

	const selectTextSearch = (text: string) => {
		const normalizedText = text.trim();
		if (!normalizedText) return;

		setSearch(normalizedText);
		createSearchHistory.mutate({ text: normalizedText });
		void navigate({ search: { q: normalizedText } });
	};

	const selectUserSearch = (user: User) => {
		createSearchHistory.mutate({ userId: user.id });
	};

	return (
		<MainContainer>
			<div className="py-5 sticky top-0 bg-background z-40">
				<SearchBar
					value={search}
					maxLength={100}
					onChange={(event) => setSearch(event.target.value)}
					onSelectText={selectTextSearch}
					onSelectUser={selectUserSearch}
				/>
			</div>

			<div className="pb-8">
				<UserSearchList query={committedQuery} />
				<PostSearchList query={committedQuery} />
			</div>
		</MainContainer>
	);
}
