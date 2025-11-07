import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import BookingCalendar from './components/BookingCalendar';
import TheKnotHub from './components/TheKnotHub';
import Contact from './components/Contact';
import Footer from './components/Footer';

// --- Color Palette ---
// Background: #FDF8F5 (Soft Cream)
// Primary Accent: #EAD1DC (Blush Pink)
// Secondary Accent: #A2B29F (Muted Sage Green)
// Text: #4a4a4a (Charcoal)
// Gold Accent: #D4AF37

const App: React.FC = () => {
  return (
    <div className="bg-[#FDF8F5] text-[#4a4a4a] antialiased overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <About />
        <BookingCalendar />
        <TheKnotHub />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
