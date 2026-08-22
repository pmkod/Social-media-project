import {
	RiDeleteBinLine,
	RiEdit2Line,
	RiImageAddLine,
	RiUser3Line,
} from "@remixicon/react";
import { useForm, useSelector } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { z } from "zod";
import { Button, type ButtonProps } from "@/core/components/ui/button.tsx";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/core/components/ui/field.tsx";
import { Input } from "@/core/components/ui/input.tsx";
import { create, useModal } from "@/core/components/ui/nice-modal.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import { cn } from "@/core/lib/utils.ts";
import { buildImageUrl } from "@/features/post/post-media.functions.ts";
import type { User } from "@/features/user/common/user.ts";
import { useUpdateProfile } from "./use-update-profile.ts";

const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
] as const;

const profilePictureSchema = z
	.file()
	.mime([...ACCEPTED_IMAGE_TYPES])
	.max(10_000_000)
	.or(z.undefined());

const coverPictureSchema = z
	.file()
	.mime([...ACCEPTED_IMAGE_TYPES])
	.max(15_000_000)
	.or(z.undefined());

const editProfileSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3, "Username must contain at least 3 characters.")
		.max(50, "Username cannot contain more than 50 characters."),
	fullName: z
		.string()
		.trim()
		.min(1, "Full name is required.")
		.max(100, "Full name cannot contain more than 100 characters."),
	bio: z.string().max(280, "Bio cannot contain more than 280 characters."),
	profilePicture: profilePictureSchema,
	coverPicture: coverPictureSchema,
	removeProfilePicture: z.boolean(),
	removeCoverPicture: z.boolean(),
});

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

type EditProfileFormValues = {
	username: string;
	fullName: string;
	bio: string;
	profilePicture: File | undefined;
	coverPicture: File | undefined;
	removeProfilePicture: boolean;
	removeCoverPicture: boolean;
};

type EditProfileModalProps = {
	user: User;
};

type PhotoActionButtonProps = Omit<ButtonProps, "children"> & {
	children: ReactNode;
	label: string;
};

const PhotoActionButton = ({
	children,
	className,
	label,
	...props
}: PhotoActionButtonProps) => (
	<Button
		type="button"
		variant="secondary"
		colorScheme="white"
		size="icon-sm"
		className={cn(
			"border border-white/20 bg-black/55 shadow-md backdrop-blur-sm hover:bg-black/75",
			className,
		)}
		aria-label={label}
		title={label}
		{...props}
	>
		{children}
		<span className="sr-only">{label}</span>
	</Button>
);

const EditProfileModal = create(({ user }: EditProfileModalProps) => {
	const modal = useModal();
	const navigate = useNavigate();
	const updateProfileMutation = useUpdateProfile();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			username: user.username,
			fullName: user.fullName ?? "",
			bio: user.bio ?? "",
			profilePicture: undefined as File | undefined,
			coverPicture: undefined as File | undefined,
			removeProfilePicture: false as boolean,
			removeCoverPicture: false as boolean,
		} satisfies EditProfileFormValues,
		validators: {
			onSubmit: editProfileSchema,
		},
		onSubmit: async ({ value }) => {
			if (updateProfileMutation.isPending) return;

			setErrorMessage(null);
			try {
				const updatedUser = await updateProfileMutation.mutateAsync({
					username: value.username.trim(),
					fullName: value.fullName.trim(),
					bio: value.bio,
					profilePicture: value.profilePicture,
					coverPicture: value.coverPicture,
					removeProfilePicture: value.removeProfilePicture,
					removeCoverPicture: value.removeCoverPicture,
				});

				modal.remove();
				void navigate({
					to: "/$username",
					params: { username: `@${updatedUser.username}` },
				});
			} catch (error) {
				setErrorMessage(
					error instanceof Error
						? error.message
						: "Unable to update your profile.",
				);
			}
		},
	});

	const profilePicture = useSelector(
		form.store,
		(state) => state.values.profilePicture,
	);
	const coverPicture = useSelector(
		form.store,
		(state) => state.values.coverPicture,
	);
	const removeProfilePicture = useSelector(
		form.store,
		(state) => state.values.removeProfilePicture,
	);
	const removeCoverPicture = useSelector(
		form.store,
		(state) => state.values.removeCoverPicture,
	);
	const profilePictureFallbackUrl =
		buildImageUrl(
			user.bestQualityProfilePictureFile?.name ??
				user.lowQualityProfilePictureFile?.name,
		) || null;
	const coverPictureFallbackUrl =
		buildImageUrl(
			user.bestQualityCoverPictureFile?.name ??
				user.lowQualityCoverPictureFile?.name,
		) || null;
	const profilePreviewUrl = useFilePreview(
		profilePicture,
		removeProfilePicture ? null : profilePictureFallbackUrl,
	);
	const coverPreviewUrl = useFilePreview(
		coverPicture,
		removeCoverPicture ? null : coverPictureFallbackUrl,
	);

	const close = () => {
		if (!updateProfileMutation.isPending) {
			modal.remove();
		}
	};

	return (
		<Dialog
			open={modal.visible}
			onOpenChange={(open) => {
				if (!open) close();
			}}
		>
			<DialogContent size="xl">
				<DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-14">
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription />
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
					onChange={() => setErrorMessage(null)}
					className="flex min-h-0 flex-1 flex-col"
				>
					<DialogBody className="space-y-5 px-5 py-5">
						<FieldGroup className="gap-5">
							<div className="relative">
								<form.Field name="coverPicture">
									{(field) => (
										<Field
											className="gap-0"
											data-invalid={!field.state.meta.isValid}
										>
											<FieldLabel className="sr-only" htmlFor={field.name}>
												Cover photo
											</FieldLabel>
											<div className="relative aspect-[2.8] overflow-hidden rounded-xl border border-border bg-muted">
												{coverPreviewUrl ? (
													<img
														src={coverPreviewUrl}
														alt="Cover preview"
														className="size-full object-cover"
													/>
												) : (
													<div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
														<RiImageAddLine className="size-8" />
													</div>
												)}
												<div className="absolute inset-0 flex items-center justify-center gap-2">
													<PhotoActionButton
														label="Modifier la photo de couverture"
														disabled={updateProfileMutation.isPending}
														onClick={() =>
															document.getElementById(field.name)?.click()
														}
													>
														<RiEdit2Line />
													</PhotoActionButton>
													<PhotoActionButton
														label="Supprimer la photo de couverture"
														disabled={
															!coverPreviewUrl ||
															updateProfileMutation.isPending
														}
														onClick={() => {
															form.setFieldValue("coverPicture", undefined);
															form.setFieldValue(
																"removeCoverPicture",
																Boolean(
																	user.bestQualityCoverPictureFile ??
																		user.lowQualityCoverPictureFile,
																),
															);
														}}
													>
														<RiDeleteBinLine />
													</PhotoActionButton>
												</div>
											</div>
											<input
												id={field.name}
												type="file"
												accept={ACCEPTED_IMAGE_TYPES.join(",")}
												className="sr-only"
												disabled={updateProfileMutation.isPending}
												onChange={(event) => {
													field.handleChange(event.target.files?.[0]);
													form.setFieldValue("removeCoverPicture", false);
												}}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="profilePicture">
									{(field) => (
										<Field
											className="-mt-12 gap-1 px-5"
											data-invalid={!field.state.meta.isValid}
										>
											<FieldLabel className="sr-only" htmlFor={field.name}>
												Profile photo
											</FieldLabel>
											<div className="relative size-24 shrink-0 sm:size-28">
												<div className="flex size-full items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg">
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
												<div className="absolute inset-0 flex items-center justify-center gap-1">
													<PhotoActionButton
														label="Modifier la photo de profil"
														disabled={updateProfileMutation.isPending}
														onClick={() =>
															document.getElementById(field.name)?.click()
														}
													>
														<RiEdit2Line />
													</PhotoActionButton>
													<PhotoActionButton
														label="Supprimer la photo de profil"
														disabled={
															!profilePreviewUrl ||
															updateProfileMutation.isPending
														}
														onClick={() => {
															form.setFieldValue("profilePicture", undefined);
															form.setFieldValue(
																"removeProfilePicture",
																Boolean(
																	user.bestQualityProfilePictureFile ??
																		user.lowQualityProfilePictureFile,
																),
															);
														}}
													>
														<RiDeleteBinLine />
													</PhotoActionButton>
												</div>
											</div>
											<input
												id={field.name}
												type="file"
												accept={ACCEPTED_IMAGE_TYPES.join(",")}
												className="sr-only"
												disabled={updateProfileMutation.isPending}
												onChange={(event) => {
													field.handleChange(event.target.files?.[0]);
													form.setFieldValue("removeProfilePicture", false);
												}}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>
							</div>

							<form.Field name="username">
								{(field) => (
									<Field data-invalid={!field.state.meta.isValid}>
										<FieldLabel htmlFor={field.name}>Username</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											maxLength={50}
											disabled={updateProfileMutation.isPending}
											aria-invalid={!field.state.meta.isValid}
											autoComplete="username"
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							<form.Field name="fullName">
								{(field) => (
									<Field data-invalid={!field.state.meta.isValid}>
										<FieldLabel htmlFor={field.name}>Full name</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											maxLength={100}
											disabled={updateProfileMutation.isPending}
											aria-invalid={!field.state.meta.isValid}
											autoComplete="name"
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>

							<form.Field name="bio">
								{(field) => (
									<Field data-invalid={!field.state.meta.isValid}>
										<FieldLabel htmlFor={field.name}>Bio</FieldLabel>
										<Textarea
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											maxLength={280}
											rows={4}
											disabled={updateProfileMutation.isPending}
											aria-invalid={!field.state.meta.isValid}
										/>
										<p className="text-right text-xs text-muted-foreground">
											{field.state.value.length}/280
										</p>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							</form.Field>
						</FieldGroup>

						{errorMessage ? (
							<p className="text-sm text-destructive" role="alert">
								{errorMessage}
							</p>
						) : null}
					</DialogBody>

					<DialogFooter className="border-t border-border px-5 py-4">
						<Button type="button" variant="outline" onClick={close}>
							Cancel
						</Button>
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button
									type="submit"
									disabled={isSubmitting || updateProfileMutation.isPending}
									isLoading={isSubmitting || updateProfileMutation.isPending}
								>
									Save changes
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
});

export { EditProfileModal };
