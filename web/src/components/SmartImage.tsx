import React, { useState, useEffect, useMemo } from 'react';
import { getImageCandidateUrls } from '../lib/imageUtils';

interface SmartImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallback?: React.ReactNode;
}

/**
 * Image component with automatic Google Drive multi-endpoint fallback and no-referrer policy.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt = '',
  fallback = null,
  className = '',
  ...rest
}) => {
  const candidates = useMemo(() => getImageCandidateUrls(src), [src]);
  const [attemptIndex, setAttemptIndex] = useState(0);

  useEffect(() => {
    setAttemptIndex(0);
  }, [src]);

  if (!candidates.length || attemptIndex >= candidates.length) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...rest}
      src={candidates[attemptIndex]}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={(e) => {
        if (attemptIndex + 1 < candidates.length) {
          setAttemptIndex((prev) => prev + 1);
        } else {
          setAttemptIndex(candidates.length);
        }
        rest.onError?.(e);
      }}
    />
  );
};
