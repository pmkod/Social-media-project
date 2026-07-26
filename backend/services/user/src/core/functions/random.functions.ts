const generateRandomDigits = (length = 6): string => {
	let digits = "";
	for (let i = 0; i < length; i++) {
		digits += Math.floor(Math.random() * 10).toString();
	}
	return digits;
};

const generateRandomString = (length = 32): string => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

export { generateRandomDigits, generateRandomString };
