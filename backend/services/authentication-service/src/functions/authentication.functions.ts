export function generateUserVerificationCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateUserVerificationToken(): string {
	return crypto.randomUUID();
}
