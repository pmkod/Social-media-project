type TextSelection = {
	start?: number | null;
	end?: number | null;
};

type TextInsertion = {
	value: string;
	caret: number;
};

function insertTextAtSelection(
	value: string,
	text: string,
	selection: TextSelection = {},
	maxLength = Number.POSITIVE_INFINITY,
): TextInsertion | null {
	const start = selection.start ?? value.length;
	const end = selection.end ?? start;
	const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;

	if (nextValue.length > maxLength) return null;

	return {
		value: nextValue,
		caret: start + text.length,
	};
}

export type { TextInsertion, TextSelection };
export { insertTextAtSelection };
