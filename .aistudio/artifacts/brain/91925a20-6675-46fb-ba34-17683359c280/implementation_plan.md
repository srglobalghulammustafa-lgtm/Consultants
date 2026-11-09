# Implementation Plan - Broadcast Table & Admin Enhancements

The user wants to fix the broadcast deletion logic by moving it to a dedicated Supabase table and add several quality-of-life improvements to the Admin panel.

## 1. Supabase SQL Migration
I will provide the following SQL to the user to create the `broadcasts` table. This ensures that deleting a broadcast actually removes the record from the database.

```sql
-- 1. Create Broadcasts Table
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal',
    link TEXT,
    play_sound BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- 3. Public Read Access
CREATE POLICY "Public read broadcasts" 
ON public.broadcasts FOR SELECT 
USING (TRUE);

-- 4. Full Admin Access (Using existing rules pattern)
CREATE POLICY "Full access to broadcasts" 
ON public.broadcasts FOR ALL 
USING (TRUE);
```

## 2. SettingsContext.tsx Refactoring
- Modify `fetchLiveSettings` to also fetch the latest broadcasts from the `broadcasts` table.
- Update `sendBroadcastNotification` to `insert` into the `broadcasts` table.
- Update `deleteBroadcast` to perform a real `delete()` call on the `broadcasts` table.
- Update `clearBroadcastHistory` to delete all records.

## 3. AdminDashboard.tsx Enhancements
- **Google Drive Link Fixer**: Add a helper function `fixGoogleDriveLink(url: string): string` that converts share links to direct download links.
- **Flag Picker**: Add a `FLAGS` constant with common country emojis and a dropdown in the "Add Destination" modal.
- **Auto-Fix Integration**: Hook the Google Drive fixer into the `onChange` or `onBlur` events of image URL fields for Banners, Testimonials, and Destinations.

## 4. Components Update
- **Navbar.tsx**: Update how it fetches notifications to ensure it pulls from the live `broadcasts` table (via the updated Context).
- **Destinations.tsx**: Ensure it correctly handles the flag/image priority.

## 5. Verification
- Run `npm run build` to ensure no type mismatches or syntax errors.
