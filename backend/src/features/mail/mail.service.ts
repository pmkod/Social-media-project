type SendMailParams = {
  receiver: string;
  subject?: string;
  content: string;
};

const sendMail = async ({ receiver, subject, content }: SendMailParams) => {
  console.log(`Send mail
    Receiver ${receiver}
    Sujet ${subject}
    Content ${content}
    `);
};

export { sendMail };
