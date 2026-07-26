const hashAlgorithm = "argon2id";

const hashPassword = (password: string) => {
	return Bun.password.hash(password, { algorithm: hashAlgorithm });
};

type ComparePasswordToHashParams = {
	password: string;
	hash: string;
};

const comparePasswordToHash = ({
	password,
	hash,
}: ComparePasswordToHashParams) => {
	return Bun.password.verify(password, hash, hashAlgorithm);
};

export { hashPassword, comparePasswordToHash };
