import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lottie } from 'lottie-react';
import { SR_TRANSITION_LOTTIE } from '../lib/transitionLottie';

interface TransitionContextType {
  isTransitioning: boolean;
  transitionLabel: string;
  navigateWithTransition: (to: string, label?: string) => void;
}

const PageTransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  transitionLabel: '',
  navigateWithTransition: () => {},
});

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/about': 'About Us',
  '/courses': 'Courses & Programs',
  '/destinations': 'Study Destinations',
  '/book-appointment': 'Book Consultation',
  '/track-appointment': 'Track Appointment',
  '/contact': 'Contact Office',
};

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<'idle' | 'entering' | 'exiting'>('idle');
  const [transitionLabel, setTransitionLabel] = useState('SR Global Consultants');
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const navigateWithTransition = useCallback(
    (to: string, label?: string) => {
      if (to === location.pathname && !to.includes('?')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      clearTimers();
      const resolvedLabel = label || ROUTE_LABELS[to] || 'Loading Page';
      setTransitionLabel(resolvedLabel);
      setPhase('entering');

      const navTimer = window.setTimeout(() => {
        navigate(to);
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        setPhase('exiting');
      }, 240);

      const endTimer = window.setTimeout(() => {
        setPhase('idle');
      }, 640);

      timersRef.current = [navTimer, endTimer];
    },
    [location.pathname, navigate]
  );

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning: phase !== 'idle',
        transitionLabel,
        navigateWithTransition,
      }}
    >
      {children}

      {/* Smooth Lottie + Remotion-Style Branded Transition Overlay */}
      {phase !== 'idle' && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[120] flex flex-col items-center justify-center pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            phase === 'entering'
              ? 'opacity-100 scale-100 backdrop-blur-md bg-navy-950/92'
              : 'opacity-0 scale-105 backdrop-blur-none bg-navy-950/0'
          }`}
        >
          {/* Ambient radial glow */}
          <div className="absolute w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

          {/* Lottie orbital ring + Company Logo Crest */}
          <div className="relative flex items-center justify-center w-44 h-44 animate-remotion-logo">
            <Lottie
              src={SR_TRANSITION_LOTTIE}
              loop
              autoplay
              className="w-44 h-44"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-brand-400/40 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="SR Global Consultants"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Remotion-style kinetic typography & sweep progress */}
          <div className="mt-4 text-center space-y-2.5 px-4">
            <div className="flex items-center justify-center gap-2">
              <span className="font-serif font-black text-xl sm:text-2xl tracking-widest text-white">
                SR GLOBAL
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-500 text-white px-2 py-0.5 rounded">
                Consultants
              </span>
            </div>

            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
              {transitionLabel}
            </div>

            <div className="w-44 h-1 bg-white/15 rounded-full overflow-hidden mx-auto">
              <div className="w-20 h-full bg-gradient-to-r from-brand-400 via-yellow-400 to-brand-400 rounded-full animate-remotion-sweep" />
            </div>
          </div>
        </div>
      )}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => useContext(PageTransitionContext);
