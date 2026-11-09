# Implementation Plan - Instant Appointment Sync, Header Track Status Link & Footer Copyright Control

Aligning appointment booking persistence, customizable header navigation for Track Appointment Status, and live dynamic footer copyright year updates across Web and Android platforms.

---

## 1. Instant Real-Time Appointment Booking Sync

### User Problem & Objective
- Newly submitted appointments (whether fee paid or pending fee verification) must immediately appear in the **Admin Dashboard** under the Appointments tab without manual database delays or filtering issues.

### Architecture & Solution
- **Web Data Layer (`LiveDataContext.tsx`)**:
  - Verify `addAppointment` persists to Supabase `appointments` table while synchronously appending to local `appointments` state.
  - Set default status to `Pending` (Pending Fee Verification) so admin can inspect, record fee payment, add counselor notes, and toggle status to `Confirmed`.
- **Booking Form (`BookAppointment.tsx`)**:
  - Connect booking submission to `addAppointment()`, auto-generating `appointment_code` (`SRG-APT-XXXX`) and triggering immediate confirmation modal with WhatsApp fee verification link.
- **Android Data Layer (`ConsultancyRepository.kt` & `AppointmentScreen.kt`)**:
  - Ensure Kotlin repository inserts new appointment entries directly into Supabase `appointments` table with `SRG-APT-XXXX` ID and updates `MainViewModel` state.
- **Admin Dashboard (`AdminDashboard.tsx`)**:
  - Render all appointments in table view with filter toggles (`All`, `Pending Fee Verification`, `Confirmed`, `Completed`, `Cancelled`) and CRM popup modal.

---

## 2. Admin Header Control for "Track Status" Link

### User Problem & Objective
- The Track Appointment Status page link (`/track-appointment`) should be fully editable and manageable from the Admin Dashboard Header Settings tab (custom title, path, and visibility toggle).

### Architecture & Solution
- **Header Settings Schema (`SettingsContext.tsx`)**:
  - Include `{ id: '6', name: 'Track Status', path: '/track-appointment', isVisible: true }` in `header.navLinks`.
- **Admin Dashboard Header Editor (`AdminDashboard.tsx`)**:
  - Expose "Track Status" in the Header & Navbar tab for editing label, path, and visibility toggle.
- **Public Navigation (`Navbar.tsx` & Android App)**:
  - Dynamically render all visible `navLinks` in desktop top navbar and mobile drawer.

---

## 3. Dynamic Footer Copyright Year Management

### User Problem & Objective
- Admin must be able to manually edit and update the Footer Copyright Year (e.g. `2026`), with instant live updates on both the public website and Android app.

### Architecture & Solution
- **Footer Component (`Footer.tsx`)**:
  - Render `© {footer.copyrightYear || new Date().getFullYear()} {footer.copyright}`.
- **Admin Footer Control (`AdminDashboard.tsx`)**:
  - Connect `copyrightYear` input field to `footerForm` and save to Supabase `site_settings` under key `footer_config`.

---

## Verification Plan

### Automated & Build Validation
- **Web Build**: Execute `npm run build` in `/web` to verify 0 TypeScript/JSX compilation errors.
- **Android Build**: Execute `compile_applet` to confirm Kotlin and Compose UI compilation success.

### Interactive CUJ Test
1. Book an appointment on public web site / app.
2. Verify reference ID `SRG-APT-XXXX` is generated.
3. Open `/admin` (PIN `1234`) -> Appointments tab, verify the new appointment displays immediately with status `Pending Fee Verification`.
4. Edit Header settings to rename "Track Status" to custom text; verify navbar updates live.
5. Edit Footer copyright year to `2026`; verify footer updates instantly across Web and App.
