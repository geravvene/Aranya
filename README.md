# ARANYA DIGITAL MENU & INVENTORY SYSTEM — Deployment Guide

This repository contains the complete production-grade implementation of the **ARANYA Digital Menu & Inventory System** tailored for ARANYA Botanical Dispensary & Lounge in Bangkok, Thailand.

---

## Tech Stack & Architecture
- **Framework:** Next.js 14 (App Router, Server Actions, Server Components)
- **Styling:** Tailwind CSS, custom botanical dark theme
- **Database & ORM:** PostgreSQL (Supabase / Neon free tier) via Prisma ORM
- **Internationalization (i18n):** Instant zero-reload toggle between English (`EN`) and Thai (`ภาษาไทย`)
- **Security:** 4-digit Staff PIN gateway with HttpOnly session cookies (Default PIN: `1234`)
- **Compliance:** Thai MOPH & DTAM Regulation No. 2 compliant (20+ age verification gate, informational/educational catalogue, no e-commerce checkout)

---

## Project Structure
- [`prisma/schema.prisma`](prisma/schema.prisma:1) — Relational schema (`Category`, `Product`, `StaffSession`)
- [`prisma/seed.ts`](prisma/seed.ts:1) — Initial seed dataset (8+ authentic Thai dispensary items)
- [`lib/db.ts`](lib/db.ts:1) — Prisma client singleton
- [`lib/i18n.ts`](lib/i18n.ts:1) — Bilingual dictionary (EN & TH)
- [`app/actions.ts`](app/actions.ts:1) — Next.js Server Actions (PIN auth, availability toggle, inline price editor, CRUD)
- [`components/CustomerMenu.tsx`](components/CustomerMenu.tsx:1) — Customer tablet/mobile menu with search, category filtering, sensory & terpene modal, and LINE OA QR modal
- [`components/StaffCMS.tsx`](components/StaffCMS.tsx:1) — Counter staff portal with PIN gateway, live availability switches, fast price editor, and product creation/edit drawer
- [`app/page.tsx`](app/page.tsx:1) — Customer menu route (`/`)
- [`app/staff/page.tsx`](app/staff/page.tsx:1) — Staff CMS route (`/staff`)
- [`app/qr/page.tsx`](app/qr/page.tsx:1) — Printable QR code route (`/qr`)

---

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/aranya?schema=public"
   ```

3. **Run database migration & seed:**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Staff portal is at [http://localhost:3000/staff](http://localhost:3000/staff) (PIN: `1234`).

---

## Deployment on Vercel & Supabase (Free Tier)

1. **Database (Supabase / Neon):**
   - Create a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
   - Copy the connection string (`DATABASE_URL`).

2. **Deploy to Vercel:**
   - Push this repository to your GitHub account.
   - Import the project into [Vercel](https://vercel.com).
   - Add environment variable `DATABASE_URL` with your Supabase/Neon connection string.
   - Build Command: `npx prisma generate && next build` (or `npm run build`).

3. **Production Initialization:**
   - Run `npx prisma db push` and `npm run db:seed` against your production database URL to initialize categories and seed items.
