# Implementation Plan - Navbar Link Management, Admin Logo Control & SQL Schema Automation

Enhancing the platform to support fully dynamic navbar links (including 'Track Status'), Admin-controllable website branding (logo), and an automated Supabase database validation and schema generation script.

---

## 1. Dynamic 'Track Status' Link in Navbar Settings
- **SettingsContext.tsx**: Ensure 'Track Status' is properly registered as a manageable link in the `header.navLinks` config, allowing toggling visibility in Admin Dashboard.
- **Navbar.tsx**: Use `settings.header.navLinks` to render the navbar, ensuring the link is visible if marked `isVisible: true` in Admin Settings.

## 2. Admin Website Logo Control
- **Logo Configuration (`types.ts` & `SettingsContext.tsx`)**:
  - Add `logoUrl` to `HeaderConfig`.
- **Admin Dashboard (`AdminDashboard.tsx`)**:
  - Add an image URL input field to the "Header & Navbar Settings" tab to allow updating the website logo.
- **Logo Display (`Navbar.tsx` & `Footer.tsx`)**:
  - Update `<img>` tags to use `settings.header.logoUrl || '/logo.png'`.
  - Remove logo borders/rings as requested.

## 3. Comprehensive Database Schema Automation (SQL Script)
- **Supabase Auto-Generator Script**:
  - Create a robust SQL script that checks for the existence of all required tables (`leads`, `appointments`, `courses`, `destinations`, `testimonials`, `site_settings`, `broadcast_notifications`) and creates them if missing.
  - Implement RLS policy checks and verification.

---

## Verification Plan

### Automated Verification
- Run `npm run build` in `/web` to verify 0 TypeScript/Vite compilation errors.
- Run `compile_applet` for Android.

### Interactive Verification
1. Open Admin Dashboard $\rightarrow$ Header Settings, verify 'Track Status' is visible and manageable.
2. In the Header Settings tab, update the logo URL; verify the logo changes on the live website.
3. Remove logo borders in the CSS/Tailwind classes in `Navbar.tsx` and `Footer.tsx`.
4. Run the comprehensive SQL schema auto-generation script in Supabase SQL editor to ensure all data tables are present and secure.
