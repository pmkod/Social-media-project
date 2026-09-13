-- Rename SearchHistory columns while preserving existing search history rows.
ALTER TABLE "search_history"
RENAME COLUMN "owner_id" TO "searcher_id";

ALTER TABLE "search_history"
RENAME COLUMN "user_id" TO "searched_user_id";

ALTER INDEX "search_history_owner_id_created_at_id_idx"
RENAME TO "search_history_searcher_id_created_at_id_idx";

ALTER INDEX "search_history_user_id_idx"
RENAME TO "search_history_searched_user_id_idx";

ALTER TABLE "search_history"
RENAME CONSTRAINT "search_history_owner_id_fkey"
TO "search_history_searcher_id_fkey";

ALTER TABLE "search_history"
RENAME CONSTRAINT "search_history_user_id_fkey"
TO "search_history_searched_user_id_fkey";
