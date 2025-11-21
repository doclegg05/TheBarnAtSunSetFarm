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
          <a href="tel:555-123-4567" className="hover:text-white transition-colors duration-300">
            (555) 123-4567
          </a>
          {' | '}
          <a href="mailto:events@sunsetfarm.com" className="hover:text-white transition-colors duration-300">
            events@sunsetfarm.com
          </a>
        </p>

        {/* Placeholder for social media icons */}
        <div className="flex justify-center space-x-6 mb-8">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">Instagram</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">Facebook</a>
          <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">Pinterest</a>
        </div>

        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} The Barn at Sunset Farm. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
