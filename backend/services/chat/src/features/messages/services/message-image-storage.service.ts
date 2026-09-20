import {
	deleteDiscussionFile,
	getDiscussionFile,
	setDiscussionFile,
} from "@/core/services/storage.service";

const setMessageImage = async ({
	file,
	fileName,
}: {
	file: File;
	fileName: string;
}) => {
	await setDiscussionFile({ file, fileName });
};

const getMessageImage = (fileName: string) => getDiscussionFile(fileName);

const deleteMessageImage = async (fileName: string) => {
	await deleteDiscussionFile(fileName);
};

export { deleteMessageImage, getMessageImage, setMessageImage };
