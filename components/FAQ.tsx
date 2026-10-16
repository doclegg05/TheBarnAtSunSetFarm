import React, { useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { publishedFaqCategories } from '../lib/faq';

const categories = publishedFaqCategories();

const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 md:py-32 bg-brand-cream">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-charcoal">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 w-24 h-1 bg-brand-pink mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">
            Everything you need to know about hosting your special day at The
            Barn at Sunset Farm.
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <div key={category.title}>
              <h3 className="text-2xl font-semibold text-[#4a4a4a] mb-4 pb-2 border-b-2 border-[#EAD1DC]">
                {category.title}
              </h3>
              <div className="space-y-4">
                {category.items.map((faq, itemIndex) => {
                  const id = `faq-${categoryIndex}-${itemIndex}`;
                  const isOpen = openId === id;
                  return (
                    <div
                      key={faq.question}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
                    >
                      <button
                        type="button"
                        id={`${id}-question`}
                        onClick={() => toggleFAQ(id)}
                        aria-expanded={isOpen}
                        aria-controls={`${id}-answer`}
                        className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A2B29F] hover:bg-gray-50"
                      >
                        <span className="text-lg font-semibold text-[#4a4a4a]">
                          {faq.question}
                        </span>
                        <ChevronDownIcon
                          className={`w-6 h-6 flex-shrink-0 text-[#A2B29F] transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                        />
                      </button>
                      <div
                        id={`${id}-answer`}
                        role="region"
                        aria-labelledby={`${id}-question`}
                        className={`px-6 text-gray-600 transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen
                            ? 'max-h-[40rem] py-5 border-t border-gray-100 opacity-100'
                            : 'max-h-0 py-0 opacity-0'
                        }`}
                      >
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">Still have questions?</p>
          <a
            href="#contact"
            className="inline-block bg-brand-charcoal text-white py-3 px-8 rounded-lg font-semibold hover:bg-brand-charcoal/90 transition-colors duration-300 shadow-lg"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
