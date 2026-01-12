import React from 'react';

const SocialProof: React.FC = () => {


  return (
    <section className="py-12 bg-[#FDF8F5]">
      <div className="container mx-auto px-6 text-center">


        {/* Widget Container - Centered and Responsive */}
        <div className="flex justify-center items-center w-full">
          <div className="bg-white p-6 rounded-xl shadow-md border border-[#EAD1DC] max-w-4xl w-full flex justify-center items-center">
            <a
              href="https://www.weddingwire.com/biz/the-barn-at-sunset-farm/24dc683f3d58f6da.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity duration-300"
            >
              <img loading="lazy" src="/wedding-wire-logo.webp" alt="WeddingWire" className="h-10 w-auto" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
