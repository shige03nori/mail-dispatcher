import crypto from "crypto";

export function generateToken(): string {
  // URLに載せても崩れにくいのでbase64urlにしとく
  return crypto.randomBytes(32).toString("base64url");
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
