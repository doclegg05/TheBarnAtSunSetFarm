import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import BookingCalendar from './components/BookingCalendar';
import Contact from './components/Contact';
import Footer from './components/Footer';

import GalleryPage from './components/GalleryPage';


// --- Color Palette ---
// Background: #FDF8F5 (Soft Cream)
// Primary Accent: #EAD1DC (Blush Pink)
// Secondary Accent: #A2B29F (Muted Sage Green)
// Text: #4a4a4a (Charcoal)
// Gold Accent: #D4AF37

import { BookingProvider } from './contexts/BookingContext';

import FadeInSection from './components/FadeInSection';

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

import VirtualTourPage from './components/VirtualTourPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-[#FDF8F5] text-[#4a4a4a] antialiased overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/virtual-tour" element={<VirtualTourPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
