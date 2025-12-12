import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { title: 'Home', id: 'home', type: 'scroll' },
    { title: 'About', id: 'about', type: 'scroll' },
    { title: 'Pricing', id: 'pricing', type: 'scroll' },
    { title: 'Virtual Tour', id: 'virtual-tour', type: 'route' },
    { title: 'Gallery', id: 'gallery', type: 'route' },

    { title: 'Availability', id: 'calendar', type: 'scroll' },
    { title: 'The Knot', id: 'theknot', type: 'external', url: 'https://www.theknot.com/marketplace/the-barn-at-sunset-farm-mount-nebo-wv-2098756', imageSrc: '/the-knot-logo.png', imageAlt: 'The Knot', logoClass: 'h-6' },
    { title: 'WeddingWire', id: 'weddingwire', type: 'external', url: 'https://www.weddingwire.com/biz/the-barn-at-sunset-farm/24dc683f3d58f6da.html', imageSrc: '/wedding-wire-logo.png', imageAlt: 'WeddingWire', logoClass: 'h-4' },
    { title: 'Contact', id: 'contact', type: 'scroll' },
  ];

  const handleNavigation = (link: { title: string; id: string; type: string; url?: string; imageSrc?: string; imageAlt?: string; logoClass?: string }) => {
    setIsMenuOpen(false);

    if (link.type === 'external' && link.url) {
        window.open(link.url, '_blank', 'noopener,noreferrer');
        return;
    }

    if (link.type === 'route') {
      navigate(`/${link.id}`);
      window.scrollTo(0, 0);
    } else {
      // Scroll type
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          const element = document.getElementById(link.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(link.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header className={`absolute top-0 left-0 w-full z-20 transition-all duration-300 ${['/gallery', '/virtual-tour'].includes(location.pathname) ? 'bg-[#4a4a4a] text-white' : 'bg-transparent text-white'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1
          className="text-3xl md:text-4xl font-bold tracking-wider cursor-pointer"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          onClick={() => navigate('/')}
        >
          The Barn at Sunset Farm
        </h1>
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavigation(link)}
              className="text-lg hover:text-[#EAD1DC] transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-[#EAD1DC] flex items-center"
            >
              {link.imageSrc ? (
                <img src={link.imageSrc} alt={link.imageAlt || link.title} className={`${link.logoClass || 'h-4'} w-auto object-contain`} />
              ) : (
                link.title
              )}
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
        <div className="md:hidden bg-[#4a4a4a] bg-opacity-95 absolute w-full z-30">
          <nav className="flex flex-col items-center space-y-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigation(link)}
                className="text-lg hover:text-[#EAD1DC] transition-colors duration-300 text-white flex items-center justify-center p-2"
              >
                 {link.imageSrc ? (
                    <img src={link.imageSrc} alt={link.imageAlt || link.title} className="h-6 w-auto object-contain bg-white/10 rounded px-1" />
                  ) : (
                    link.title
                  )}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
