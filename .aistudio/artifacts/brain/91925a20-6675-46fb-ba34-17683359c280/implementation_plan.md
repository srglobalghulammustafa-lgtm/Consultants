# Implementation Plan - Google Drive Image Fix & Save Reliability

The user is reporting that Google Drive links are not saving and images are not appearing. This is likely due to:
1. Incomplete link conversion logic.
2. Postgres/Supabase case sensitivity for column names (imageUrl vs imageurl).

## 1. Upgrade Link Converter
I will replace the existing split-based logic with a robust regex:
```typescript
const fixGoogleDriveLink = (url: string): string => {
  if (!url) return '';
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}`;
  }
  return url;
};
```

## 2. LiveDataContext Mapping Fixes
I will update `LiveDataContext.tsx` to ensure it maps incoming and outgoing data correctly, regardless of Postgres casing.

- **Fetch**: `imageUrl: d.imageUrl || d.imageurl`
- **Update/Insert**: Explicitly send the field names.

## 3. SQL Script Update
The script in `AdminDashboard.tsx` will be updated to use `"imageUrl"` (with quotes) to ensure the column is created exactly as requested by the TypeScript code.

## 4. Public View Fallbacks
- Add `crossOrigin="anonymous"` and better error handling to `img` tags.
- Ensure `Destinations.tsx` and `Home.tsx` properly handle the mapping.

## 5. Verification
- Sync all changes.
- Provide the updated SQL to the user.
