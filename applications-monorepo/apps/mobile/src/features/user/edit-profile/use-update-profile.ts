import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key";
import type { UseAuthenticatedUserQueryData } from "@/features/user/authenticated-user/types/use-authenticated-user-query-data";
import type { User } from "@/features/user/common/user";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys";
import type { UserProfileResponse } from "@/features/user/user-profile/use-user-profile";

export type UpdateProfileInput = {
	username: string;
	fullName: string;
	bio?: string;
	profilePicture?: any;
	coverPicture?: any;
	removeProfilePicture?: boolean;
	removeCoverPicture?: boolean;
};

const updateProfile = async (input: UpdateProfileInput) => {
	const formData = new FormData();
	formData.append("username", input.username);
	formData.append("fullName", input.fullName);
	if (input.bio !== undefined) {
		formData.append("bio", input.bio);
	}
	if (input.profilePicture) {
		formData.append("profilePicture", input.profilePicture);
	}
	if (input.coverPicture) {
		formData.append("coverPicture", input.coverPicture);
	}
	if (input.removeProfilePicture) {
		formData.append("removeProfilePicture", "true");
	}
	if (input.removeCoverPicture) {
		formData.append("removeCoverPicture", "true");
	}

	return httpClient.put("user/update-profile", { body: formData }).json<{ user: User }>();
};

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateProfile,
		onSuccess: ({ user: updatedUser }) => {
			queryClient.setQueryData<UseAuthenticatedUserQueryData>(
				authenticatedUserQueryKey,
				(currentData) =>
					currentData
						? {
								...currentData,
								user: {
									...currentData.user,
									...updatedUser,
								},
							}
						: currentData,
			);
			queryClient.setQueriesData<UserProfileResponse>(
				{ queryKey: userDetailsQueryKeys.root },
				(data) =>
					data?.user.id === updatedUser.id
						? { ...data, user: { ...data.user, ...updatedUser } }
						: data,
			);
			queryClient.setQueryData<UserProfileResponse>(
				userDetailsQueryKeys.byUsername(updatedUser.username),
				{ user: updatedUser },
			);
		},
	});
};
