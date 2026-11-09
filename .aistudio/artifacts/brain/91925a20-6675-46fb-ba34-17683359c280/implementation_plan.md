# Implementation Plan - Accredited ICEF Badge in Footer with Admin Link Control

Integrating the user-uploaded ICEF Accredited badge (`Generated_Image_November_08__2026_-_11_05PM-Photoroom_e46989c4.png`) into the website footer, making it fully clickable with a customizable link editable in the Admin Dashboard.

---

## 1. Asset Placement & Footer Integration
- **Asset Placement**: Copy or reference the uploaded badge image to `/web/public/assets/icef_badge.png`.
- **Footer Layout (`Footer.tsx`)**:
  - Position the badge card nicely beside the contact information in the 4-column footer layout.
  - Wrap the badge in an anchor tag (`<a>`) pointing to `footer.accreditedBadgeUrl` (defaulting to official ICEF agency directory URL).

## 2. Admin Dashboard Configuration (`AdminDashboard.tsx` & `SettingsContext.tsx`)
- **Footer Settings Schema**:
  - Add `accreditedBadgeUrl` and `accreditedBadgeImage` properties to `FooterConfig` in `types.ts` and `SettingsContext.tsx`.
- **Admin Footer Tab**:
  - Add an input field in **Admin Dashboard $\rightarrow$ Footer & Contacts** for editing the ICEF Accredited badge target link (`accreditedBadgeUrl`).

---

## Verification Plan

### Automated Verification
- Run `npm run build` in `/web` to verify 0 TypeScript/Vite compilation errors.
- Run `compile_applet` for Android.

### Interactive CUJ Test
1. Open Admin Dashboard (`/admin`), go to **Footer & Contacts** tab, and verify the Accredited Badge Link input field.
2. Visit the public website footer, locate the ICEF Accredited badge next to the contact info, and click it to verify it opens the configured URL.
