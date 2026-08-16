import {
	RiArrowLeftLine,
	RiCalendar2Line,
	RiFolder3Line,
	RiLinkM,
	RiLoader4Line,
	RiMapPin2Line,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/core/components/ui/button.tsx";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/core/components/ui/tabs.tsx";
import { ProfilePostList } from "./profile-post-list.tsx";
import { useFollowUser } from "./use-follow-user.ts";
import { useUnfollowUser } from "./use-unfollow-user.ts";
import { useUserProfile } from "./use-user-profile.ts";

const numberFormatter = new Intl.NumberFormat("fr-FR", { notation: "compact" });
const joinedDateFormatter = new Intl.DateTimeFormat("fr-FR", {
	month: "long",
	year: "numeric",
});

type ProfileViewProps = {
	username: string;
};

export function ProfileView({ username }: ProfileViewProps) {
	const profileQuery = useUserProfile(username);
	const followUser = useFollowUser(username);
	const unfollowUser = useUnfollowUser(username);

	if (profileQuery.isLoading) {
		return (
			<div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center border-x border-border">
				<RiLoader4Line className="size-8 animate-spin text-sky-500" />
			</div>
		);
	}

	const user = profileQuery.data;
	if (profileQuery.isError || !user) {
		return (
			<div className="mx-auto min-h-screen max-w-2xl border-x border-border p-12 text-center">
				<h1 className="text-xl font-bold text-foreground">
					Ce compte n’existe pas
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Vérifiez le nom d’utilisateur puis réessayez.
				</p>
				<Button asChild variant="outline" className="mt-5">
					<Link to="/search">Retour à la recherche</Link>
				</Button>
			</div>
		);
	}

	const displayName = user.displayName || user.fullName || user.username;
	const avatar =
		user.avatarUrl ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
	const isFollowMutationPending =
		followUser.isPending || unfollowUser.isPending;
	const joinedDate = user.createdAt
		? joinedDateFormatter.format(new Date(user.createdAt))
		: null;

	return (
		<div className="mx-auto min-h-screen max-w-2xl border-x border-border">
			<header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-xl">
				<Link
					to="/home"
					aria-label="Retour"
					className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
				>
					<RiArrowLeftLine className="size-5" />
				</Link>
				<div className="min-w-0">
					<h1 className="truncate font-bold text-foreground">{displayName}</h1>
					<p className="text-xs text-muted-foreground">
						{numberFormatter.format(user.postCount ?? 0)} publications
					</p>
				</div>
			</header>

			<section>
				<div className="h-48 overflow-hidden bg-gradient-to-br from-slate-700 via-slate-500 to-sky-300 sm:h-56">
					{user.coverUrl ? (
						<img
							src={user.coverUrl}
							alt={`Couverture de ${displayName}`}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="h-full w-full bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.32),transparent_32%),linear-gradient(135deg,transparent_35%,rgba(255,255,255,0.12)_35%,rgba(255,255,255,0.12)_52%,transparent_52%)]" />
					)}
				</div>

				<div className="px-4 pb-5">
					<div className="flex items-start justify-between">
						<img
							src={avatar}
							alt={displayName}
							className="-mt-16 size-32 rounded-full border-4 border-background bg-background object-cover shadow-sm sm:size-36"
						/>

						<div className="pt-3">
							{user.isOwnProfile ? (
								<span className="inline-flex h-9 items-center rounded-full border border-border px-5 text-sm font-bold text-foreground">
									Votre profil
								</span>
							) : (
								<Button
									variant={
										user.isFollowedByAuthenticatedUser ? "outline" : "default"
									}
									className="rounded-full px-6 font-bold"
									disabled={isFollowMutationPending}
									onClick={() => {
										if (user.isFollowedByAuthenticatedUser) {
											unfollowUser.mutate(user.id);
										} else {
											followUser.mutate(user.id);
										}
									}}
								>
									{isFollowMutationPending
										? "Mise à jour..."
										: user.isFollowedByAuthenticatedUser
											? "Abonné"
											: "Suivre"}
								</Button>
							)}
						</div>
					</div>

					<div className="mt-3">
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							{displayName}
						</h2>
						<p className="text-muted-foreground">@{user.username}</p>
					</div>

					{user.bio ? (
						<p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
							{user.bio}
						</p>
					) : null}

					<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
						{user.location ? (
							<span className="flex items-center gap-1.5">
								<RiMapPin2Line className="size-4" />
								{user.location}
							</span>
						) : null}
						{user.website ? (
							<a
								href={user.website}
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-1.5 text-sky-500 hover:underline"
							>
								<RiLinkM className="size-4" />
								{user.website.replace(/^https?:\/\//, "")}
							</a>
						) : null}
						{joinedDate ? (
							<span className="flex items-center gap-1.5">
								<RiCalendar2Line className="size-4" />
								Inscrit en {joinedDate}
							</span>
						) : null}
					</div>

					<div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
						<span>
							<strong className="text-foreground">
								{numberFormatter.format(user.postCount ?? 0)}
							</strong>{" "}
							Posts
						</span>
						<span>
							<strong className="text-foreground">
								{numberFormatter.format(user.followersCount ?? 0)}
							</strong>{" "}
							Followers
						</span>
						<span>
							<strong className="text-foreground">
								{numberFormatter.format(user.followingCount ?? 0)}
							</strong>{" "}
							Following
						</span>
					</div>
				</div>
			</section>

			<Tabs defaultValue="posts">
				<TabsList>
					<TabsTrigger value="posts">Posts</TabsTrigger>
					<TabsTrigger value="likes">Likes</TabsTrigger>
					<TabsTrigger value="collections">Collections</TabsTrigger>
				</TabsList>
				<TabsContent value="posts">
					<ProfilePostList userId={user.id} type="posts" />
				</TabsContent>
				<TabsContent value="likes">
					<ProfilePostList userId={user.id} type="likes" />
				</TabsContent>
				<TabsContent value="collections">
					<div className="p-12 text-center">
						<RiFolder3Line className="mx-auto mb-3 size-8 text-muted-foreground" />
						<p className="font-semibold text-foreground">
							Aucune collection publique
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
