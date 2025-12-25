/**
 * Next.js Instrumentation File
 * Ye file server start par automatically load hoti hai
 * Global error handlers yahan initialize hote hain
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // ✅ Import error handlers
    await import("./lib/errorHandler.js");
  }
}
