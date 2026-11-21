/**
 * Utilities for normalizing and resolving Google Drive & web image URLs
 * so student photos, banners, and destination images render reliably in <img> tags.
 */

export function extractGoogleDriveFileId(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Match drive.google.com/file/d/<ID>/...
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileMatch?.[1]) return fileMatch[1];

  // Match drive.google.com/open?id=<ID>, uc?id=<ID>, uc?export=view&id=<ID>, thumbnail?id=<ID>
  const queryMatch = trimmed.match(/drive\.google\.com\/(?:open|uc|thumbnail|file)[^?#]*[?&]id=([a-zA-Z0-9_-]+)/i);
  if (queryMatch?.[1]) return queryMatch[1];

  // Match drive.usercontent.google.com/download?id=<ID>
  const userContentMatch = trimmed.match(/drive\.usercontent\.google\.com\/[^?#]*[?&]id=([a-zA-Z0-9_-]+)/i);
  if (userContentMatch?.[1]) return userContentMatch[1];

  // Match lh3.googleusercontent.com/d/<ID>
  const lh3Match = trimmed.match(/lh\d*\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (lh3Match?.[1]) return lh3Match[1];

  // Match docs.google.com/.../d/<ID>
  const docsMatch = trimmed.match(/docs\.google\.com\/[^/]+\/d\/([a-zA-Z0-9_-]+)/i);
  if (docsMatch?.[1]) return docsMatch[1];

  return null;
}

/**
 * Converts Google Drive sharing links to a reliable high-resolution thumbnail/image URL.
 * Non-Drive URLs are returned trimmed as-is.
 */
export function normalizeGoogleImageUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  }
  return trimmed;
}

/**
 * Returns an ordered list of candidate image URLs to attempt when loading an image.
 * For Google Drive files, tries thumbnail -> lh3.googleusercontent -> uc?export=view -> raw URL.
 */
export function getImageCandidateUrls(rawUrl?: string | null): string[] {
  if (!rawUrl) return [];
  const trimmed = rawUrl.trim();
  if (!trimmed) return [];

  const driveId = extractGoogleDriveFileId(trimmed);
  if (!driveId) return [trimmed];

  const candidates = [
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`,
    `https://lh3.googleusercontent.com/d/${driveId}=s1200`,
    `https://drive.google.com/uc?export=view&id=${driveId}`,
    `https://drive.google.com/uc?id=${driveId}`,
  ];

  return Array.from(new Set(candidates));
}
