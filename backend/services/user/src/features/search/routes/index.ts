import { clearSearchHistoryRoute } from "./clear-search-history.route";
import { createSearchHistoryRoute } from "./create-search-history.route";
import { deleteSearchHistoryItemRoute } from "./delete-search-history-item.route";
import { getSearchHistoryRoute } from "./get-search-history.route";
import { getSearchSuggestionsRoute } from "./get-search-suggestions.route";

const searchRoutes = [
	getSearchSuggestionsRoute,
	getSearchHistoryRoute,
	createSearchHistoryRoute,
	deleteSearchHistoryItemRoute,
	clearSearchHistoryRoute,
];

export { searchRoutes };
