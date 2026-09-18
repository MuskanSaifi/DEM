const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {
  // ignore
}
