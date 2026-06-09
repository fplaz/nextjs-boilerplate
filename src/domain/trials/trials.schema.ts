import { z } from "zod";

export const trialStatus = z.enum(["active", "expired", "converted"]);

export type TrialStatus = z.infer<typeof trialStatus>;

export const trialRow = z.object({
  workspace_id: z.string().uuid(),
  status: trialStatus,
  plan: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  two_day_warning_sent: z.boolean(),
  one_day_warning_sent: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TrialRow = z.infer<typeof trialRow>;

export const createTrialInput = z.object({
  workspace_id: z.string().uuid(),
});

export type CreateTrialInput = z.infer<typeof createTrialInput>;
