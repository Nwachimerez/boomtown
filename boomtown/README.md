# Restaurant Online Ordering Template

Vanilla JS + Firebase (CDN SDK) + Paystack, deployable to Netlify — same stack as your other projects. Originally built for BoomTown Restaurant & Coffee Shop PHC, now structured as a reusable template.

## 🍽️ Cloning this for a new restaurant client

**This is the whole process — everything else in this README is one-time technical setup.**

1. Duplicate this whole folder for the new client.
2. Open `js/restaurant-config.js` — that's the ONLY file with business content (name, tagline, phone, address, hours, hero copy, about text, ticker messages, brand colors, delivery fee). Edit every field to match the new restaurant. Nothing else in any `.html` file needs to change — every page reads from this file automatically.
3. Set up a fresh Firebase project, Cloudinary account, and Paystack account for the new client (steps below) — each client needs their own, since orders/menu data shouldn't mix between restaurants.
4. Deploy to a new Netlify site.

That's it — same template, new brand, ~30–45 minutes once you've done it twice.

## What's included
- `index.html` — homepage (hero, featured dishes pulled live from Firestore, hours/location)
- `menu.html` — full menu with category filters, add to cart
- `checkout.html` — customer details, pickup/delivery, Paystack payment
- `order-confirmation.html` — post-payment confirmation
- `admin/login.html` + `admin/dashboard.html` — staff-only menu & order management
- `netlify/functions/verify-payment.js` — server-side Paystack verification
- `firestore.rules` — security rules to paste into Firebase console

Dish photos are hosted on **Cloudinary** (free tier, no card required) instead of Firebase Storage, since Firebase now requires the paid Blaze plan for Storage.

## 1. Create the Firebase project
1. Go to console.firebase.google.com → **Add project**.
2. Enable **Authentication** → Sign-in method → **Email/Password**.
3. Enable **Firestore Database** (production mode).
4. Project settings → General → *Your apps* → add a **Web app** → copy the config object into `js/firebase-config.js` (replace the `YOUR_...` placeholders).

## 1b. Create your free Cloudinary account (for dish photos)
1. Sign up at cloudinary.com — free tier, no card needed.
2. On your Cloudinary dashboard, copy the **Cloud name** at the top → paste into `CLOUDINARY_CLOUD_NAME` in `js/firebase-config.js`.
3. Go to **Settings (gear icon) → Upload → Upload presets → Add upload preset**.
4. Set **Signing Mode** to **Unsigned**, give it a name (e.g. `boomtown_menu`), Save.
5. Paste that preset name into `CLOUDINARY_UPLOAD_PRESET` in `js/firebase-config.js`.
6. That's it — the admin dashboard now uploads photos straight to Cloudinary and stores the resulting image URL on the menu item in Firestore.

## 2. Create your admin account
1. Authentication → Users → **Add user** → enter your email + a password. Copy the generated **UID**.
2. Firestore → Start collection `admins` → create a document whose **Document ID is that UID** (fields don't matter, e.g. `{ email: "you@boomtown.com" }`).
3. This is what `admin/login.html` checks before letting anyone into the dashboard — add one `admins/{uid}` doc per staff member who should have access.

## 3. Apply security rules
- Firestore → Rules → paste the contents of `firestore.rules` → Publish.

## 4. Paystack setup
1. Get your keys from the Paystack dashboard (Settings → API Keys & Webhooks).
2. Put the **public key** in `js/firebase-config.js` → `PAYSTACK_PUBLIC_KEY`.
3. The **secret key** goes only in Netlify's environment variables (never in front-end code) — see step 5.
4. Start with `pk_test_...` / `sk_test_...` to test, switch to live keys when ready to go live.

## 5. Deploy to Netlify
1. Push this folder to a GitHub repo (or drag-and-drop the folder into Netlify — but note the serverless function needs a repo-based deploy to build correctly).
2. Netlify → **Add new site** → import from GitHub.
3. Site settings → Environment variables → add `PAYSTACK_SECRET_KEY` = your Paystack secret key.
4. Deploy. Netlify will detect `netlify.toml` and automatically deploy the function at `/.netlify/functions/verify-payment`.

## 6. Add your menu
- Go to `yoursite.netlify.app/admin/login.html`, sign in, and use **+ Add menu item** to upload dishes with photos, price, and category. They appear on the live menu immediately.

## Notes
- Delivery fee is a flat ₦1,500, set in `js/checkout.js` (`DELIVERY_FEE`) — change as needed, or make it dynamic by area later.
- Orders write to Firestore only after Paystack verification succeeds server-side, so a customer can't fake a "paid" order from the browser.
- Client-side filtering (not `orderBy` + `where` composite queries) is used on the menu page to avoid Firestore composite index errors, matching your other projects.
- To add more staff, just add another `admins/{uid}` document — no code changes needed.
