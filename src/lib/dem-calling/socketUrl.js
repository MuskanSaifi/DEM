/** Phone WebView: same PC IP, port 3001 — localhost phone par kaam nahi karta */
export function resolveCallingSocketUrl(override) {
  if (override) return override;

  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_SOCKET_URL || "";
  }

  const env = process.env.NEXT_PUBLIC_SOCKET_URL || "";
  if (env && !env.includes("localhost") && !env.includes("127.0.0.1")) {
    return env;
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3001`;
}
