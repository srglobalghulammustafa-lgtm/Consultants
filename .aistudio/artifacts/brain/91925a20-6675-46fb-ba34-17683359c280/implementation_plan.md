# IPstack Geolocation Integration, Quota Management & Lead Profile Details Modal

An intelligent lead enrichment and CRM expansion for **SR Global Consultants** that captures submitter city/country location using APILayer IPstack API (`ebe42933fab1deddffa7e20d5186e6e3`), enforces a strict 99-request monthly ceiling with automatic 1st-of-month reset, and provides an interactive Student Profile modal in the Admin CRM.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions have been confirmed with your answers:
> - **Quota & Safety Cutoff**: Monthly IPstack usage is tracked centrally in Supabase `site_settings`. When the count reaches **99 requests** in a calendar month, IP lookup automatically halts to guarantee the free tier (100 requests) is never exceeded or charged.
> - **Automated Monthly Reset**: The counter checks the current billing month/year; upon entering a new month (e.g. 1st of every month), the request counter automatically resets back to 0.
> - **Dashboard Key Management & Live Meter**: The API key (`ebe42933fab1deddffa7e20d5186e6e3`) and usage progress bar (e.g., `12 / 100 used`) are editable directly from **Site Settings > API & Geolocation** in the Admin Dashboard.
> - **Lead Details Pop-up Modal**: Clicking any student row in the Leads CRM table opens a comprehensive modal displaying personal info, academic notes, captured location (city, region, country, IP address, coordinates), status changer, and direct WhatsApp/Email action buttons.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Automatic Geolocation on Form Submission**:
     When a student submits the inquiry form (`Home.tsx`, `Contact.tsx`, or `BookAppointment.tsx`), the app requests requester IP details from `https://api.apilayer.net/ipstack/check?access_key=...` (or standard endpoint with header `apikey`).
     The captured `city`, `region_name`, `country_name`, and `ip` are seamlessly bundled into the lead payload and stored in Supabase.
  2. **100-Request Free Tier Protection**:
     Before calling IPstack, the application verifies the monthly count. If count >= 99, the API call is skipped and the form submits normally without blocking the user.
  3. **Interactive Student Details Modal**:
     In the Admin CRM (`/admin`), counselors can click on any lead to see all submitted details in an organized drawer/modal with clickable WhatsApp link, location tags, and counselor notes.

- **Target Audience / Persona**:
  - **SR Global Counselors**: Gain instant geographic context (e.g., student from Gujranwala vs Lahore vs London) to provide personalized counseling.
  - **Administrator**: Monitors API consumption via a visual quota gauge without risking unexpected charges.

---

### 2. User Experience & Visual Design

#### Admin CRM Modal & Quota Gauge Layout
```
┌────────────────────────────────────────────────────────────────────────┐
│  LEAD DETAILS MODAL                                              [ ✕ ] │
├────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │  Muhammad Hamza                 │  │  Status: [ New          ▼ ] │  │
│  │  hamza@gmail.com • +92 300 1234 │  │  Created: Today, 10:30 AM   │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
│                                                                        │
│  📍 GEOLOCATION & NETWORK AUDIT                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  • City & Region: Gujranwala, Punjab, Pakistan 🇵🇰                 │  │
│  │  • IP Address:    182.185.120.45                                  │  │
│  │  • Coordinates:   32.1877° N, 74.1945° E                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  🎓 ACADEMIC INTERESTS & INQUIRY                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  • Target Destination: Australia (Subclass 500)                  │  │
│  │  • Course Sector:     Trade & Vocational (Commercial Cookery)    │  │
│  │  • Student Message:   Completed FSC Pre-Eng with 72%.            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  📝 COUNSELOR NOTES & ACTIONS                                          │
│  [ Enter private consultation follow-up notes... ]                     │
│                                                                        │
│  [ 💬 Open WhatsApp Chat ]   [ ✉️ Send Email ]   [ 💾 Save Changes ]   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Quota Meter in Admin Settings:
```
IPstack API Quota: [████████░░░░░░░░░░░░] 34 / 99 Used (65 Remaining)
Status: Healthy • Monthly Auto-Reset Active (Next Reset: 1st of next month)
```

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Requester IP Endpoint & APILayer Header Structure
- **Chosen Approach**: Query `https://api.apilayer.net/ipstack/check` passing both `?access_key=` and header `{ apikey: API_KEY }` to ensure maximum compatibility across APILayer gateway revisions.
- **Why**: APILayer supports both query parameter and header authentication; supporting both guarantees zero authorization failure.

#### Decision 2: Fail-Safe Submission (Non-Blocking)
- **Chosen Approach**: If IPstack request fails (e.g. ad-blocker, network timeout, or quota exhausted at >= 99), the lead form still submits successfully with `location: 'Unknown / Direct'`.
- **Why**: Student lead generation must never be hindered by a third-party geolocation service.

#### Decision 3: Atomic Monthly Counter in `site_settings`
- **Chosen Approach**: Store `{ currentMonth: '2026-11', count: 12, maxLimit: 99 }` in Supabase `site_settings`. When a form is submitted, the counter increments. If the current date's month differs from `currentMonth`, it resets `count = 0`.
- **Why**: Shared across all client devices and visible in real time on the Admin Dashboard.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FORM SUBMISSION FLOW                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                        Check Quota (Count < 99)
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
          [ Count < 99 ]                       [ Count >= 99 ]
                  │                                   │
      Fetch api.apilayer.net/ipstack/check     Bypass IP Lookup
                  │                                   │
      Increment Monthly Counter                       │
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SAVE LEAD TO SUPABASE POSTGRES                    │
│  • full_name, email, phone, destination, course_interest, notes        │
│  • city, region_name, country_name, ip_address, latitude, longitude    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ADMIN LEADS CRM DASHBOARD                         │
│  • Lead Row Click ──► Opens Full Student Details Modal                 │
│  • Settings Tab   ──► View/Edit IPstack Key & Quota Meter              │
└────────────────────────────────────────────────────────────────────────┘
```
