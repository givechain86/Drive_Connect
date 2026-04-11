/** Client-safe optional feedback targets (set in `.env.local`). */
export function getPublicFeedbackEmail(): string {
  return (process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? "").trim();
}

export function getPublicFeedbackFormUrl(): string {
  return (process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL ?? "").trim();
}
