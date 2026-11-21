import React, { useEffect, useRef, useState } from 'react';

export type RevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'blur-up';

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}

/**
 * Smooth IntersectionObserver-driven reveal wrapper with reduced-motion fallback.
 * Animates elements smoothly once when they enter the viewport.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 650,
  className = '',
  as = 'div',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) return;

    const checkVisibleInViewport = () => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight + 90 && rect.bottom > -40) {
        setIsVisible(true);
        return true;
      }
      return false;
    };

    if (checkVisibleInViewport()) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 90) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px 90px 0px',
      }
    );

    observer.observe(node);

    // Safety fallback for tall mobile stacks or resize/orientation changes
    const safetyTimer = window.setTimeout(() => {
      checkVisibleInViewport();
    }, 260);

    const onScrollCheck = () => {
      if (checkVisibleInViewport()) {
        window.removeEventListener('scroll', onScrollCheck);
      }
    };
    window.addEventListener('scroll', onScrollCheck, { passive: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(safetyTimer);
      window.removeEventListener('scroll', onScrollCheck);
    };
  }, [isVisible]);

  const hiddenTransform = (() => {
    switch (variant) {
      case 'fade-up':
        return 'opacity-0 translate-y-5 sm:translate-y-7';
      case 'fade-down':
        return 'opacity-0 -translate-y-5 sm:-translate-y-7';
      case 'fade-left':
        return 'opacity-0 translate-x-3 sm:translate-x-7';
      case 'fade-right':
        return 'opacity-0 -translate-x-3 sm:-translate-x-7';
      case 'zoom-in':
        return 'opacity-0 scale-95';
      case 'blur-up':
        return 'opacity-0 translate-y-4 sm:translate-y-6 scale-[0.98] blur-[2px]';
      default:
        return 'opacity-0 translate-y-5 sm:translate-y-7';
    }
  })();

  const visibleTransform = 'opacity-100 translate-y-0 translate-x-0 scale-100 blur-0';

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`transition-all will-change-transform ${
        isVisible ? visibleTransform : hiddenTransform
      } ${className}`}
    >
      {children}
    </Tag>
  );
};
