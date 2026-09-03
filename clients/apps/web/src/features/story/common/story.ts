import type { User } from "@/features/user/common/user";

export type StoryMediaType = "IMAGE" | "VIDEO";

export type StoryMediaFile = {
	id: string;
	filename: string;
	mimeType?: string | null;
	createdAt?: string;
};

export type Story = {
	id: string;
	authorId: string;
	mediaType: StoryMediaType;
	mediaFile: StoryMediaFile;
	createdAt: string;
	expiresAt: string;
	author: User | null;
	isViewedByAuthenticatedUser: boolean;
};

export type StoryGroup = {
	authorId: string;
	author: User | null;
	stories: Story[];
};

export type StoriesResponse = {
	stories: StoryGroup[];
};
