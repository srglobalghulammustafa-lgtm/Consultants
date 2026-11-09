# SR Global Consultants — Global Education & Migration Platform

Official cross-platform enterprise portal and native mobile application for **SR Global Consultants** — Premier Study Abroad, IELTS/PTE Preparation, and Certified Visa Migration Consultancy.

- **Physical Head Office**: 1st Floor, 239A Civic Center, Commercial Area, Phase 2, DC Colony, Gujranwala, Punjab 52250, Pakistan
- **Australia Liaison**: Melbourne, Victoria, Australia
- **Official Helpline (Pakistan)**: `+92 327 8321560` / `+92 300 1234567`
- **Official Contact (Australia)**: `+61 412 345 678`
- **Inquiry Email**: `srglobal.ghulammustafa@gmail.com`
- **Live Production Web**: [https://consultants-phi.vercel.app](https://consultants-phi.vercel.app)
- **Admin CRM Portal**: [https://consultants-phi.vercel.app/admin](https://consultants-phi.vercel.app/admin) (Default Staff PIN: `1234`)

---

## 🏛️ Monorepo Architecture

This repository contains the complete unified codebase for both the Web PWA and Native Android applications:

```text
├── app/                        # Native Android Application (Kotlin + Jetpack Compose)
│   ├── src/main/java/com/example/
│   │   ├── MainActivity.kt     # App entrypoint, Navigation tabs, Admin PIN modal
│   │   ├── ui/components/      # SRGlobalTopBar, SRGlobalBottomNav, FloatingWhatsAppButton
│   │   ├── ui/screens/         # HomeScreen, DestinationsScreen, CoursesScreen, AdminDashboardScreen
│   │   ├── ui/theme/           # Aegean Cyan (#009FE3), Sovereign Navy, Amber Gold M3 Palette
│   │   └── data/               # Local repositories, notification dispatcher, consultation models
│   └── build.gradle.kts        # Android Gradle configuration (minSdk 24, targetSdk 34)
├── web/                        # Production Web Application (React 18 + Vite + TypeScript)
│   ├── src/pages/              # Home, About, Courses, Destinations, Contact, BookAppointment, AdminDashboard
│   ├── src/components/         # Navbar, Footer, FloatingWhatsApp, StudentProfileModal
│   ├── src/lib/                # supabase.ts (Database client), ipstack.ts (Geolocation & Quota guard)
│   ├── src/context/            # SettingsContext.tsx (Live sync), LiveDataContext.tsx
│   └── vite.config.ts          # Vite build pipeline with Tailwind CSS & PWA assets
├── supabase/
│   └── schema.sql              # Complete PostgreSQL schema (8 tables, RLS policies, seed records)
└── README.md                   # Comprehensive platform documentation
```

---

## 🌐 Live Web Portal & Admin CRM

### 1. Public Student Experience
- **Responsive Web & PWA**: Mobile-first, fully responsive design with zero horizontal scroll overflow.
- **Dynamic Program Explorer**: Full catalog of Bachelor’s, Master’s, Diplomas, and In-Demand Australian Trade Courses (Commercial Cookery, Automotive, Nursing, Carpentry, IT).
- **Study Destination Guides**: Detailed visa requirements, minimum IELTS/PTE scores, living expenses, and post-study work rights for Australia, United Kingdom, USA, Canada, and Europe.
- **Instant Consultation Booking**: Real-time calendar slot reservation with double-booking prevention.
- **Pulsing WhatsApp Action**: Floating floating contact widget connecting students directly to official counselors.

### 2. Admin CRM & Executive Control Center (`/admin`)
- **Protected Access**: Accessible via `/admin` URL or secret 5-tap gesture on the Android top logo with secure 4-digit PIN verification (Default PIN: `1234`).
- **Student Leads CRM Pipeline**:
  - Live table of inquiries with search filter, status badges (`New`, `Contacted`, `In Review`, `Document Collection`, `Visa Lodged`, `Approved`, `Archived`), and counselor notes.
  - One-click CSV export of all leads for offline analytics.
  - **Student Details Modal**: Deep inspection of student profile, academic percentage, test scores, target destination, and IPstack geolocation audit.
  - Direct Counselor Actions: Instant WhatsApp chat with pre-populated message, Direct Dial, and Pre-formatted Email.
- **Site Layout & Content Customizer**:
  - Update WhatsApp floating contact number in real time without code redeployment.
  - Update Head Office phone numbers, email, and physical Gujranwala address.
  - Manage header navigation links, order, and visibility toggles.
  - Edit footer links, columns, social media URLs, and copyright strings.
- **Database Content Managers**: Add, edit, and toggle Destinations, Courses, Testimonials, and FAQs.

---

## 🌍 APILayer IPstack Geolocation Integration

The platform integrates the **APILayer IPstack API** to automatically capture the student's geographic origin (City, Region, Country, IP address, Latitude/Longitude) during consultation requests.

### API Specifications
- **Provider**: APILayer IPstack API ([https://app.apilayer.com/](https://app.apilayer.com/))
- **Endpoint**: `https://api.apilayer.net/ipstack/check?access_key=YOUR_ACCESS_KEY`
- **Default API Key**: `ebe42933fab1deddffa7e20d5186e6e3`
- **Plan Tier**: Free Tier (100 requests/month)

### 🛡️ Smart 99-Request Safeguard & Monthly Auto-Reset
To prevent accidental overage and ensure uninterrupted operation within the free plan:
1. **Strict 99-Request Ceiling**: The client library (`web/src/lib/ipstack.ts`) actively audits monthly usage. Once the counter reaches **99 requests**, all subsequent API calls are immediately throttled. A graceful fallback is returned without making external network calls.
2. **Automatic 1st-of-Month Reset**: Every request checks the current calendar month key (e.g., `2026-11`). If a new month has started, the request counter automatically resets to `0`.
3. **Admin Monitoring Panel**: The Admin Dashboard features a dedicated **IPstack Location** tab showing:
   - Live visual quota bar (`X / 99 Requests Used`).
   - Operational status badge (`ACTIVE`, `APPROACHING LIMIT`, or `QUOTA PAUSED`).
   - Next scheduled automatic reset date.
   - Editable API Key input field.
   - Manual **"Reset Counter to 0"** override button.
   - Real-time **"Test IPstack Lookup"** diagnostic runner.

---

## 🗄️ Supabase Cloud Database & SQL Migration

The application uses **Supabase** for persistent cloud storage and live synchronization across Web and Android clients.

### Cloud Credentials
- **Supabase Project URL**: `https://lqggahnqfbihbnydpfre.supabase.co`
- **Supabase Anon Key**: `sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1`

### Running the Database Schema
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project (`lqggahnqfbihbnydpfre`).
3. Navigate to the **SQL Editor** from the left navigation.
4. Open the file `supabase/schema.sql` from this repository.
5. Paste the entire SQL script into the editor and click **Run**.
6. The script creates the following relational tables with full indexes and initial seed records:
   - `site_settings`: Global configuration, header, footer, WhatsApp number, IPstack quota tracking.
   - `leads`: Student inquiries, academic background, test scores, IPstack geolocation audit data.
   - `consultation_appointments`: Booked office/online appointments with status and date slots.
   - `destinations`: Country guides, visa details, living costs, post-study work regulations.
   - `courses`: Higher education degrees and Australian vocational trade programs.
   - `testimonials`: Verified student visa approval reviews with photos and universities.
   - `faqs`: Common inquiries regarding visa requirements, funding, and admissions.
   - `audit_logs`: Timestamped administrative actions and status updates.

> **Resilient Fallback Guarantee**: If any database table is temporarily empty or offline, both the Web and Android apps seamlessly fall back to verified offline defaults. The UI never displays blank errors or breaks.

---

## 📱 Native Android Application (`/app`)

Built with modern Android engineering standards using **Kotlin** and **Jetpack Compose**:

- **Aegean Cyan & Navy Design System**: Authentic Material 3 color system matching SR Global physical branding (`#009FE3`, `#0A192F`, `#F59E0B`).
- **Elevated Top Bar (`SRGlobalTopBar`)**:
  - Gradient status bar with Aegean Cyan accent strip.
  - Official emblem with double-ring Gold and Cyan border.
  - One-touch phone dialer button connecting directly to Gujranwala office (`+923278321560`).
  - Staff Admin Portal lock toggle button (PIN: `1234`).
  - Hidden 5-tap gesture on the logo for discreet staff access.
- **Bottom Navigation**: Seamless tab navigation across Home, Destinations, Courses, Appointment, Student Portal, and Contact.
- **Floating WhatsApp Widget**: Smooth pulsing FAB launching WhatsApp with pre-filled consultation message.
- **Android System Notifications**: Dispatch real-time high-priority status bar notifications to student devices.
- **Accessibility & Touch Targets**: All interactive elements strictly adhere to the 48dp minimum touch target size.

---

## 🛠️ Local Development & Build Commands

### 1. Web Application (`/web`)
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start local development server with Hot Module Reloading
npm run dev

# Run TypeScript check and production build
npm run build

# Preview production build locally
npm run preview
```

### 2. Native Android Application (`/app`)
```bash
# Build debug APK using Gradle
gradle assembleDebug

# Compile and verify applet
compile_applet
```

---

## 🚀 One-Click Vercel Deployment

The web portal is pre-configured for automated continuous deployment on Vercel:

1. Push this repository to GitHub (`main` branch).
2. Go to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `web` (or root with the included `vercel.json`).
5. Configure Environment Variables:
   - `VITE_SUPABASE_URL` = `https://lqggahnqfbihbnydpfre.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1`
6. Click **Deploy**. Subsequent commits to `main` will trigger automatic builds.

---

## 📄 License & Attribution
© 2026 **SR Global Consultants**. All rights reserved.  
Headquartered in Gujranwala, Pakistan with authorized liaison services for Australia, UK, USA, Canada, and Europe.
