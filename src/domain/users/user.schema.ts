import { z } from "zod";

const passwordStrength = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^a-zA-Z0-9]/, "Password must include a special character");

export const updateProfileInput = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const changeEmailInput = z.object({
  email: z.string().email(),
});

export const changePasswordInput = z
  .object({
    password: passwordStrength,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileInput>;
export type ChangeEmailInput = z.infer<typeof changeEmailInput>;
export type ChangePasswordInput = z.infer<typeof changePasswordInput>;
