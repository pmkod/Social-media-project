export async function sendMail({
	receiver,
	subject,
	content,
}: {
	receiver: string;
	subject: string;
	content: string;
}): Promise<void> {
	// TODO: replace with real email provider in production
	console.log(`[MOCK EMAIL] To: ${receiver} | Subject: ${subject} | Content: ${content}`);
}
