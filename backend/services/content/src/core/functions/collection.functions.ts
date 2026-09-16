const uniqueValues = <T>(values: readonly T[]): T[] => {
	const result: T[] = [];
	for (const value of values) {
		if (!result.includes(value)) result.push(value);
	}
	return result;
};

export { uniqueValues };
