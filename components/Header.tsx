import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { title: 'Home', id: 'home' },
    { title: 'About', id: 'about' },
    { title: 'Availability', id: 'calendar' },
    { title: 'The Knot', id: 'theknot' },
    { title: 'Contact', id: 'contact' },
  ];

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-transparent absolute top-0 left-0 w-full z-20 text-white transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          The Barn at Sunset Farm
        </h1>
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScroll(link.id)}
              className="text-lg hover:text-[#EAD1DC] transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-[#EAD1DC]"
            >
              {link.title}
            </button>
          ))}
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-[#4a4a4a] bg-opacity-90 absolute w-full">
          <nav className="flex flex-col items-center space-y-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScroll(link.id)}
                className="text-lg hover:text-[#EAD1DC] transition-colors duration-300"
              >
                {link.title}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
