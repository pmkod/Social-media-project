import { useCallback } from "react";

export type SelectFilesOptions = {
	accept?: string;
	multiple?: boolean;
};

export function useSelectFiles() {
	const selectFiles = useCallback(
		(options?: SelectFilesOptions): Promise<File[]> => {
			return new Promise((resolve) => {
				const input = document.createElement("input");
				input.type = "file";
				if (options?.accept) {
					input.accept = options.accept;
				}
				input.multiple = options?.multiple ?? true;

				input.onchange = () => {
					const files = input.files ? Array.from(input.files) : [];
					resolve(files);
				};

				input.oncancel = () => {
					resolve([]);
				};

				input.click();
			});
		},
		[],
	);

	return { selectFiles };
}
