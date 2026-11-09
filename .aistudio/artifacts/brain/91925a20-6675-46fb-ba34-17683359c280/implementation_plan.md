# Broadcast Notification Center, Premium Audio & Editable Footer Year Plan

Comprehensive architectural and implementation plan for **SR Global Consultants** introducing a real-time Admin Broadcast Notification Dispatcher, Web Audio API chime sound generator, interactive Navbar Notification Bell dropdown, Android system status bar notifications, and an editable Footer Copyright Year manager.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product choices were confirmed by the user:
> - **Web Notification Display**: Top Announcement Banner at the header level plus an interactive Notification Bell dropdown menu in `Navbar.tsx` with badge counter.
> - **Web Premium Audio Chime**: Synthetic two-tone glass chime generated via Web Audio API (`AudioContext`), playing when notifications arrive or are inspected without requiring external MP3 file downloads.
> - **Android App Notifications**: Real Android system status bar notification (via `NotificationManager` / `NotificationCompat.Builder`) with sound/vibration plus an animated top header banner when the app is active.
> - **Footer Copyright Year**: Editable `copyrightYear` field in Admin Settings -> Footer tab with dynamic string formatting (`© {copyrightYear} SR Global Consultants. All rights reserved. Gujranwala • Australia.`).

---

## 1. Overview & Core Concept

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ADMIN BROADCAST NOTIFICATION PIPELINE                       │
└─────────────────────────────────────────────────────────────────────────────┘

  [Admin Dashboard: Dispatch Center]
         │
         ├──► Pushes to Supabase (`broadcast_notifications` & `site_settings`)
         │
         ├──► WEB CLIENT
         │     ├── Top Announcement Banner
         │     ├── Navbar Bell Icon & Dropdown Menu
         │     └── Web Audio API Glass Chime Sound Effect
         │
         └──► ANDROID CLIENT
               ├── System Status Bar Notification (`NotificationCompat`)
               ├── In-App Animated Top Header Banner
               └── System Audio Ping & Vibration
```

1. **Admin Broadcast Dispatcher**:
   - Located in `AdminDashboard.tsx` under a dedicated "Notifications" tab.
   - Form fields: Title, Message, Priority (`Normal`, `Urgent`), Target Page Link (`/courses`, `/book-appointment`), Play Sound Toggle.
   - Saves broadcast records to Supabase table `broadcast_notifications` and updates `site_settings` key `active_broadcast`.

2. **Web Portal Notification System**:
   - **Header Announcement Banner**: Positioned at the top of `Navbar.tsx`, displaying urgent admissions or visa policy updates.
   - **Navbar Notification Bell**: Bell button with badge counter (`1`, `2`) displaying recent broadcasts in a glassmorphic dropdown list with timestamps and direct action links.
   - **Synthesized Glass Chime Sound**: A custom pure-tone Web Audio API sound generator (`playPremiumChime()`) that plays a pleasant 2-step harmonic chime (`523.25Hz` C5 → `659.25Hz` E5).

3. **Android App System Notifications**:
   - **Android Status Bar Notification**: Dispatches real system notifications using `NotificationManager` and `NotificationCompat.Builder` (Channel: `SR_GLOBAL_BROADCASTS`, Importance: `HIGH`).
   - **In-App Top Banner**: Smoothly animated top bar with sound feedback when the app is foregrounded.

4. **Footer Copyright & Year Manager**:
   - `copyrightYear` state added to `SiteSettings['footer']` (default: `'2026'`).
   - Dynamically renders `© {footer.copyrightYear || '2026'} SR Global Consultants. All rights reserved. Gujranwala • Australia.` across all footer instances.

---

## 2. Technical Architecture & Data Strategy

### 1. Web Files & Data Layer
- **`web/src/types.ts`**:
  - Add `BroadcastNotification` interface (`id`, `title`, `message`, `priority`, `link`, `created_at`, `is_active`).
  - Add `copyrightYear?: string` to `FooterConfig`.
  - Add `activeBroadcast?: BroadcastNotification` to `SiteSettings`.
- **`web/src/lib/audio.ts`** (New File):
  - `playPremiumChime()`: Web Audio API oscillator synthesizing a soft 2-tone harmonic chime.
- **`web/src/context/SettingsContext.tsx`**:
  - Add `sendBroadcastNotification(notification: BroadcastNotification): Promise<boolean>`.
  - Persist `activeBroadcast` in `site_settings`.
- **`web/src/components/Navbar.tsx`**:
  - Render top Announcement Banner.
  - Render Notification Bell with badge counter and interactive dropdown menu.
- **`web/src/components/Footer.tsx`**:
  - Render dynamic year `© {footer.copyrightYear || new Date().getFullYear().toString()}...`.

### 2. Android App Architecture
- **`app/src/main/java/com/example/util/NotificationHelper.kt`** (New File):
  - Creates Android `NotificationChannel` (`sr_global_broadcast_channel`).
  - Dispatches `NotificationCompat.Builder` system status bar notifications with sound, vibration, and small icon (`R.drawable.sr_global_icon`).
- **`app/src/main/java/com/example/ui/components/CommonComponents.kt`**:
  - Add `BroadcastTopBanner` composable rendered inside `MainActivity.kt`.

---

## 3. Execution Sequence & Sub-Tasks

1. **Types & Audio Engine Setup**:
   - Update `web/src/types.ts` with `BroadcastNotification` and `copyrightYear`.
   - Create `web/src/lib/audio.ts` with Web Audio API chime synthesizer.
2. **Settings Context Integration**:
   - Add `sendBroadcastNotification` and `updateFooterYear` in `SettingsContext.tsx`.
3. **Navbar & Bell Dropdown Component**:
   - Update `Navbar.tsx` with top announcement bar and Notification Bell menu.
4. **Footer Year Update**:
   - Update `Footer.tsx` to use dynamic `copyrightYear`.
5. **Admin Dashboard Broadcast Manager**:
   - Add Broadcast Notification Dispatcher tab and Footer Year Editor input in `AdminDashboard.tsx`.
6. **Android Notification Helper & Top Banner**:
   - Create `NotificationHelper.kt` and integrate status bar dispatch in `MainActivity.kt`.
7. **Compilation & Verification**:
   - Run `npm run build` in `/web`.
   - Run `compile_applet` for Android.

---

## 4. Verification Plan

1. **Admin Broadcast Dispatch Verification**:
   - Go to Admin Dashboard -> Notifications tab, type "Special July Intake Discount!", choose `High` priority, and click "Send Broadcast Notification".
2. **Web Portal Verification**:
   - Observe top announcement banner appear on website.
   - Click Notification Bell in Navbar, verify dropdown shows message and badge count.
   - Verify premium chime sound plays via Web Audio API.
3. **Footer Year Verification**:
   - Update `copyrightYear` in Admin Settings -> Footer tab from `2026` to `2027`; verify public footer displays `© 2027 SR Global Consultants...`.
4. **Android App Verification**:
   - Launch app, verify top notification banner appears, and check status bar notification dispatch logic.
