import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GalleryPage from './components/GalleryPage';
import VirtualTourPage from './components/VirtualTourPage';
import FadeInSection from './components/FadeInSection';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <h1 className="text-5xl font-bold text-brand-gold mb-4">404</h1>
    <h2 className="text-2xl font-serif text-brand-charcoal mb-6">
      Page Not Found
    </h2>
    <p className="text-lg text-brand-charcoal/80 mb-8 max-w-md">
      The page you are looking for might have been removed, had its name
      changed, or is temporarily unavailable.
    </p>
    <Link
      to="/"
      className="px-8 py-3 bg-brand-gold text-white rounded-full hover:bg-brand-charcoal transition-colors"
    >
      Return Home
    </Link>
  </div>
);

const HomePage: React.FC = () => (
  <>
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
        <FAQ />
      </FadeInSection>

      <FadeInSection>
        <Contact />
      </FadeInSection>
    </main>
    <Footer />
  </>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-brand-cream text-brand-charcoal antialiased overflow-x-hidden">
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
