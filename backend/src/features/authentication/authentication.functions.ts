import { customAlphabet, nanoid } from "nanoid";

const generateUserVerificationCode = () => {
  return customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ")(6);
};

const generateUserVerificationToken = () => {
  return nanoid(400);
};

export { generateUserVerificationCode, generateUserVerificationToken };
