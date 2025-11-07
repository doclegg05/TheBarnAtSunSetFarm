import React from 'react';
import StarIcon from './icons/StarIcon';

const TestimonialCard: React.FC<{ quote: string; author: string }> = ({ quote, author }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg text-center">
    <div className="flex justify-center text-[#D4AF37] mb-4">
      {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5" />)}
    </div>
    <p className="text-gray-600 italic">"{quote}"</p>
    <p className="mt-4 font-semibold text-[#4a4a4a]">- {author}</p>
  </div>
);

const TheKnotHub: React.FC = () => {
  return (
    <section id="theknot" className="py-20 md:py-32 bg-[#FDF8F5]">
      <div className="container mx-auto px-6 text-center">
        <img src="https://static.xoedge.com/logo/the-knot-meta.png" alt="The Knot Logo" className="h-16 mx-auto mb-4"/>
        <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">As Featured On The Knot</h2>
        <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
        <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
          We are proud to be a highly-rated and award-winning venue on The Knot, a trusted source for wedding planning. See what our couples have to say!
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 my-12">
           <img src="https://www.theknot.com/tk-media/images/bow-2024/BOW_2024_badge.png" alt="Best of Weddings 2024" className="h-40"/>
           <img src="https://www.theknot.com/tk-media/images/cwa-2024/cwa-2024.png" alt="Couples Choice Awards 2024" className="h-40"/>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          <TestimonialCard quote="The most magical day of our lives. The venue was a dream, and the staff made everything seamless." author="Jessica & Tom" />
          <TestimonialCard quote="Our guests couldn't stop talking about how beautiful the barn was. The cottages were a huge plus!" author="Emily & David" />
          <TestimonialCard quote="A 10/10 experience. If you want a rustic yet elegant wedding, this is the place. Absolutely perfect." author="Megan & Chris" />
        </div>
        
        <a 
          href="https://www.theknot.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-16 bg-[#4a4a4a] text-white py-4 px-10 rounded-lg text-xl hover:bg-opacity-80 transition-all duration-300 shadow-lg"
        >
          View Our Storefront on The Knot
        </a>
      </div>
    </section>
  );
};

export default TheKnotHub;
