# SR Global Consultants - Brand Identity, Live Supabase Backend & Full Web Platform

An integrated native Android app and production-ready React PWA website for **SR Global Consultants**, styled with the official vibrant Aegean Cyan and Navy branding (`#009FE3` / `#0A192F`), featuring an animated splash screen, live Supabase synchronization (`https://lqggahnqfbihbnydpfre.supabase.co`), and an administrative CRM dashboard.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned with your preferences:
> - **Visual Brand Identity**: Adopting the exact logo from your uploaded image (`WhatsApp_Image_2026-11-07_at_1.45.01_AM_17c63df8.jpeg`), featuring the stylized monogram, bold serif "SR GLOBAL", and "— CONSULTANTS —" divider, with an Aegean Cyan (`#009FE3`), Pure White, and Sovereign Navy color palette across both mobile and web interfaces.
> - **Smooth Animated Splash Screen**: Integrating a high-polish splash screen featuring logo fade-in, scale bounce, and subtle glow transitions before transitioning smoothly into the main portal.
> - **Live Supabase Backend**: Wiring live REST synchronization directly into your project (`https://lqggahnqfbihbnydpfre.supabase.co` with publishable key `sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1`) with robust offline fallback so the application works seamlessly under any network condition.
> - **Dual Delivery**: Providing both the native Android app (Kotlin & Jetpack Compose in `/app`) and the complete, production-ready React + Vite + TypeScript PWA website with full admin controls in the `/web` directory.

---

### 1. Overview & Core Concept

**What It Delivers**:
A unified digital presence for **SR Global Consultants** (Gujranwala, Pakistan & Australia):
1. **Native Android Application**:
   - Animated splash screen showcasing the official white-on-cyan emblem.
   - Comprehensive student portal: Destination guides (Australia, UK, USA, Canada, Europe), course catalog with filters (Trade, Vocational, Higher Education, AQF), double-booking protected appointment scheduler, and applicant document workspace.
   - Consultant CRM mode (`/admin` access via PIN/Auth) with live lead pipelines, appointment management, and CSV export.
   - Live Supabase REST integration syncing inquiries and bookings directly to your Postgres database.
2. **Production React 18 + Vite PWA Website** (in `/web`):
   - Fast, installable Progressive Web App with service worker, offline fallback, and mobile bottom navigation.
   - Public marketing pages with SEO metadata, Open Graph tags, Google structured data, and responsive layouts.
   - Full-featured Admin Dashboard with collapsible sidebar, KPI metrics, lead CRM pipeline, appointments calendar, and content management.
   - Single-file `supabase/schema.sql` ready to run in your Supabase SQL editor.

---

### 2. User Experience & Visual Design

#### Brand Identity & Theme Tokens
- **Primary Brand Color**: Aegean Cyan (`#009FE3` / `#00A3E0`) matching the physical signage in your uploaded logo.
- **Deep Contrast Navy**: Sovereign Deep Navy (`#0A192F` / `#0F172A`) for footers, app bar accents, and executive typography.
- **Clean Surfaces**: Pure White (`#FFFFFF`) and Crisp Sky Pale (`#F0F9FF`) container cards with subtle ice-blue borders (`#BAE6FD`).
- **Accent Highlights**: Warm Amber Gold (`#F59E0B`) for call-to-action badges and ratings; WhatsApp Green (`#25D366`) for direct chat.

#### Motion & Splash Experience
```
[App Launch]
     │
     ▼
┌────────────────────────────────────────────────────────┐
│  Animated Splash Screen (Aegean Cyan Background #009FE3)│
│  • Circular pulse & scale-in of official white emblem  │
│  • Smooth letter-spacing reveal: "SR GLOBAL"           │
│  • Staggered fade: "— CONSULTANTS —"                  │
│  • Subtle loading progress glow (Duration: ~1.8s)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Main Student Portal with Smooth Crossfade Navigation   │
└────────────────────────────────────────────────────────┘
```

---

### 3. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           SR Global Consultants                           │
├─────────────────────────────────────┬─────────────────────────────────────┤
│         Native Android App          │         React PWA Website           │
│         (Kotlin / Compose)          │       (React 18 / Vite / TS)        │
│  • Splash Screen Animation          │  • Full Public Pages & SEO Meta     │
│  • Destinations, Courses & Booking  │  • Complete Admin Dashboard         │
│  • Consultant CRM Admin Mode        │  • Manifest & Service Worker PWA    │
└──────────────────┬──────────────────┴──────────────────┬──────────────────┘
                   │                                     │
                   ▼                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│               Live Supabase Backend (PostgreSQL + RLS + REST)              │
│       Project: https://lqggahnqfbihbnydpfre.supabase.co                    │
│       Key: sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1                 │
│                                                                           │
│   • leads (CRM Pipeline: New, Contacted, In Progress, Converted)          │
│   • appointments (Unique slot index to prevent double-booking)            │
│   • courses & course_categories (Trade, Vocational, Higher Ed, AQF)       │
│   • destinations (Australia, UK, USA, Canada, Europe)                     │
│   • students & student_documents (Applicant tracking & checklists)        │
│   • site_settings & testimonials (Real-time dynamic content)              │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Live Supabase Integration Strategy
- **Android Network Layer**: Direct HTTPS REST synchronization via OkHttp and Moshi against `https://lqggahnqfbihbnydpfre.supabase.co/rest/v1/` using the provided publishable key and bearer headers.
- **Fail-Safe Offline Repository**: In the event of network disruption or before database tables are initialized, the app falls back seamlessly to the local cache so user interaction is never blocked.
- **SQL Execution**: The updated `supabase/schema.sql` file can be executed in one click in the Supabase Dashboard to establish all tables, triggers, and security rules.

---

### 4. Implementation Steps

1. **Brand Assets & Launcher Icon**:
   - Extract and crop the official logo emblem from the uploaded image.
   - Update `ic_launcher_foreground.xml`, `ic_launcher_background.xml` (using `#009FE3`), and generate raster mipmaps.
   - Update `Color.kt` and `Theme.kt` with the official Aegean Cyan palette.

2. **Animated Splash Screen**:
   - Build `SplashScreen.kt` with smooth spring-scale animations, emblem glow, and auto-transition to the home screen.
   - Integrate with `MainActivity.kt`.

3. **Live Supabase Client in Android**:
   - Store project credentials in `.env` and `BuildConfig`.
   - Implement `SupabaseClient.kt` to push leads and appointments live to the remote Supabase database while respecting double-booking constraints.

4. **React PWA Web Platform (`/web`)**:
   - Scaffold complete React 18 + Vite + TypeScript project with Tailwind CSS, Lucide icons, and React Router.
   - Include PWA manifest, service worker, and responsive bottom navigation.
   - Build complete public pages (Home, About, Courses, Destinations, Appointments, Contact, Privacy, Terms) and `/admin` dashboard.
   - Add comprehensive SEO metadata, sitemap.xml, and OpenGraph tags.
