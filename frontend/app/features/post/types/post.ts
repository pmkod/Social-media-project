// export type User = {
// 	id: string;
// 	firstName: string;
// 	lastName: string;
// 	name: string;
// 	password: string;
// 	username: string;
// 	role: string;
// 	avatar: string;
// 	background: string;
// 	status: string;
// 	phoneNumber: string;
// 	email: string;
// 	state: string;
// 	country: string;
// 	address: string;
// 	zipCode: string;
// 	language: string;
// 	timeZone: string;
// 	currency: string;
// 	organization: string;
// 	twoFactorAuth: boolean;
// 	loginAlerts: boolean;
// 	accountReoveryOption?: "email" | "sms" | "codes";
// 	connections: number;
// 	followers: number;
// };

import type { User } from "@/features/user/types/user";

// export type PostVisibility = "public" | "friends" | "private";

// export type UserPostType = Pick<User, "name" | "avatar">;

export interface Post {
	id: string;
	content: string;
	createdAt: Date;
	author: User;
	commentCount: number;
	likeCount: number;
	// isLiked: boolean;
}
