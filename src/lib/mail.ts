export async function sendMagicLink(toEmail: string, url: string) {
  // 開発用: 本物のメール送信は後で（SMTP/SendGrid/Nodemailerに差し替え）
  console.log("========================================");
  console.log("📩 Magic Link (DEV)");
  console.log("To:", toEmail);
  console.log("URL:", url);
  console.log("========================================");
}
