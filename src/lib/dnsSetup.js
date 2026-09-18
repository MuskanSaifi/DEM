import dns from "node:dns";

/** Public DNS for c-ares (`resolveSrv` / `resolve4`). Does not affect `dns.lookup`. */
const PUBLIC_DNS = ["8.8.8.8", "1.1.1.1"];

try {
  dns.setServers(PUBLIC_DNS);
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {
  // ignore — connect layer still rewrites mongodb+srv://
}

export { PUBLIC_DNS };
