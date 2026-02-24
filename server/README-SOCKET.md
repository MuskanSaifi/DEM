# Sales Chat – Real-time Socket.io

Real-time chat between Sales Admin and Sales Team uses **Socket.io** (port 3001).

---

## Run locally

1. **Install dependencies** (includes `socket.io` and `socket.io-client`):
   ```bash
   npm install
   ```

2. **Start Next.js** (port 3000):
   ```bash
   npm run dev
   ```

3. **Start Socket server** (port 3001) in another terminal:
   ```bash
   npm run socket
   ```

4. Open:
   - http://localhost:3000/sales-admin-dashboard  
   - http://localhost:3000/sales-team-dashboard  

   Chat will work in real time when both are running.

---

## VPS / Production – Socket 3001 live kaise chalayein

### 1. VPS par env set karein

Project root mein `.env` (ya `.env.production`) mein ye add karein:

```env
# Socket server (port 3001)
SOCKET_PORT=3001
SOCKET_CORS_ORIGIN=https://yourdomain.com

# Next.js build ke time client socket URL (browser yahi connect karega)
NEXT_PUBLIC_SOCKET_URL=https://socket.yourdomain.com
```

- `yourdomain.com` = jahan Next.js app chal rahi hai (e.g. `https://dialexportmart.com`).
- `socket.yourdomain.com` = Socket server ka public URL (subdomain, step 4 dekhein). Agar same domain use karte hain to `NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com` rakhein aur Nginx mein `/socket.io` proxy karein.

### 2. Build aur PM2 se dono process chalayein

```bash
cd /path/to/Dialexportmart
npm install
npm run build
pm2 start ecosystem.config.cjs
```

Isse **next** (port 3000) aur **socket** (port 3001) dono start ho jayenge. Check:

```bash
pm2 status
pm2 logs
```

Restart / stop:

```bash
pm2 restart all
pm2 stop socket
pm2 start socket
```

### 3. VPS reboot par auto-start (optional)

```bash
pm2 startup
pm2 save
```

### 4. Nginx – port 3001 ko public karein

**Option A – Subdomain (recommended)**  
e.g. Socket: `socket.yourdomain.com` → `127.0.0.1:3001`

```nginx
# /etc/nginx/sites-available/socket.yourdomain.com
server {
    listen 80;
    server_name socket.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSL (HTTPS) ke liye:

```bash
sudo certbot --nginx -d socket.yourdomain.com
```

Phir `.env` mein:

```env
NEXT_PUBLIC_SOCKET_URL=https://socket.yourdomain.com
```

**Option B – Same domain, path**  
Agar app `https://yourdomain.com` pe hai, to same server block mein:

```nginx
location /socket.io/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Phir:

```env
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
```

### 5. Firewall (ufw)

Port 3001 sirf Nginx use karega (localhost), isliye public port open karne ki zaroorat nahi. Sirf 80/443 open rakhein:

```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## Env summary

| Variable | Use | Example (production) |
|----------|-----|----------------------|
| `SOCKET_PORT` | Socket server port | `3001` |
| `SOCKET_CORS_ORIGIN` | Allowed origin (Next app URL) | `https://yourdomain.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Browser socket URL | `https://socket.yourdomain.com` |

---

## Optional env (local)

- **Socket server**
  - `SOCKET_PORT` – default `3001`
  - `SOCKET_CORS_ORIGIN` – default `http://localhost:3000`

- **Next.js (client)**
  - `NEXT_PUBLIC_SOCKET_URL` – default `http://localhost:3001`
