import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-7xl font-black text-brand-500 font-serif">404</h1>
        <h2 className="text-2xl font-bold text-navy-950">Page Not Found</h2>
        <p className="text-slate-600 text-sm">
          The requested education or migration resource could not be found. Please navigate back to our main portal.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
