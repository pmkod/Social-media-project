type SendMailParams = {
	receiver: string;
	subject: string;
	content: string;
};

const sendMail = async ({ receiver, subject, content }: SendMailParams) => {
	console.log(`[MAIL SERVICE] To: ${receiver} | Subject: ${subject} | Content: ${content}`);
	return true;
};

export { sendMail };
