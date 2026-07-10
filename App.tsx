import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import BookingCalendar from './components/BookingCalendar';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GalleryPage from './components/GalleryPage';
import VirtualTourPage from './components/VirtualTourPage';
import { BookingProvider } from './contexts/BookingContext';
import FadeInSection from './components/FadeInSection';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <h1 className="text-5xl font-bold text-[#D4AF37] mb-4">404</h1>
    <h2 className="text-2xl font-serif text-[#4a4a4a] mb-6">Page Not Found</h2>
    <p className="text-lg text-[#4a4a4a]/80 mb-8 max-w-md">
      The page you are looking for might have been removed, had its name
      changed, or is temporarily unavailable.
    </p>
    <Link
      to="/"
      className="px-8 py-3 bg-[#D4AF37] text-white rounded-full hover:bg-[#4a4a4a] transition-colors"
    >
      Return Home
    </Link>
  </div>
);

const HomePage: React.FC = () => (
  <BookingProvider>
    <Header />
    <main>
      <Hero />
      <FadeInSection>
        <About />
      </FadeInSection>
      <FadeInSection>
        <Pricing />
      </FadeInSection>

      <FadeInSection>
        <BookingCalendar />
      </FadeInSection>

      <FadeInSection>
        <FAQ />
      </FadeInSection>

      <FadeInSection>
        <Contact />
      </FadeInSection>
    </main>
    <Footer />
  </BookingProvider>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-[#FDF8F5] text-[#4a4a4a] antialiased overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/virtual-tour" element={<VirtualTourPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
