import Mailgun from "mailgun.js";
import FormData from "form-data";
import {
  welcomeEmailHtml,
  trialTwoDayWarningHtml,
  trialOneDayWarningHtml,
  trialExpiredHtml,
} from "./email.templates";

type ServiceResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string };

const mailgun = new Mailgun(FormData);

function getClient() {
  return mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY!,
  });
}

function getDomain() {
  return process.env.MAILGUN_DOMAIN!;
}

function getFrom() {
  return process.env.MAILGUN_FROM_EMAIL ?? "LaunchKit Team <team@example.com>";
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<ServiceResult> {
  try {
    const mg = getClient();
    await mg.messages.create(getDomain(), { from: getFrom(), to: [to], subject, html });
    return { data: null, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { data: null, error: message };
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName?: string
): Promise<ServiceResult> {
  return sendEmail(email, "Welcome to LaunchKit!", welcomeEmailHtml(firstName));
}

export async function sendTrialTwoDayWarning(
  email: string,
  firstName?: string
): Promise<ServiceResult> {
  return sendEmail(
    email,
    "Your trial ends in 2 days",
    trialTwoDayWarningHtml(firstName)
  );
}

export async function sendTrialOneDayWarning(
  email: string,
  firstName?: string
): Promise<ServiceResult> {
  return sendEmail(
    email,
    "Your trial expires tomorrow",
    trialOneDayWarningHtml(firstName)
  );
}

export async function sendTrialExpired(
  email: string,
  firstName?: string
): Promise<ServiceResult> {
  return sendEmail(
    email,
    "Your trial has ended",
    trialExpiredHtml(firstName)
  );
}
