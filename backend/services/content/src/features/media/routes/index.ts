import { getImageRoute } from "./get-image.route";
import { getVideoRoute } from "./get-video.route";

const mediaRoutes = [getImageRoute, getVideoRoute];

export { mediaRoutes, getImageRoute, getVideoRoute };
