import { createStoryRoute } from "./create-story.route";
import { getStoriesRoute } from "./get-stories.route";
import { markStoryViewedRoute } from "./mark-story-viewed.route";

const storiesRoutes = [createStoryRoute, getStoriesRoute, markStoryViewedRoute];

export { storiesRoutes };
