import type { MediaType } from "@/core/components/ui/media-grid";

export type User = {
	id: string;
	firstName: string;
	lastName: string;
	name: string;
	password: string;
	username: string;
	role: string;
	avatar: string;
	background: string;
	status: string;
	phoneNumber: string;
	email: string;
	state: string;
	country: string;
	address: string;
	zipCode: string;
	language: string;
	timeZone: string;
	currency: string;
	organization: string;
	twoFactorAuth: boolean;
	loginAlerts: boolean;
	accountReoveryOption?: "email" | "sms" | "codes";
	connections: number;
	followers: number;
};

export type PostVisibility = "public" | "friends" | "private";

export type UserPostType = Pick<User, "name" | "avatar">;

export interface Post {
	id: string;
	user: UserPostType;
	updatedAt: Date;
	text: string;
	totalComments: number;
	totalReposts: number;
	totalLikes: number;
	media?: Array<MediaType>;
	visibility: PostVisibility;
	isLiked: boolean;
}
