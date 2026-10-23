# أمونة كوزين — Amouna Cuisine

Next.js 15 (App Router) + Tailwind v4 storefront for Amouna Cuisine's home-made frozen and ready food (Instagram @amouna_cuisine),
in Arabic (`/ar`, RTL) and English (`/en`). Customers fill a "tray" and send it as a formatted
WhatsApp order (always in Arabic) to 70 54 88 30. Everything on the site is managed from the admin panel at `/admin`.

```bash
npm install
cp .env.example .env.local   # then fill in ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET
npm run dev                  # site: http://localhost:3000   admin: http://localhost:3000/admin
```

Locally, with no `DATABASE_URL`, the app uses an embedded Postgres in `.data/` and saves uploaded
photos to `public/uploads/`. Stop the dev server and delete `.data/` to start over from the original catalogue.

The starting catalogue (`src/data/products.ts`) is a typical village-mouneh range to confirm with the shop, and no
prices were published: every product starts at 0, shown as "price on WhatsApp" and left out of totals. Product and
season photos come from Wikimedia Commons (free licences, credited on the site; lists in `src/data/photos.ts` and
`src/lib/village.ts`). The "From our kitchen" strip uses the shop's own reels. Upload the shop's own product photos
from the admin to replace the stock ones.

Design: "the namliyeh" (the pantry cabinet in the logo's «بكل نمليّة»): paper white, the logo's taupe ink line, mint and
nigella-seed black; products are ridged jar lids on ink shelves behind mesh doors; overlays grow as a circle from
where they were tapped.

## Admin panel

Sign in at `/admin` with the super admin's username and password. From there:

- **Products**: name, description and note in Arabic and English, photo, ingredients and an "about"
  text shown in the product details, sizes and prices with a travel-packaging fee per size, sale by weight
  (customers pick 250 g, 1½ kg…), customer options (spice level, garlic, extra walnut…) whose extra price
  can differ per size, available / best seller, and order within a category.
- **Categories**: names, emoji, colour and display order.
- **Site settings**: logo, website title, brand name, tagline, welcome message, WhatsApp number,
  currency, notices, travel packaging, and which products give free delivery.
- **Website texts**: every button and label on the site, in both languages. An empty field keeps the default wording.
- **Account**: change the username or password. Changing the password signs out every other device.

Saving updates the public site immediately. After 5 wrong passwords, sign-in is locked for 15 minutes.

## Deploying to Vercel

1. Import the repository in Vercel.
2. **Storage → Create → Neon (Postgres)**, and connect it to the project. This sets `DATABASE_URL`.
3. **Storage → Create → Blob**, and connect it. This sets `BLOB_READ_WRITE_TOKEN` (used for photo uploads).
4. **Settings → Environment Variables**: add `ADMIN_USERNAME`, `ADMIN_PASSWORD` (8+ characters) and
   `SESSION_SECRET` (e.g. the output of `openssl rand -base64 48`).
5. Deploy, then add the website's domain under **Settings → Domains**. The admin panel is at `https://<domain>/admin`.

On first use the tables are created and filled from `src/data/` (the catalogue is `src/data/products.ts`).
To push a changed catalogue over the live one, raise `CATALOG_VERSION` in `src/server/db/seed.ts`: the next
request after deploy updates products, categories and the welcome text (photos uploaded in the admin are kept). The admin account is created from
`ADMIN_USERNAME` / `ADMIN_PASSWORD` the first time someone signs in. After that those two variables are no
longer read: change the password from the Account page.

**Forgot the password?** Run `DELETE FROM admin;` in the Neon SQL editor, then sign in with the
`ADMIN_USERNAME` / `ADMIN_PASSWORD` values set in Vercel.

## API

All admin endpoints require the session cookie set by `POST /api/admin/login`.

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/catalog` | GET | Public read-only catalogue (settings, categories, products in both languages) |
| `/api/admin/login`, `/api/admin/logout` | POST | Sign in / out |
| `/api/admin/account` | GET, PUT | Username and password |
| `/api/admin/settings` | GET, PUT | Site settings |
| `/api/admin/texts` | GET, PUT | Interface text overrides |
| `/api/admin/categories` | GET, POST | List / create |
| `/api/admin/categories/:id` | PUT, DELETE | Edit / delete (only when the category is empty) |
| `/api/admin/categories/reorder` | POST | `{ ids }` in display order |
| `/api/admin/products` | GET, POST | List / create |
| `/api/admin/products/:id` | GET, PUT, PATCH, DELETE | Read / edit / toggle available or featured / delete |
| `/api/admin/products/reorder` | POST | `{ ids }` of one category in display order |
| `/api/admin/upload` | POST | Multipart `file` (JPG/PNG/WebP/AVIF, ≤ 5 MB) → `{ url }` |

## Where things live

| What | File |
| --- | --- |
| Database tables | `src/server/db/schema.ts` |
| Catalogue (seed data) | `src/data/products.ts` and `src/data/*.json`, copied by `src/server/db/seed.ts` |
| Prices, options, packaging, receipt | `src/lib/order.ts` |
| Product details | `src/components/ProductView.tsx` |
| Site data reads (cached, refreshed on every admin save) | `src/lib/catalog.ts` |
| Admin sign-in and sessions | `src/server/auth.ts`, `src/server/session.ts`, `src/middleware.ts` |
| Input validation | `src/server/validation.ts` |
| Admin API routes | `src/app/api/admin/**` |
| Admin panel UI | `src/app/admin/**` |
| Interface text defaults (Arabic / English) | `src/lib/i18n.ts` |
| WhatsApp receipt format | `src/lib/order.ts` → `buildWhatsAppMessage` |
