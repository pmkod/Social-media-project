const notificationLoaderIds = [
	"notification-loader-1",
	"notification-loader-2",
	"notification-loader-3",
	"notification-loader-4",
	"notification-loader-5",
];

type NotificationListItemLoaderProps = {
	count?: number;
};

function NotificationListItemLoader({
	count = 5,
}: NotificationListItemLoaderProps) {
	return (
		<div className="divide-y divide-border">
			{notificationLoaderIds.slice(0, count).map((loaderId) => (
				<div key={loaderId} className="flex animate-pulse gap-3 p-4">
					<div className="size-5 rounded-full bg-muted" />
					<div className="flex-1 space-y-3">
						<div className="h-8 w-2/3 rounded bg-muted" />
						<div className="h-12 rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}

export { NotificationListItemLoader };
