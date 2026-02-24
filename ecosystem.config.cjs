/**
 * PM2 config: run Next.js + Socket.io on VPS.
 * Usage: pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: "next",
      cwd: "./",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: { NODE_ENV: "production" },
    },
    {
      name: "socket",
      cwd: "./",
      script: "server/socket-server.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "100M",
      env: { NODE_ENV: "production" },
    },
  ],
};
