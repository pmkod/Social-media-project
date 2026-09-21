import { useQuery } from "@tanstack/react-query";
import { type ImgHTMLAttributes, useEffect, useState } from "react";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { cn } from "@/core/lib/utils.ts";

const isProtectedMessageImageUrl = (url?: string | null) =>
	Boolean(url?.startsWith("/chat/get-message-image/"));

const useProtectedMessageImageUrl = (url?: string | null) => {
	const isProtected = isProtectedMessageImageUrl(url);
	const imageQuery = useQuery({
		queryKey: ["protected-message-image", url],
		queryFn: () => httpClient.get((url ?? "").replace(/^\/+/, "")).blob(),
		enabled: isProtected && typeof window !== "undefined",
		staleTime: 0,
		gcTime: 0,
	});
	const [objectUrl, setObjectUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!imageQuery.data) {
			setObjectUrl(null);
			return;
		}

		const nextObjectUrl = URL.createObjectURL(imageQuery.data);
		setObjectUrl(nextObjectUrl);
		return () => URL.revokeObjectURL(nextObjectUrl);
	}, [imageQuery.data]);

	return {
		url: isProtected ? objectUrl : (url ?? null),
		isLoading: isProtected && imageQuery.isLoading,
		isError: isProtected && imageQuery.isError,
	};
};

type ProtectedMessageImageProps = Omit<
	ImgHTMLAttributes<HTMLImageElement>,
	"src"
> & {
	src?: string | null;
};

function ProtectedMessageImage({
	src,
	alt,
	className,
	...props
}: ProtectedMessageImageProps) {
	const image = useProtectedMessageImageUrl(src);

	if (image.isError) {
		return (
			<div role="img" aria-label={alt} className={cn("bg-muted", className)} />
		);
	}

	return (
		<img
			{...props}
			alt={alt ?? ""}
			src={image.url ?? undefined}
			aria-busy={image.isLoading}
			className={cn(image.isLoading && "animate-pulse bg-muted", className)}
		/>
	);
}

export { ProtectedMessageImage, useProtectedMessageImageUrl };
