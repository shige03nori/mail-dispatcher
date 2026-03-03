export async function register() {
  // Node.js ランタイムのみ（Edge Runtime では動かさない）
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/lib/scheduler");
    startScheduler();
  }
}
