import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#4a4a4a] text-gray-300 py-12">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          The Barn at Sunset Farm
        </h3>
        <p className="mb-4">Mount Nebo, West Virginia</p>
        <p className="mb-6">
          <a href="tel:304-619-6805" className="hover:text-white transition-colors duration-300">
            (304) 619-6805
          </a>
          {' | '}
          <a href="mailto:sunsetwillowevents@gmail.com" className="hover:text-white transition-colors duration-300">
            sunsetwillowevents@gmail.com
          </a>
        </p>




        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} The Barn at Sunset Farm. All Rights Reserved.
        </p>

        {/* Designed By & Makers Mark */}
        <div className="mt-8 flex flex-col items-center justify-center space-y-4">
            <img loading="lazy" src="/designed-by.webp" alt="Designed by Britt Legg" className="h-12 w-auto" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
