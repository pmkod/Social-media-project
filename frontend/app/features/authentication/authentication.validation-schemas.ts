import z from "zod";

const loginValidationSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const signupValidationSchema = z.object({
  firstName: z.string("First name field required"),
  lastName: z.string("Last name field required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const storeSignupValidationSchema = z.object({
  storeName: z.string("Store name field required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Schema for email validation
const passordResetValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const newPasswordValidationSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmNewPassword: z.string(),
});

const userVerificationValidationSchema = z.object({
  code: z.string(),
});

export {
  loginValidationSchema,
  signupValidationSchema,
  passordResetValidationSchema,
  newPasswordValidationSchema,
  userVerificationValidationSchema,
  storeSignupValidationSchema,
};
