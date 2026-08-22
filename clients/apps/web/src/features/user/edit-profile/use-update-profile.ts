import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key.ts";
import type { UseAuthenticatedUserQueryData } from "@/features/user/authenticated-user/types/use-authenticated-user-query-data.ts";
import type { User } from "@/features/user/common/user.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";

type UpdateProfileInput = {
	username: string;
	fullName: string;
	bio: string;
	profilePicture?: File;
	coverPicture?: File;
	removeProfilePicture?: boolean;
	removeCoverPicture?: boolean;
};

const updateProfile = async (input: UpdateProfileInput): Promise<User> => {
	const formData = new FormData();
	formData.append("username", input.username);
	formData.append("fullName", input.fullName);
	formData.append("bio", input.bio);
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

	return httpClient.put("users/me", { body: formData }).json<User>();
};

const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateProfile,
		onSuccess: (updatedUser) => {
			queryClient.setQueryData<UseAuthenticatedUserQueryData>(
				authenticatedUserQueryKey,
				(currentData) =>
					currentData
						? {
								...currentData,
								user: {
									...currentData.user,
									username: updatedUser.username,
									fullName: updatedUser.fullName,
									lowQualityProfilePictureFile:
										updatedUser.lowQualityProfilePictureFile,
									bestQualityProfilePictureFile:
										updatedUser.bestQualityProfilePictureFile,
								},
							}
						: currentData,
			);
			void queryClient.invalidateQueries({
				queryKey: userDetailsQueryKeys.byUsername(updatedUser.username),
				exact: true,
			});
		},
	});
};

export { useUpdateProfile };
export type { UpdateProfileInput };
