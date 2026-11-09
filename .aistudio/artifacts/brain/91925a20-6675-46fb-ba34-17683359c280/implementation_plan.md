# Unique Appointment ID Tracking, CRM Modals, Content Catalog Editors & Admin PIN Renewal Plan

Comprehensive architectural and implementation blueprint for **SR Global Consultants** introducing unique appointment reference code generation (`SRG-APT-XXXX`), fee payment verification via WhatsApp, a public student appointment status tracking portal, full-featured CRM appointment inspection, in-place edit modals for Destinations, Courses & Testimonials, dynamic multi-column footer control, and in-dashboard admin PIN renewal with auto-logout.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product specifications were confirmed with the user:
> - **Appointment Reference ID Format**: Unique `SRG-APT-4DIGIT` code (e.g., `SRG-APT-8492`) generated automatically upon booking submission.
> - **Immediate Post-Booking Modal**: Right after booking on Web or Mobile App, present a confirmation modal showing the Appointment ID, a 1-click Copy button, and a direct **"Pay Fee & Confirm on WhatsApp"** CTA pre-populated with the student's ID.
> - **Dedicated Track Status Feature**: A dedicated "Track Appointment" lookup page/tab where students enter their Appointment Reference ID (`SRG-APT-8492`) or phone number to view real-time status (`Pending Fee Verification`, `Confirmed`, `Completed`, `Cancelled`).
> - **Admin Manual Confirmation**: Admin reviews fee payment receipt sent via WhatsApp, opens the Appointment CRM Modal in the Admin Dashboard, and changes status to `Confirmed`. The student's public tracking page updates in real-time.
> - **Content Editing Modals**: Edit modals for existing **Destinations**, **Courses & Trades**, and **Testimonials** allowing immediate updates to live Supabase database records.
> - **Multi-Column Footer Manager**: Full control over footer column titles (e.g. "Study Destinations", "Useful Links") and link arrays.
> - **Admin Password/PIN Renewal**: In-dashboard PIN renewal form pushing changes to Supabase `site_settings`, immediately logging out the active admin session, and prompting re-login with the new PIN.

---

## 1. Overview & Core Concept

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPOINTMENT LIFECYCLE & FEE VERIFICATION                 │
└─────────────────────────────────────────────────────────────────────────────┘

 [Student Books Slot] ──► [Generates SRG-APT-8492] ──► [Booking Confirmation Modal]
                                                               │
                                                               ▼
                                                     [Pay Fee via WhatsApp]
                                                               │
 [Track Status Search] ◄── [Live Supabase Sync] ◄── [Admin Confirms in CRM]
  (Shows "Confirmed")       (Status: Confirmed)      (After Fee Receipt Review)
```

1. **Booking & ID Generation**:
   - Student submits booking form on Web or Mobile App.
   - System auto-generates a unique `appointment_id` (e.g., `SRG-APT-8492`).
   - Modal pops up displaying the Reference ID and a direct button: **"Pay Fee & Confirm on WhatsApp"**.
   - Pre-filled WhatsApp message: *"Hello SR Global Consultants! My Appointment Reference ID is SRG-APT-8492. I have submitted my booking and transferred the fee for verification."*

2. **Public Track Status Portal (`/track-appointment`)**:
   - New dedicated route and mobile tab where students input their `SRG-APT-XXXX` ID or registered phone number.
   - Displays real-time status badge:
     - `Pending Fee Verification` (Amber) — Waiting for WhatsApp fee receipt.
     - `Confirmed` (Emerald Green) — Verified by admin, slot locked.
     - `Completed` (Blue) — Counseling session finished.
     - `Rescheduled` / `Cancelled` (Slate/Red).
   - Shows meeting details (Date, Time, Counseling Mode, Counselor Notes).

3. **Admin CRM Appointment Management**:
   - Displays `SRG-APT-8492` prominently in the Appointments table.
   - Clicking an appointment opens the **Appointment Details CRM Modal**:
     - Student profile, contact, counseling mode (Office/Online), destination interest.
     - Counselor private notes field with real-time save.
     - Status selector (`Pending` -> `Confirmed` -> `Completed`).
     - One-click WhatsApp, Call, and Email buttons.

4. **In-Place Catalog Editors**:
   - Edit buttons on Destinations, Courses, and Testimonials cards/tables.
   - Pre-filled edit modals allowing instant updates to live Supabase database records.

5. **Footer Column & Link Manager**:
   - Custom headings editor for Footer Column 1 ("Study Destinations") and Column 2 ("Useful Links").
   - Link addition, editing, and deletion synced to `site_settings`.

6. **Admin PIN Renewal Engine**:
   - Secure form validating current PIN, updating Supabase `admin_security`, purging session, and redirecting to login.

---

## 2. Technical Architecture & Data Strategy

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA SCHEMAS & COMPONENT MAPPING                     │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────┐             ┌─────────────────────────┐
  │   Appointment Model     │             │    SiteSettings Model   │
  ├─────────────────────────┤             ├─────────────────────────┤
  │ id: UUID                │             │ footer: {               │
  │ appointment_code: TEXT  │             │   destinationsTitle     │
  │ client_name: TEXT       │             │   destinationLinks[]    │
  │ phone / email: TEXT     │             │   quickLinksTitle       │
  │ status: TEXT            │             │   quickLinks[]          │
  │ notes: TEXT             │             │ }                       │
  │ mode: Office | Online   │             │ adminPin: TEXT          │
  └────────────┬────────────┘             └────────────┬────────────┘
               │                                       │
               ▼                                       ▼
  ┌─────────────────────────┐             ┌─────────────────────────┐
  │  TrackAppointment.tsx   │             │   AdminDashboard.tsx    │
  │  • Search SRG-APT-XXXX  │             │   • Appointment Modal   │
  │  • Real-time Status     │             │   • Content Edit Modals │
  │  • Direct WhatsApp CTA  │             │   • PIN Renewal Form    │
  └─────────────────────────┘             └─────────────────────────┘
```

### Files to Create / Modify
1. **`web/src/types.ts`**:
   - Update `Appointment` interface with `appointment_code?: string` and `notes?: string`.
   - Update `FooterConfig` with `destinationsTitle?: string` and `quickLinksTitle?: string`.
   - Update `SiteSettings` with `adminPin?: string`.
2. **`web/src/lib/utils.ts`**:
   - Helper function `generateAppointmentCode()` producing `SRG-APT-${4_digit_random}`.
3. **`web/src/context/LiveDataContext.tsx`**:
   - Update `addAppointment` to automatically include `appointment_code`.
   - Update `updateAppointmentStatus` to handle `notes` and `status` updates.
   - Add lookup helper `getAppointmentByCodeOrPhone(query: string)`.
4. **`web/src/pages/BookAppointment.tsx`**:
   - Integrate unique ID generation on submission.
   - Show interactive post-booking confirmation modal with ID, Copy button, and **"Pay Fee & Confirm on WhatsApp"** CTA.
5. **`web/src/pages/TrackAppointment.tsx`** (New Page):
   - Dedicated public status tracking portal for students.
6. **`web/src/components/Navbar.tsx` & `web/src/components/Footer.tsx`**:
   - Add link to "Track Appointment" (`/track-appointment`).
   - Use dynamic column titles in `Footer.tsx`.
7. **`web/src/pages/AdminDashboard.tsx`**:
   - Add Appointment Details CRM Modal with notes, status, and direct communication triggers.
   - Add Edit Destination Modal, Edit Course Modal, and Edit Testimonial Modal.
   - Add Footer Column Titles and Link Manager in Footer Settings.
   - Add Admin Security & PIN Renewal form with automatic logout.
8. **`web/src/pages/AdminLogin.tsx`**:
   - Validate input PIN against `settings.adminPin` / `sr_global_admin_pin` with dynamic error / renewal notices.
9. **`app/src/main/java/com/example/ui/screens/` (Android)**:
   - Update Appointment Screen to display unique Reference ID on booking and direct WhatsApp payment button.
   - Add Appointment Status Search in Student Workspace tab.

---

## 3. Implementation Steps & Execution Sequence

1. **Schema & Types Setup**:
   - Update `types.ts` and `LiveDataContext.tsx` with `appointment_code` and status lookup methods.
2. **Booking Flow & Confirmation Modal**:
   - Update `BookAppointment.tsx` to generate `SRG-APT-XXXX`, save to Supabase, and open confirmation modal with WhatsApp fee link.
3. **Public Track Appointment Portal**:
   - Create `TrackAppointment.tsx` page with search bar, real-time status card, and progress timeline. Add `/track-appointment` route in `App.tsx` and Navbar.
4. **Admin Dashboard Upgrade**:
   - Implement Appointment Details CRM Popup Modal in `AdminDashboard.tsx`.
   - Implement Edit Modals for Destinations, Courses, and Testimonials.
   - Implement Footer Column Titles and Link Editor.
   - Implement Admin Security PIN Renewal tab with auto-logout.
5. **Android App Mirroring**:
   - Update Android Appointment tab with Reference ID generation and WhatsApp fee button.
6. **Build & Compilation Verification**:
   - Run `npm run build` in `web` to verify 0 TypeScript errors.
   - Run `compile_applet` for Android.

---

## 4. Verification Plan

1. **Booking & WhatsApp Fee Verification**:
   - Submit a test appointment on `/book-appointment`.
   - Confirm modal displays `SRG-APT-XXXX`.
   - Click "Pay Fee & Confirm on WhatsApp", verify pre-populated message contains the correct Reference ID.
2. **Public Status Tracking Verification**:
   - Navigate to `/track-appointment`.
   - Enter `SRG-APT-XXXX` or test phone number.
   - Verify status displays `Pending Fee Verification`.
3. **Admin CRM Confirmation Verification**:
   - Open Admin Dashboard (`/admin/dashboard`), go to Appointments tab.
   - Click the test appointment, enter counselor notes, and change status to `Confirmed`.
   - Return to `/track-appointment`, re-query the ID, and verify status now shows `Confirmed` in green.
4. **Content Edit Modals Verification**:
   - Edit a Destination, Course, and Testimonial in Admin Dashboard; verify changes persist across public pages.
5. **PIN Renewal Verification**:
   - Change PIN in Admin Security tab, verify auto-logout, and test login with the new PIN.
