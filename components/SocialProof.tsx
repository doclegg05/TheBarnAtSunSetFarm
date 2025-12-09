import React, { useEffect } from 'react';

const SocialProof: React.FC = () => {
  useEffect(() => {
    // TODO: PASTE WEDDINGWIRE WIDGET SCRIPT HERE
    // Example:
    // const script = document.createElement('script');
    // script.src = "https://www.weddingwire.com/review_widget.js";
    // script.async = true;
    // document.body.appendChild(script);

    // return () => {
    //   document.body.removeChild(script);
    // };
  }, []);

  return (
    <section className="py-12 bg-[#FDF8F5]">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold text-[#4a4a4a] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          See What Our Couples Are Saying
        </h3>
        
        {/* Widget Container - Centered and Responsive */}
        <div className="flex justify-center items-center w-full">
          <div className="bg-white p-6 rounded-xl shadow-md border border-[#EAD1DC] max-w-4xl w-full flex justify-center min-h-[200px] items-center text-gray-400 border-dashed">
             {/* TODO: PASTE WEDDINGWIRE WIDGET HTML HERE */}
             {/* Example: <div id="weddingwire-review-widget"></div> */}
             <a 
               href="https://www.weddingwire.com/biz/the-barn-at-sunset-farm/1230d35d03362140.html" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-[#A2B29F] hover:text-[#4a4a4a] transition-colors underline decoration-dashed underline-offset-4"
             >
               Click to see our reviews on WeddingWire
             </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
