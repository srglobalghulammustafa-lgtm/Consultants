import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lottie } from 'lottie-react';
import { SR_TRANSITION_LOTTIE } from '../lib/transitionLottie';
import { useSiteSettings } from '../context/SettingsContext';
import { SmartImage } from './SmartImage';

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
  '/privacy-policy': 'Privacy Policy',
  '/terms': 'Terms of Service',
};

type TransitionPhase = 'idle' | 'entering' | 'holding' | 'exiting';

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [transitionLabel, setTransitionLabel] = useState('SR Global Consultants');
  const [transitionKey, setTransitionKey] = useState(0);
  const timersRef = useRef<number[]>([]);

  const logoSrc = settings.header?.logoUrl || '/logo.png';

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
      setTransitionKey((k) => k + 1);
      setPhase('entering');

      // Stage 1 (0 -> 260ms): Curtain settles in & Lottie + Logo Crest springs open
      const holdTimer = window.setTimeout(() => {
        setPhase('holding');
      }, 260);

      // Stage 2 (680ms): Perform route switch safely behind full frosted backdrop
      const navTimer = window.setTimeout(() => {
        navigate(to);
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }, 680);

      // Stage 3 (1020ms): Lottie crest & progress finish, fade backdrop smoothly to reveal new page
      const exitTimer = window.setTimeout(() => {
        setPhase('exiting');
      }, 1020);

      // Stage 4 (1480ms): Clean teardown
      const endTimer = window.setTimeout(() => {
        setPhase('idle');
      }, 1480);

      timersRef.current = [holdTimer, navTimer, exitTimer, endTimer];
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

      {/* Deliberate Phased Lottie + Remotion-Style Branded Transition Overlay */}
      {phase !== 'idle' && (
        <div
          key={transitionKey}
          aria-hidden="true"
          className={`fixed inset-0 z-[120] flex flex-col items-center justify-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            phase === 'exiting'
              ? 'opacity-0 scale-105 backdrop-blur-none bg-navy-950/0'
              : 'opacity-100 scale-100 backdrop-blur-lg bg-navy-950/95'
          }`}
        >
          {/* Ambient radial glow */}
          <div className="absolute w-[28rem] h-[28rem] rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="absolute w-64 h-64 rounded-full bg-yellow-400/10 blur-2xl pointer-events-none" />

          {/* Lottie orbital ring + Unclipped Company Logo */}
          <div className="relative flex items-center justify-center w-56 h-56 animate-remotion-logo">
            <Lottie
              src={SR_TRANSITION_LOTTIE}
              loop
              autoplay
              className="w-56 h-56"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <SmartImage
                src={logoSrc}
                alt="SR Global Consultants"
                className="h-20 sm:h-24 w-auto object-contain bg-white/95 px-3 py-2 rounded-xl shadow-2xl"
                fallback={
                  <img
                    src="/logo.png"
                    alt="SR Global Consultants"
                    className="h-20 sm:h-24 w-auto object-contain bg-white/95 px-3 py-2 rounded-xl shadow-2xl"
                  />
                }
              />
            </div>
          </div>

          {/* Remotion-style kinetic typography & smooth phased progress fill */}
          <div className="mt-5 text-center space-y-3 px-4">
            <div className="flex items-center justify-center gap-2">
              <span className="font-serif font-black text-xl sm:text-2xl tracking-widest text-white">
                SR GLOBAL
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-500 text-white px-2.5 py-0.5 rounded shadow">
                Consultants
              </span>
            </div>

            <div className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-300">
              Opening • {transitionLabel}
            </div>

            <div className="w-52 h-1.5 bg-white/15 rounded-full overflow-hidden mx-auto shadow-inner">
              <div className="h-full bg-gradient-to-r from-brand-400 via-yellow-300 to-brand-400 rounded-full animate-remotion-progress" />
            </div>
          </div>
        </div>
      )}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => useContext(PageTransitionContext);
