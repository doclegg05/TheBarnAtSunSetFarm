import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type NavLink = {
  title: string;
  id: string;
  type: 'scroll' | 'route' | 'external';
  url?: string;
  imageSrc?: string;
  imageAlt?: string;
  logoClass?: string;
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isInteriorPage = ['/gallery', '/virtual-tour'].includes(
    location.pathname
  );

  const navLinks: NavLink[] = [
    { title: 'Home', id: 'home', type: 'scroll' },
    { title: 'About', id: 'about', type: 'scroll' },
    { title: 'Pricing', id: 'pricing', type: 'scroll' },
    { title: 'Virtual Tour', id: 'virtual-tour', type: 'route' },
    { title: 'Gallery', id: 'gallery', type: 'route' },

    { title: 'Availability', id: 'calendar', type: 'scroll' },
    // Badge images use deliberately generic filenames: names like "the-knot-logo.webp"
    // match ad-blocker filter patterns and get stripped from the page for some visitors.
    {
      title: 'The Knot',
      id: 'theknot',
      type: 'external',
      url: 'https://www.theknot.com/marketplace/the-barn-at-sunset-farm-mount-nebo-wv-2098756',
      imageSrc: '/nav-img-1.webp',
      imageAlt: 'The Knot',
      logoClass: 'h-6',
    },
    {
      title: 'WeddingWire',
      id: 'weddingwire',
      type: 'external',
      url: 'https://www.weddingwire.com/biz/the-barn-at-sunset-farm/24dc683f3d58f6da.html',
      imageSrc: '/nav-img-2.webp',
      imageAlt: 'WeddingWire',
      logoClass: 'h-4',
    },
    { title: 'Contact', id: 'contact', type: 'scroll' },
  ];

  const handleNavigation = (link: NavLink) => {
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

  const renderLinkContent = (link: NavLink, isMobile = false) => {
    if (!link.imageSrc) {
      return link.title;
    }

    return (
      <span
        className={
          isMobile
            ? 'rounded bg-white/95 px-3 py-2'
            : 'rounded bg-white/95 px-2 py-1 shadow-sm'
        }
      >
        <img
          loading="lazy"
          src={link.imageSrc}
          alt={link.imageAlt || link.title}
          className={`${link.logoClass || 'h-4'} max-w-none shrink-0 object-contain`}
        />
      </span>
    );
  };

  return (
    <header
      className={`absolute top-0 left-0 z-20 w-full text-white transition-all duration-300 ${isInteriorPage ? 'bg-[#4a4a4a] shadow-md' : 'bg-gradient-to-b from-black/45 via-black/15 to-transparent'}`}
    >
      <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:gap-8">
        <button
          type="button"
          className="min-w-0 shrink cursor-pointer text-left text-2xl font-bold leading-tight tracking-wide transition-colors duration-300 hover:text-[#EAD1DC] sm:text-3xl xl:shrink-0 xl:text-4xl"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          onClick={() => navigate('/')}
          aria-label="Go to home page"
        >
          The Barn at Sunset Farm
        </button>
        <nav
          className="hidden items-center gap-4 xl:flex 2xl:gap-6"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              onClick={() => handleNavigation(link)}
              className="flex h-10 shrink-0 items-center whitespace-nowrap border-b-2 border-transparent text-[15px] font-medium transition-colors duration-300 hover:border-[#EAD1DC] hover:text-[#EAD1DC]"
              aria-label={
                link.type === 'external' ? `Open ${link.title}` : undefined
              }
            >
              {renderLinkContent(link)}
            </button>
          ))}
        </nav>
        <div className="xl:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full border border-white/60 bg-black/10 p-2 text-white shadow-sm transition-colors duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              ></path>
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="absolute left-0 top-full z-30 w-full bg-[#4a4a4a]/95 shadow-xl xl:hidden">
          <nav
            className="mx-auto grid max-w-2xl grid-cols-1 gap-2 px-4 py-5 sm:grid-cols-2"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => handleNavigation(link)}
                className="flex min-h-12 w-full items-center justify-center rounded border border-white/10 px-3 text-base font-medium text-white transition-colors duration-300 hover:bg-white/10 hover:text-[#EAD1DC]"
                aria-label={
                  link.type === 'external' ? `Open ${link.title}` : undefined
                }
              >
                {renderLinkContent(link, true)}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
