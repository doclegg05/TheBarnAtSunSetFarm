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


        {/* The Knot Badge Container */}
        <div className="flex justify-center mb-8">
            <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center">
                 {/* Using the logo from TheKnotHub as a placeholder until the badge script is added */}
                 <a href="https://www.theknot.com/marketplace/the-barn-at-sunset-farm-mount-nebo-wv-2098756" target="_blank" rel="noopener noreferrer">
                    <img
                        src="/the-knot-logo.png"
                        alt="The Knot"
                        className="h-16 md:h-20 w-auto opacity-80 mb-2 hover:opacity-100 transition-opacity duration-300"
                    />
                 </a>
            </div>
        </div>

        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} The Barn at Sunset Farm. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
