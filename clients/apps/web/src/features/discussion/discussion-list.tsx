import {
	RiChat3Line,
	RiCheckDoubleLine,
	RiMore2Line,
	RiSearchLine,
	RiSendPlane2Line,
} from "@remixicon/react";
import { useState } from "react";

type Conversation = {
	id: string;
	user: {
		name: string;
		handle: string;
		avatar: string;
		online?: boolean;
	};
	lastMessage: string;
	time: string;
	unreadCount?: number;
};

const FAKE_CONVERSATIONS: Conversation[] = [
	{
		id: "conv-1",
		user: {
			name: "Sophie Martin",
			handle: "sophiem",
			avatar:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
			online: true,
		},
		lastMessage: "Can we do a video call tomorrow to review the mockup?",
		time: "14:23",
		unreadCount: 2,
	},
	{
		id: "conv-2",
		user: {
			name: "Alexandre Dubois",
			handle: "alex_dev",
			avatar:
				"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
			online: false,
		},
		lastMessage: "Great, thanks for the documentation link!",
		time: "Yesterday",
	},
	{
		id: "conv-3",
		user: {
			name: "Emma Laurent",
			handle: "emma_design",
			avatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
			online: true,
		},
		lastMessage: "I submitted the pull request to the repo.",
		time: "Tue",
	},
];

export function DiscussionList() {
	const [activeConvId, setActiveConvId] = useState<string>("conv-1");
	const [conversations] = useState<Conversation[]>(FAKE_CONVERSATIONS);
	const [messageText, setMessageText] = useState("");
	const [activeMessages, setActiveMessages] = useState([
		{
			id: 1,
			text: "Hi! Did you get a chance to look at the component?",
			sender: "them",
			time: "14:20",
		},
		{
			id: 2,
			text: "Yes, absolutely, the design looks great!",
			sender: "me",
			time: "14:21",
		},
		{
			id: 3,
			text: "Can we do a video call tomorrow to review the mockup?",
			sender: "them",
			time: "14:23",
		},
	]);

	const selectedConv =
		conversations.find((c) => c.id === activeConvId) || conversations[0];

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!messageText.trim()) return;

		setActiveMessages((prev) => [
			...prev,
			{
				id: Date.now(),
				text: messageText,
				sender: "me",
				time: new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
			},
		]);
		setMessageText("");
	};

	return (
		<div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row border-r border-border">
			{/* Left Column: Conversations List */}
			<div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0">
				<div className="p-4 border-b border-border space-y-3">
					<h1 className="text-xl font-bold text-foreground flex items-center gap-2">
						<RiChat3Line className="h-6 w-6 text-sky-500" />
						<span>Discussions</span>
					</h1>
					<div className="relative">
						<RiSearchLine className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Search conversations..."
							className="w-full pl-9 pr-4 py-2 bg-muted rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto divide-y divide-border">
					{conversations.map((conv) => (
						<button
							key={conv.id}
							type="button"
							onClick={() => setActiveConvId(conv.id)}
							className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
								activeConvId === conv.id
									? "bg-sky-50 dark:bg-sky-950/30"
									: "hover:bg-accent hover:text-accent-foreground"
							}`}
						>
							<div className="relative shrink-0">
								<img
									src={conv.user.avatar}
									alt={conv.user.name}
									className="h-10 w-10 rounded-full object-cover"
								/>
								{conv.user.online ? (
									<span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
								) : null}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex justify-between items-baseline">
									<span className="font-semibold text-xs text-foreground truncate">
										{conv.user.name}
									</span>
									<span className="text-[10px] text-muted-foreground">
										{conv.time}
									</span>
								</div>
								<p className="text-xs text-muted-foreground truncate mt-0.5">
									{conv.lastMessage}
								</p>
							</div>
							{conv.unreadCount ? (
								<span className="h-5 min-w-5 px-1.5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
									{conv.unreadCount}
								</span>
							) : null}
						</button>
					))}
				</div>
			</div>

			{/* Right Column: Chat Window */}
			<div className="flex-1 flex flex-col min-w-0 bg-background">
				{/* Chat Header */}
				<div className="p-3.5 px-4 border-b border-border flex items-center justify-between bg-card text-card-foreground">
					<div className="flex items-center gap-3">
						<img
							src={selectedConv.user.avatar}
							alt={selectedConv.user.name}
							className="h-9 w-9 rounded-full object-cover"
						/>
						<div>
							<div className="font-semibold text-sm text-foreground">
								{selectedConv.user.name}
							</div>
							<div className="text-[11px] text-muted-foreground">
								@{selectedConv.user.handle}
							</div>
						</div>
					</div>
					<button
						type="button"
						className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"
					>
						<RiMore2Line className="h-5 w-5" />
					</button>
				</div>

				{/* Messages Container */}
				<div className="flex-1 p-4 overflow-y-auto space-y-3">
					{activeMessages.map((msg) => (
						<div
							key={msg.id}
							className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
									msg.sender === "me"
										? "bg-sky-500 text-white rounded-br-none"
										: "bg-muted text-foreground border border-border rounded-bl-none"
								}`}
							>
								<p>{msg.text}</p>
								<div
									className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
										msg.sender === "me"
											? "text-sky-100"
											: "text-muted-foreground"
									}`}
								>
									<span>{msg.time}</span>
									{msg.sender === "me" && (
										<RiCheckDoubleLine className="h-3 w-3" />
									)}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Message Input */}
				<form
					onSubmit={handleSendMessage}
					className="p-3 border-t border-border bg-card flex items-center gap-2"
				>
					<input
						type="text"
						value={messageText}
						onChange={(e) => setMessageText(e.target.value)}
						placeholder="Write a message..."
						className="flex-1 px-4 py-2 bg-muted rounded-full text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
					/>
					<button
						type="submit"
						disabled={!messageText.trim()}
						className="p-2.5 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white transition-colors"
					>
						<RiSendPlane2Line className="h-4 w-4" />
					</button>
				</form>
			</div>
		</div>
	);
}
