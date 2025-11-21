import React from 'react';

const TheKnotHub: React.FC = () => {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 text-center">
        <p className="text-gray-500 uppercase tracking-widest text-sm mb-6 font-medium">
          As Featured On
        </p>

        <a
          href="https://www.theknot.com/marketplace/the-barn-at-sunset-farm-mount-nebo-wv-2098756"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block group transition-transform duration-300 hover:scale-105"
        >
          {/* Official The Knot Logo */}
          <img
            src="/the-knot-logo.png"
            alt="The Knot"
            className="h-16 md:h-20 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
        </a>

        <div className="mt-8 flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-1 text-[#A2B29F]">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <p className="text-[#4a4a4a] font-semibold text-lg">
            "A romantic wedding venue in Mount Nebo, WV"
          </p>
          <a
            href="https://www.theknot.com/marketplace/the-barn-at-sunset-farm-mount-nebo-wv-2098756"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EAD1DC] hover:text-[#d4b6c3] font-medium underline decoration-2 underline-offset-4 transition-colors"
          >
            Read our reviews
          </a>
        </div>
      </div>
    </section>
  );
};

export default TheKnotHub;