import { RiImageAddLine, RiUser3Line } from "@remixicon/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { Input } from "@/core/components/ui/input.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import type { User } from "@/features/user/common/user.ts";
import { useUpdateProfile } from "./use-update-profile.ts";

type EditProfileModalProps = {
	user: User;
};

const useFilePreview = (file: File | undefined, fallback: string | null) => {
	const [previewUrl, setPreviewUrl] = useState(fallback);

	useEffect(() => {
		if (!file) {
			setPreviewUrl(fallback);
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [file, fallback]);

	return previewUrl;
};

const EditProfileModal = create(({ user }: EditProfileModalProps) => {
	const modal = useModal();
	const navigate = useNavigate();
	const updateProfileMutation = useUpdateProfile();
	const [username, setUsername] = useState(user.username);
	const [fullName, setFullName] = useState(user.fullName ?? "");
	const [bio, setBio] = useState(user.bio ?? "");
	const [profilePicture, setProfilePicture] = useState<File>();
	const [coverPicture, setCoverPicture] = useState<File>();

	const profilePreviewUrl = useFilePreview(
		profilePicture,
		user.profilePictureUrl ?? user.lowQualityProfilePictureUrl ?? null,
	);
	const coverPreviewUrl = useFilePreview(
		coverPicture,
		user.coverPictureUrl ?? user.lowQualityCoverPictureUrl ?? null,
	);

	const isValid =
		username.trim().length >= 3 &&
		fullName.trim().length > 0 &&
		bio.length <= 280;

	const close = () => {
		if (!updateProfileMutation.isPending) {
			modal.remove();
		}
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isValid || updateProfileMutation.isPending) return;

		updateProfileMutation.mutate(
			{
				username: username.trim(),
				fullName: fullName.trim(),
				bio,
				profilePicture,
				coverPicture,
			},
			{
				onSuccess: (updatedUser) => {
					modal.remove();
					void navigate({
						to: "/$username",
						params: { username: `@${updatedUser.username}` },
					});
				},
			},
		);
	};

	return (
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<DialogContent size="md" className="gap-0 p-0">
				<DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-14">
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Update your public profile information and photos.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
					<DialogBody className="space-y-5 px-5 py-5">
						<div className="space-y-2">
							<label
								htmlFor="edit-profile-username"
								className="text-sm font-medium text-foreground"
							>
								Username
							</label>
							<Input
								id="edit-profile-username"
								value={username}
								onChange={(event) => setUsername(event.target.value)}
								maxLength={50}
								disabled={updateProfileMutation.isPending}
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="edit-profile-full-name"
								className="text-sm font-medium text-foreground"
							>
								Full name
							</label>
							<Input
								id="edit-profile-full-name"
								value={fullName}
								onChange={(event) => setFullName(event.target.value)}
								maxLength={100}
								disabled={updateProfileMutation.isPending}
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="edit-profile-bio"
								className="text-sm font-medium text-foreground"
							>
								Bio
							</label>
							<Textarea
								id="edit-profile-bio"
								value={bio}
								onChange={(event) => setBio(event.target.value)}
								maxLength={280}
								rows={4}
								disabled={updateProfileMutation.isPending}
							/>
							<p className="text-right text-xs text-muted-foreground">
								{bio.length}/280
							</p>
						</div>

						<div className="space-y-3">
							<p className="text-sm font-medium text-foreground">Photos</p>
							<div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
								<div className="flex flex-col items-center gap-2">
									<div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
										{profilePreviewUrl ? (
											<img
												src={profilePreviewUrl}
												alt="Profile preview"
												className="size-full object-cover"
											/>
										) : (
											<RiUser3Line className="size-8 text-muted-foreground" />
										)}
									</div>
									<label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
										<RiImageAddLine className="size-4" />
										Profile photo
										<input
											type="file"
											accept="image/jpeg,image/png,image/webp,image/gif"
											className="sr-only"
											disabled={updateProfileMutation.isPending}
											onChange={(event) =>
												setProfilePicture(event.target.files?.[0])
											}
										/>
									</label>
								</div>

								<div className="space-y-2">
									<div className="h-32 overflow-hidden rounded-xl border border-border bg-muted">
										{coverPreviewUrl ? (
											<img
												src={coverPreviewUrl}
												alt="Cover preview"
												className="size-full object-cover"
											/>
										) : (
											<div className="flex size-full items-center justify-center text-sm text-muted-foreground">
												No cover photo
											</div>
										)}
									</div>
									<label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
										<RiImageAddLine className="size-4" />
										Cover photo
										<input
											type="file"
											accept="image/jpeg,image/png,image/webp,image/gif"
											className="sr-only"
											disabled={updateProfileMutation.isPending}
											onChange={(event) =>
												setCoverPicture(event.target.files?.[0])
											}
										/>
									</label>
								</div>
							</div>
						</div>

						{updateProfileMutation.isError ? (
							<p className="text-sm text-destructive" role="alert">
								{updateProfileMutation.error.message ||
									"Unable to update your profile."}
							</p>
						) : null}
					</DialogBody>

					<DialogFooter className="border-t border-border px-5 py-4">
						<Button type="button" variant="outline" onClick={close}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!isValid}
							isLoading={updateProfileMutation.isPending}
						>
							Save changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
});

export { EditProfileModal };
