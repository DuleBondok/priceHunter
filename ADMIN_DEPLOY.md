# Admin UI → admin.pricely.rs

Repo: https://github.com/DuleBondok/priceHunter  
API: https://pricehunterserver.onrender.com

## A) Vercel project

1. https://vercel.com/new → Import **DuleBondok/priceHunter**
2. Framework: Create React App (or Other)
3. Build: `npm run build` · Output: `build`
4. Env (optional; `.env.production` is in repo):
   - `REACT_APP_API_BASE_URL` = `https://pricehunterserver.onrender.com`
5. Deploy

## B) Domain admin.pricely.rs

1. Vercel project → **Settings → Domains** → add `admin.pricely.rs`
2. DNS (Cloudflare / registrar for `pricely.rs`):
   - Type: **CNAME**
   - Name: `admin`
   - Target: `cname.vercel-dns.com` (or the value Vercel shows)
3. Wait for SSL (usually a few minutes)

## C) Render CORS (required)

On **pricehunterserver** → Environment, set:

```
CORS_ORIGINS=https://admin.pricely.rs,http://localhost:3000
```

Then **Restart** the service (env change).

## D) Smoke test

1. Open https://admin.pricely.rs → login
2. API line on login should show `https://pricehunterserver.onrender.com`
3. Receipt verification / scrapers load without CORS errors
