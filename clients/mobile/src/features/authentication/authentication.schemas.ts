import { z } from 'zod';

const emailPattern = /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const authenticationFields = {
  emailOrUsername: z.string().trim().min(1, 'Email or username is required.'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long.')
    .max(50, 'Username must be no more than 50 characters long.')
    .regex(/^[a-zA-Z0-9._]+$/, 'Use only letters, numbers, dots, and underscores.'),
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required.')
    .max(100, 'Full name must be no more than 100 characters long.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .max(255, 'Email must be no more than 255 characters long.')
    .regex(emailPattern, 'Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  passwordConfirmation: z.string().min(1, 'Please confirm your password.'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit verification code.'),
};

export const loginSchema = z.object({
  emailOrUsername: authenticationFields.emailOrUsername,
  password: authenticationFields.password,
});

export const signupSchema = z.object({
  fullName: authenticationFields.fullName,
  email: authenticationFields.email,
  password: authenticationFields.password,
});

export const passwordResetSchema = z.object({ email: authenticationFields.email });
export const verificationSchema = z.object({ code: authenticationFields.code });
export const completeSignupSchema = z.object({ username: authenticationFields.username });

export const newPasswordSchema = z
  .object({
    password: authenticationFields.password,
    confirmation: authenticationFields.passwordConfirmation,
  })
  .refine((value) => value.password === value.confirmation, {
    message: 'Passwords do not match.',
    path: ['confirmation'],
  });
