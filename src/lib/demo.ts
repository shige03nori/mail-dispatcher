export const isDemoMode = process.env.DEMO_MODE === "true";

export const DEMO_ACCOUNT_EMAILS = [
  "admin@demo.example",
  "editor@demo.example",
  "viewer@demo.example",
] as const;

export function isDemoAccount(email: string): boolean {
  return (DEMO_ACCOUNT_EMAILS as readonly string[]).includes(email.toLowerCase());
}
