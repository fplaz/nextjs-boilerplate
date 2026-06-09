import { z } from "zod";
import { SLUG_REGEX } from "@/lib/slug";

const passwordStrength = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^a-zA-Z0-9]/, "Password must include a special character");

export const signUpInput = z.object({
  email: z.string().email(),
  password: passwordStrength,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  accountSlug: z
    .string()
    .min(1, "Account slug is required")
    .max(50, "Account slug must be 50 characters or less")
    .regex(
      SLUG_REGEX,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
});

export const signInInput = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordInput = z.object({
  email: z.string().email(),
});

export const resetPasswordInput = z
  .object({
    password: passwordStrength,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpInput>;
export type SignInInput = z.infer<typeof signInInput>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInput>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;

export const checkEmailInput = z.object({
  email: z.string().email(),
});
export type CheckEmailInput = z.infer<typeof checkEmailInput>;

export const magicLinkInput = z.object({
  email: z.string().email(),
});
export type MagicLinkInput = z.infer<typeof magicLinkInput>;
