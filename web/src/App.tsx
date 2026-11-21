import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Courses } from './pages/Courses';
import { Destinations } from './pages/Destinations';
import { BookAppointment } from './pages/BookAppointment';
import { TrackAppointment } from './pages/TrackAppointment';
import { Contact } from './pages/Contact';
import { PrivacyPolicy, Terms } from './pages/PrivacyPolicy';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { SettingsProvider } from './context/SettingsContext';
import { LiveDataProvider } from './context/LiveDataContext';
import { PageTransitionProvider } from './components/PageTransition';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin/dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        <div key={location.pathname} className={!isAdmin ? 'animate-remotion-page' : undefined}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/track-appointment" element={<TrackAppointment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingWhatsApp />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <LiveDataProvider>
          <PageTransitionProvider>
            <AppLayout />
          </PageTransitionProvider>
        </LiveDataProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App;
