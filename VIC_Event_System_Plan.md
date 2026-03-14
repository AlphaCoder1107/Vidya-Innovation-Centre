# VIDYA INNOVATION CENTRE
### Vidya University

---

# VIC QR-Based Event Management System
## Full Proof Technical Implementation Plan

| | |
|---|---|
| **Prepared by** | Ayush |
| **Role** | Coordinator in Chief — Vidya Innovation Centre |
| **Date** | 14 March 2026 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack Overview](#2-technology-stack-overview)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Phase-by-Phase Implementation Plan](#4-phase-by-phase-implementation-plan)
   - [Phase 1 — Supabase Database Setup](#phase-1--supabase-database-setup)
   - [Phase 2 — Hi.Events Deployment on Railway](#phase-2--hievents-deployment-on-railway)
   - [Phase 3 — Hi.Events Branding Customization](#phase-3--hievents-branding-customization)
   - [Phase 4 — GitHub Pages Landing Page](#phase-4--github-pages-landing-page)
   - [Phase 5 — Admin Panel & Security Staff Setup](#phase-5--admin-panel--security-staff-setup)
   - [Phase 6 — Testing Checklist](#phase-6--testing-checklist)
5. [Cost Summary](#5-cost-summary)
6. [Ongoing Maintenance](#6-ongoing-maintenance)
7. [Quick Reference — All URLs & Credentials](#7-quick-reference--all-urls--credentials)

---

## 1. Executive Summary

This document is the full proof technical implementation plan for the **VIC QR-Based Event Management System** at Vidya Innovation Centre, Vidya University. It covers every step from initial infrastructure setup to final deployment, testing, and handoff.

> **System Vision**
>
> - Students register for seminars/events via a public portal.
> - On successful registration, they receive a **QR-coded entry ticket via email** (Brevo SMTP).
> - Security staff log in via their mobile browsers and **scan QR codes at the gate**.
> - The system validates attendance in real-time and **grants/denies entry**.
> - Admin (VIC team) manages events, registrations, and staff from a **central dashboard**.

---

## 2. Technology Stack Overview

| Component | Role | Notes |
|---|---|---|
| **GitHub Pages** | Frontend Landing Page | Free static hosting — VIC public-facing portal |
| **Railway.app** | Hi.Events Platform Host | Free tier Docker hosting for PHP/Laravel + React app |
| **Supabase Free Tier** | PostgreSQL Database | Hosted Postgres DB used by Hi.Events |
| **Brevo (Sendinblue)** | Email / SMTP | QR ticket delivery, registration confirmations |
| **Hi.Events (OSS)** | Event Management Engine | Full ticketing, QR check-in, admin panel |
| **Cloudflare (Required for single-domain mode)** | DNS / Edge Routing / SSL | Routes `/` to GitHub Pages and `/app` to Hi.Events |

---

## 3. Architecture Diagram

The following shows the full data flow from student registration to gate check-in:

```
[ Student Browser ]
       |  visits single public domain
       v
[ Cloudflare Edge Router ]
       |  `/` -> GitHub Pages VIC landing page
       |  `/app` -> Railway Hi.Events
       v
[ GitHub Pages — VIC Landing Page ]
       |  clicks 'Register for Event' CTA (`/app`)
       v
[ Railway.app — Hi.Events Platform ]
   |  PHP/Laravel backend + React frontend
   |  Handles: event slugs, registration forms,
   |           QR generation, admin dashboard,
   |           security staff scanner login
   |
   |——————> [ Supabase PostgreSQL ]
   |           Stores: events, attendees,
   |           registrations, check-in logs
   |
   |——————> [ Brevo SMTP ]
               Sends: QR ticket emails,
               registration confirmations

[ Security Staff Phone ]
       |  opens same public domain on browser (`/app`)
       |  logs in with VIC-issued credentials
       v
[ Hi.Events QR Scanner (mobile web) ]
       |  scans student QR code
       v
[ Student Details Displayed + Entry Granted/Denied ]
```

### Implementation Artifacts Created In This Workspace

| Artifact | Purpose |
|---|---|
| `vic-landing-page/index.html` | Main GitHub Pages landing page with professional sections + animation hooks |
| `vic-landing-page/styles.css` | Responsive visual design and layout system |
| `vic-landing-page/script.js` | GSAP/AOS/Particles initialization and interactions |
| `infra/cloudflare/worker.js` | Single-domain path routing (`/` and `/app`) |
| `infra/cloudflare/wrangler.toml` | Worker deployment config template |
| `infra/railway/railway.env.template` | Railway env-var baseline for Supabase + Brevo + branding |
| `START_HERE.md` | Step-by-step kickoff checklist |

---

## 4. Phase-by-Phase Implementation Plan

---

### PHASE 1 — Supabase Database Setup
> Provision your free PostgreSQL database for Hi.Events

#### Step 1.1 — Log in to Supabase

1. Go to [supabase.com](https://supabase.com) and sign in to your existing free tier project.
2. On the dashboard, navigate to **Settings** (gear icon in the left sidebar).
3. Click on the **Database** tab.

#### Step 1.2 — Collect Your Database Credentials

You will need the following values when configuring Hi.Events. Write them down securely:

| Variable | Where to Find It |
|---|---|
| **Host** | Settings > Database > Connection Info — e.g. `db.abcdefgh.supabase.co` |
| **Port** | `5432` — always use the direct port, NOT the pooler |
| **Database Name** | `postgres` (default) |
| **Username** | `postgres` (default) |
| **Password** | The password you set when creating the project |

> ⚠️ **CRITICAL: Use Direct Connection — NOT Connection Pooler**
>
> - Hi.Events (Laravel) uses persistent DB connections.
> - Supabase's pooler (port `6543`) is for serverless/short-lived connections.
> - Always use port **5432** (direct) or your app will throw random disconnects.
> - In Supabase: **Settings > Database > disable "Use connection pooling"**.

#### Step 1.3 — Whitelist Railway IP (if needed)

1. Go to **Supabase > Settings > Database > Connection Restrictions**.
2. If IP allowlisting is enabled, add Railway's outbound IPs OR set to `0.0.0.0/0` (open).
3. On the free tier this is usually open by default — no action needed.

---

### PHASE 2 — Hi.Events Deployment on Railway
> Fork, configure, and deploy Hi.Events using Docker on Railway free tier

#### Step 2.1 — Fork the Hi.Events Repository

1. Go to [github.com/HiEventsDev/Hi.Events](https://github.com/HiEventsDev/Hi.Events)
2. Click the **Fork** button (top-right) — fork it to YOUR GitHub account.
3. Name it: `vic-events` (recommended for clarity)

Your fork URL will be: `github.com/YOUR_USERNAME/vic-events`

#### Step 2.2 — Create a Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **Login** and sign in with your GitHub account.
3. Railway will automatically connect to your GitHub repositories.

#### Step 2.3 — Create New Railway Project

1. On Railway dashboard, click **New Project**.
2. Select **Deploy from GitHub Repo**.
3. Choose your forked repository: `YOUR_USERNAME/vic-events`.
4. Railway will auto-detect the `Dockerfile.all-in-one` — leave all settings as default.
5. Click **Deploy**. The first build will take 5–10 minutes.

#### Step 2.4 — Generate App Keys

You need two secrets: `APP_KEY` and `JWT_SECRET`. Run these commands in your terminal (any PC):

```bash
# Generate APP_KEY
node -e "console.log('base64:' + require('crypto').randomBytes(32).toString('base64'))"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy and save both outputs — you'll need them in Step 2.5.

#### Step 2.5 — Set All Environment Variables in Railway

In Railway: click your service > **Variables** tab > click **New Variable** and add each of the following:

| Variable Name | Value |
|---|---|
| `APP_KEY` | `base64:YOUR_GENERATED_KEY` (from Step 2.4) |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://YOUR-APP.up.railway.app` (set after Step 2.6) |
| `APP_FRONTEND_URL` | `https://YOUR-APP.up.railway.app` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | `db.xxxx.supabase.co` (from Step 1.2) |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | `postgres` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | your Supabase password |
| `JWT_SECRET` | `YOUR_JWT_SECRET` (from Step 2.4) |
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp-relay.brevo.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `your_brevo_login_email@domain.com` |
| `MAIL_PASSWORD` | `your_brevo_smtp_key` |
| `MAIL_ENCRYPTION` | `tls` |
| `MAIL_FROM_ADDRESS` | `events@vidya.edu.in` |
| `MAIL_FROM_NAME` | `Team VIC` |
| `QUEUE_CONNECTION` | `sync` |
| `SESSION_DRIVER` | `cookie` |
| `CACHE_DRIVER` | `array` |

> 💡 **How to get your Brevo SMTP Key**
>
> 1. Log in to [brevo.com](https://brevo.com)
> 2. Go to: **Your Account Name (top right) > SMTP & API**
> 3. Click the **SMTP** tab
> 4. Your login = your Brevo account email
> 5. Your password = the SMTP Key shown there (starts with `xsmtp...`)

#### Step 2.6 — Generate Public Domain on Railway

1. In Railway, click your service.
2. Go to **Settings** tab > **Networking** section.
3. Click **Generate Domain**.
4. You will get a URL like: `vic-events-production.up.railway.app`
5. Go back to **Variables** and update `APP_URL` and `APP_FRONTEND_URL` with this URL.
6. Railway will auto-redeploy with the updated variables.

#### Step 2.7 — Verify Deployment

1. Wait for Railway build to complete (green checkmark).
2. Open your Railway URL in a browser.
3. You should see the Hi.Events setup/login screen.
4. Create your admin account on first launch.

> ⚠️ **If the app shows a 500 error on first launch**
>
> - Go to Railway > your service > **Deployments > View Logs**
> - Common fix: The database may need migrations to run.
> - In Railway, go to service > **Settings** and add a start command:
>   ```
>   php artisan migrate --force && php-fpm
>   ```
> - Redeploy and it should work.

---

### PHASE 3 — Hi.Events Branding Customization
> Replace Hi.Events identity with VIC / Team VIC branding

#### Step 3.1 — Replace the Application Logo

In your forked GitHub repo (`vic-events`), navigate to the following path and replace the logo:

```
# File path in repo:
frontend/src/assets/images/logo.svg   (or logo.png)

# Replace with Vidya University logo:
# URL: https://www.vidya.edu.in/images/VU.png
# Download the image, rename it to match the existing logo filename,
# and commit it to the same path in your fork.
```

#### Step 3.2 — Replace 'Hi.Events' with 'VIC' Globally

Perform a global search-and-replace across these files in your fork:

| File | Change to Make |
|---|---|
| `frontend/index.html` | `<title>Hi.Events</title>` → `<title>VIC — Vidya Innovation Centre</title>` |
| `frontend/src/app.tsx` or `main.tsx` | Search `Hi.Events` → replace with `VIC` |
| `backend/config/app.php` | `'name' => 'Hi.Events'` → `'name' => 'VIC'` |
| `backend/resources/views/emails/` | Replace `Hi.Events` with `Team VIC` in all `.blade.php` email templates |
| `frontend/public/manifest.json` | Change `name` and `short_name` to `VIC` |

#### Step 3.3 — Update Email Footer Branding

Open the email templates in: `backend/resources/views/emails/`

| Find | Replace With |
|---|---|
| `Hi.Events Team` | `Team VIC` |
| `hi.events` | your Railway URL |
| `Hi.Events — Open Source Event Platform` | `VIC — Vidya Innovation Centre` |

#### Step 3.4 — Commit & Push — Railway Auto-Redeploys

1. Commit all your branding changes to the `main` branch of your fork.
2. Railway is connected to your GitHub — it will auto-detect the push and redeploy.
3. Wait for the build to complete and verify your branded app at the Railway URL.

---

### PHASE 4 — GitHub Pages Landing Page
> Professional animated landing page for VIC — the public face of the platform

#### Step 4.1 — Create the GitHub Pages Repository

1. On GitHub, create a new repository named: `YOUR_USERNAME.github.io`
   OR create any repo named: `vic-landing-page`
2. Make sure the repository is set to **Public**.

#### Step 4.2 — Landing Page Structure

The landing page will be a single `index.html` file with inline CSS and JS:

| Section | Content |
|---|---|
| **Navigation Bar** | VIC logo (VU.png), nav links: Home, Events, About, Contact |
| **Hero Section** | Animated headline, subtitle, CTA button → Railway Hi.Events URL |
| **About VIC Section** | Description of Vidya Innovation Centre + stats |
| **How It Works Section** | 3-step animated flow: Register > Get QR > Scan & Enter |
| **Upcoming Events Section** | Cards linking to active event slugs on Hi.Events |
| **Footer** | University logo, links, contact info, Team VIC credit |

#### Step 4.3 — Animation Libraries (CDN — no install needed)

These will be loaded via CDN links in the HTML `<head>`:

| Library | Purpose |
|---|---|
| **AOS** (Animate On Scroll) | Scroll-triggered fade/slide animations |
| **GSAP** | Hero text animation, smooth transitions |
| **Particles.js** | Animated background particles for hero section |
| **Font Awesome** | Icons for sections |
| **Google Fonts** | Inter / Poppins typography |

#### Step 4.4 — Enable GitHub Pages

1. Go to your GitHub repository > **Settings**.
2. Scroll down to **Pages** section (left sidebar).
3. Under Source, select **Deploy from branch > main > / (root)**.
4. Click **Save**. Your site will be live at:
   `https://YOUR_USERNAME.github.io/vic-landing-page`
5. *(Optional)* Point a custom domain like `vic.vidya.edu.in` via CNAME record in DNS.

---

### PHASE 5 — Admin Panel & Security Staff Setup
> Configure events, staff accounts, and QR scanner access

#### Step 5.1 — Create Your Admin Account

1. Open your Railway URL (e.g. `vic-events.up.railway.app`).
2. On first launch, you'll be prompted to create an account — this becomes the **super admin**.
3. Use your official VIC email address for the admin account.

#### Step 5.2 — Create an Event (Slug-Based)

1. Log in to the admin dashboard.
2. Click **Create Event**.
3. Fill in: Event Name, Date, Description, Venue, Capacity.
4. The system will auto-generate a URL slug (e.g. `/e/annual-tech-summit-2025`).
5. Students access: `YOUR_RAILWAY_URL/e/annual-tech-summit-2025` to register.

#### Step 5.3 — Create Security Staff Logins

1. In the admin panel, go to: **Settings > Team / Check-In Staff**.
2. Click **Add Check-In Staff**.
3. Enter name and email for each security person.
4. Set their role to **Check-In Only** (no admin access).
5. They receive a login email — they log in at your Railway URL on their phone.

#### Step 5.4 — QR Scanning Workflow (Gate Day)

| Step | Action |
|---|---|
| 1. Security opens browser | Opens Railway URL on mobile Chrome/Safari |
| 2. Login | Uses credentials created in Step 5.3 |
| 3. Select Event | Chooses the current event from the dashboard |
| 4. Tap 'Check In' | Opens the QR scanner (uses phone camera) |
| 5. Scan student QR | Student shows QR from their email ticket |
| 6. Result shown | Student name, registration status displayed |
| 7. Grant/Deny | Tap ✅ to grant entry or ❌ to deny |

---

### PHASE 6 — Testing Checklist
> Complete ALL tests before going live at any real event

| Test Case | Expected Result |
|---|---|
| ✅ Database connection | No DB errors in Railway logs on startup |
| ✅ Admin login | Successfully log in at Railway URL |
| ✅ Create test event | Dummy event created with slug `test-event-2025` |
| ✅ Student registration | Register using a test email address |
| ✅ QR email delivery | QR ticket email arrives in inbox (not spam) |
| ✅ QR scan on mobile | Log in as security staff on phone, scan the QR |
| ✅ Entry granted | System shows student details and grants entry |
| ✅ Duplicate scan | Same QR scanned again — flagged as already checked in |
| ✅ Landing page | GitHub Pages URL loads with all animations and CTAs |
| ✅ Mobile responsiveness | Landing page layout correct on phone |
| ✅ Email branding | All emails say "Team VIC" not "Hi.Events" |

---

## 5. Cost Summary

> This entire system runs on free tiers with **zero ongoing cost** under normal university event usage.

| Service | Purpose | Cost |
|---|---|---|
| **GitHub Pages** | Landing Page Hosting | Free — unlimited |
| **Railway.app** | Hi.Events App Hosting | Free — $5 credit/month (enough for always-on) |
| **Supabase Free Tier** | PostgreSQL Database | Free — 500MB storage, 2 projects |
| **Brevo SMTP** | Email Delivery | Free — 300 emails/day |
| **Hi.Events** | Event Management Platform | Free — Open Source (AGPL-3.0) |
| **SSL Certificate** | HTTPS Security | Free — Railway auto-provisions via Let's Encrypt |
| | **TOTAL** | **₹0 / month** |

> 💡 **Scaling Note**
>
> - If you send more than **300 emails/day** (large events), upgrade Brevo to Starter plan (~₹1,800/month).
> - Railway free tier may **sleep after inactivity** — upgrade to Hobby ($5/month USD) for always-on.
> - Supabase free tier supports **500MB storage** — sufficient for years of event data at university scale.

---

## 6. Ongoing Maintenance

| Task | How to Do It |
|---|---|
| **Update Hi.Events** | Pull updates from upstream `HiEventsDev/Hi.Events` into your fork and push to Railway |
| **Monitor logs** | Railway > Deployments > View Logs for any issues |
| **Backup database** | Supabase > Settings > Database > Backups — download periodic snapshots |
| **Rotate SMTP credentials** | If emails stop working, regenerate SMTP key in Brevo and update Railway Variables |
| **Add new events** | Admin panel > Create Event — no code changes needed |
| **Add/remove staff** | Admin panel > Team Settings — add or remove check-in staff instantly |

---

## 7. Quick Reference — All URLs & Credentials

> ⚠️ **Store this section securely — do not share with unauthorised persons**

```
Admin Panel URL:       https://YOUR-APP.up.railway.app
Student Registration:  https://YOUR-APP.up.railway.app/e/EVENT-SLUG
Security Scanner:      https://YOUR-APP.up.railway.app  (login as check-in staff)
GitHub Pages URL:      https://YOUR_USERNAME.github.io/vic-landing-page

Railway Dashboard:     https://railway.app/dashboard
Supabase Dashboard:    https://supabase.com/dashboard
Brevo SMTP Dashboard:  https://app.brevo.com
```

---

*Vidya Innovation Centre | Vidya University | Team VIC*
