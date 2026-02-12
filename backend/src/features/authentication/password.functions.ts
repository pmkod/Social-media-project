import bcrypt from "bcryptjs";

const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

type ComparePasswordToHashParams = {
  password: string;
  hash: string;
};

const comparePasswordToHash = ({
  password,
  hash,
}: ComparePasswordToHashParams) => {
  return bcrypt.compareSync(password, hash);
};

export { hashPassword, comparePasswordToHash };
