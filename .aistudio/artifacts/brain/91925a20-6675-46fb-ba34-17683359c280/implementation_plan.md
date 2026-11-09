# SR Global Consultants - Complete Admin Control Dashboard & Live Supabase Data Architecture

A comprehensive management system and live data architecture for **SR Global Consultants** giving administrators complete real-time control over website content, header navigation, footer links, floating WhatsApp parameters, study destinations, course catalogs, and client inquiries via Supabase PostgreSQL with verified offline fallbacks.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned with your preferences from Phase 1:
> - **Dashboard Interface Layout**: Modern responsive sidebar with dedicated tabs for Overview/KPIs, Leads Pipeline, Appointments Calendar, Content Management (Destinations, Courses, Testimonials), and Global Site Settings.
> - **Centralized Configuration Storage**: All site-wide customizations (Floating WhatsApp phone number, pre-filled greeting message, top-bar contact details, header navigation items, and footer columns) will be stored in the Supabase `site_settings` table as structured JSON documents.
> - **Live-First with Verified Fallback**: Public web views and mobile interfaces query Supabase in real time; if tables are empty or network is disrupted, the system seamlessly displays verified default content with zero layout jumps or crashes.
> - **Supabase Database Setup Workflow**: Clear single-click SQL execution script (`supabase/schema.sql`) provided for the Supabase SQL Editor to establish all tables, RLS security policies, and initial seed records.

---

### 1. Overview & Core Concept

- **What It Does**:
  Empowers SR Global Consultants staff and administrators to manage their entire digital presence from a single, password-protected CRM dashboard without touching code:
  1. **Floating WhatsApp Widget**: Instantly change the destination WhatsApp number (e.g., switch between Pakistan branch and Australian counselor) and customize the pre-filled inquiry text.
  2. **Header & Navigation Control**: Add, edit, reorder, or toggle visibility of top navigation links, announce new service badges, and update emergency helpline numbers.
  3. **Footer Customization**: Edit head office address, telephone numbers, working hours, and customized resource links in the footer columns.
  4. **Dynamic Academic Catalogs**: Add new destination countries, upload new trade/vocational courses, and publish verified student visa testimonials.
  5. **Lead & Appointment CRM**: Track student inquiries in real time, transition lead statuses (New, Contacted, In Progress, Converted), and confirm or reschedule counseling appointments.

- **Target Audience / Persona**:
  - **Consultancy Administrator & Managing Director**: Needs full administrative governance over marketing copy, phone numbers, and lead assignment.
  - **Education Counselors & Visa Officers**: Need rapid access to student inquiries, appointment schedules, and course fee details during consultations.
  - **Prospective Pakistani & International Students**: Receive immediate, accurate contact details and up-to-date admission requirements.

- **Key Value**:
  Eliminates dependency on developers for daily business adjustments (such as updating staff contact numbers, launching new intake courses, or publishing fresh visa approval success stories).

---

### 2. User Experience & Visual Design

#### Modern Sidebar Architecture
```
┌───────────────────────────────┬────────────────────────────────────────────────────────┐
│  SR GLOBAL CONSULTANTS        │  Staff Portal • Live Supabase Connected (●)            │
│  [Logo] Administration        │                                                        │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│  NAV ITEMS                    │  ACTIVE VIEW PANEL                                     │
│  📊 Dashboard Overview        │  ┌──────────────────────────────────────────────────┐  │
│  👥 Leads Inquiries (CRM)     │  │  Metric Cards: Total Leads | Bookings | Courses  │  │
│  📅 Booked Appointments       │  └──────────────────────────────────────────────────┘  │
│  🌍 Study Destinations        │                                                        │
│  🎓 Courses & Programs        │  ┌──────────────────────────────────────────────────┐  │
│  💬 Student Testimonials      │  │  Interactive Data Table / Edit Form             │  │
│  ⚙️ Site Settings             │  │  [Search...]  [Filter...]  [+ Add New Item]      │  │
│     ├─ WhatsApp Widget        │  └──────────────────────────────────────────────────┘  │
│     ├─ Header & Navbar        │                                                        │
│     └─ Footer & Contacts      │  ┌──────────────────────────────────────────────────┐  │
│                               │  │  Live Preview Strip (Instant changes feedback)   │  │
│  🚪 Logout (Lock Portal)      │  └──────────────────────────────────────────────────┘  │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

#### Key User Flows:
1. **WhatsApp Control Flow**:
   Admin navigates to **Site Settings > WhatsApp** -> Inputs new phone number (e.g., `+92 327 8321560`) and pre-filled message -> Clicks **"Save & Publish"** -> Floating button on public website immediately routes clicks to the new WhatsApp number.
2. **Course & Destination Management Flow**:
   Admin clicks **Courses & Programs > Add New Course** -> Fills course title, country, fee range, and career outcomes -> Saves to Supabase -> Instantly appears in the public course catalog with search and filters active.
3. **Leads & Consultation Pipeline**:
   When a student submits the inquiry form on the homepage, a new record appears with a "New" badge in the admin CRM -> Counselor clicks "Contacted" or "Converted" -> Status updates live with timestamp.

#### Visual Identity & Theme:
- **Palette**: Sovereign Navy (`#0A192F`), Aegean Cyan (`#009FE3`), Crisp Slate (`#F8FAFC`), and Success Emerald (`#10B981`).
- **Typography**: Clean high-density sans-serif (`Inter` / system-ui) for data tables and form controls; elegant serif (`Cinzel` / `Playfair`) for official branding accents.
- **Feedback & Motion**: Instant toast notifications on save, loading spinners during Supabase sync, inline validation warnings, and confirmation modals before deletions.

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: JSON Schema in `site_settings` vs Multiple Flat Tables
- **Chosen Approach**: Store global settings in `site_settings` with dedicated setting keys:
  - `whatsapp_config`: `{ phone, default_message, is_active }`
  - `header_config`: `{ top_announcement, phone_pk, phone_au, nav_links }`
  - `footer_config`: `{ address, email, hours, columns, copyright }`
  - `company_profile`: `{ name, tagline, social_links, metrics }`
- **Why**: Allows instant atomic updates and avoids having to run multiple database migrations whenever new UI toggles are added in the future.
- **Alternatives Considered**: Creating 5 separate SQL tables for each component, which would add unnecessary migration overhead and complexity.

#### Decision 2: Fallback Hydration Layer
- **Chosen Approach**: Create a unified Data Provider hook (`useSiteSettings`, `useCourses`, `useDestinations`) that attempts to fetch from Supabase, but if the table is empty or returns an error, transparently hydrates from verified default mock constants.
- **Why**: Zero downtime and zero white-screen risk if Supabase tables haven't been migrated yet or during transient network disconnects.

#### Decision 3: Supabase Migration Execution
- **Chosen Approach**: Provide the exact `supabase/schema.sql` code in the workspace and display a 1-click copy section directly inside the Admin Dashboard under **"Database Health & Setup"**.
- **Why**: Supabase client tokens cannot execute DDL commands (`CREATE TABLE`) for security reasons; providing the copyable SQL script inside the dashboard gives the admin a foolproof 30-second setup.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT PWA FRONTEND                            │
├────────────────────────────────────────────────────────────────────────┤
│   Public App Context (useSiteSettings / useLiveCatalog)                │
│   ├── FloatingWhatsApp  ──► Reads settings.whatsapp_config             │
│   ├── Navbar & TopBar   ──► Reads settings.header_config               │
│   ├── Footer Component  ──► Reads settings.footer_config               │
│   ├── Destinations Page ──► Reads destinations table (or fallback)     │
│   └── Courses Page      ──► Reads courses table (or fallback)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  Realtime Subscriptions / REST Query
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE POSTGRESQL                             │
├────────────────────────────────────────────────────────────────────────┤
│   Tables:                                                              │
│   • site_settings    (JSON configs for WhatsApp, Header, Footer)       │
│   • leads            (CRM Inquiries from Quick Form & Modals)          │
│   • appointments     (Consultations with double-booking prevention)   │
│   • destinations     (Study country guides & requirements)             │
│   • courses          (Academic & trade course catalog)                 │
│   • testimonials     (Approved student visa success stories)           │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
                        Admin Writes / Mutations
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                    ADMIN CRM DASHBOARD (/admin)                        │
├────────────────────────────────────────────────────────────────────────┤
│   • Leads Tab: Filter, search, status change, export CSV               │
│   • Appointments Tab: Calendar view, slot confirmation, status         │
│   • Content Tab: Add/Edit/Delete Courses, Destinations, Testimonials   │
│   • Settings Tab: Edit WhatsApp, Navbar, Footer, Address, Phones       │
│   • DB Setup Tab: 1-click copy of schema.sql with status indicators    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Entities & State Strategy:
- **`site_settings`**:
  - `setting_key` (TEXT PRIMARY KEY)
  - `setting_value` (JSONB)
  - `updated_at` (TIMESTAMPTZ)
- **`leads`**:
  - `id`, `full_name`, `email`, `phone`, `destination`, `course_interest`, `status`, `notes`, `created_at`
- **`appointments`**:
  - `id`, `client_name`, `email`, `phone`, `destination`, `appointment_date`, `time_slot`, `mode`, `status`
- **`courses`**:
  - `id`, `title`, `category_slug`, `country`, `duration`, `estimated_fees`, `intake_months`, `description`, `career_paths`
- **`destinations`**:
  - `id`, `country_name`, `slug`, `avg_living_cost`, `work_rights`, `visa_subclass`, `overview`, `visa_process`, `admission_requirements`
