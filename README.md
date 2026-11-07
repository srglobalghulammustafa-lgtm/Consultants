# SR Global Consultants — Global Education & Migration Platform

Official cross-platform application and web portal for **SR Global Consultants** (1st Floor, 239A Civic Center, Gujranwala, Pakistan).

---

## 🏛️ Project Architecture
- **Native Android Application (`/app`)**: Built with Kotlin 2.0+, Jetpack Compose, Material Design 3, Coroutines/Flow, and System Status Bar Notifications.
- **Production Web PWA (`/web`)**: Built with React 18, TypeScript, Tailwind CSS, Lucide icons, and Service Worker PWA support.
- **Cloud Backend & Database (`/supabase`)**: Supabase PostgreSQL with 18 relational tables, Row Level Security (RLS) policies, and Realtime sync.

---

## 🚀 One-Click Vercel Deployment
To deploy the web portal on Vercel:
1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and select this repository.
3. Root Directory: `web` (or leave default root with included `vercel.json`).
4. Set Environment Variables:
   - `VITE_SUPABASE_URL=https://lqggahnqfbihbnydpfre.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1`
5. Click **Deploy**.

---

## 📱 Android App Features
- **Hidden Staff Mode**: Unobtrusive access via 5 consecutive taps on the top logo emblem (Staff PIN: `1234`).
- **Broadcast Status Bar Notifications**: Admin can dispatch high-priority notifications to the device status bar.
- **Home Carousel Slider**: Auto-scrolling interactive highlights for Australia, UK, and Trade courses.
- **Appointment Booking**: Real-time slot management with double-booking prevention.
- **Student Case Tracker**: Document checklist and visa milestone progress meter.

---

## 🔒 Security & Backend Sync
- **Supabase REST URL**: `https://lqggahnqfbihbnydpfre.supabase.co/rest/v1/`
- Direct real-time sync with resilient offline fallback.
