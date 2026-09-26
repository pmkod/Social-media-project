const removeDuplicateStrings = (values: string[]): string[] =>
	Array.from(new Set(values));

export { removeDuplicateStrings };
