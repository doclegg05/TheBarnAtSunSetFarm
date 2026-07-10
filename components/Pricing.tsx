import React from 'react';
import CheckIcon from './icons/CheckIcon';

const Pricing: React.FC = () => {
  const tiers = [
    {
      name: 'Classic Celebration',
      price: '$3,800',
      description: '1 Day Wedding. Use of the Barn/Porch/Outside Area.',
      features: [
        'Open Availability',
        'Up to 200 guests',
        'All day rental',
        'Full Barn & Outdoor access',
        'Optional: 1 Night at Guest Cabin (Total $4,800)',
      ],
      highlight: false,
    },
    {
      name: 'The Sunset Weekend',
      price: '$5,800',
      description: '2 nights. The ultimate experience.',
      features: [
        'Friday - Sunday access',
        'Up to 200 guests',
        'Tables and Chairs included',
        'Rehearsal Dinner space',
        "Bridal Suite & Groom's Quarters",
        'Overnight stay for the couple',
        'Priority vendor access',
        'All amenities from Classic package',
        'Additional Amenities Available',
      ],
      highlight: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-[#FDF8F5]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">
            Packages & Pricing
          </h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <div className="mt-8">
            <h3 className="text-3xl font-bold text-[#D4AF37]">
              Starting at $3,800
            </h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 rounded-2xl transition-transform duration-300 hover:-translate-y-2 ${
                tier.highlight
                  ? 'bg-white shadow-2xl border-2 border-[#EAD1DC] scale-105 z-10'
                  : 'bg-white shadow-lg border border-gray-100'
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white text-sm font-semibold tracking-wide uppercase px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold text-[#4a4a4a] mb-2">
                {tier.name}
              </h3>

              <p
                className="text-4xl font-bold text-[#4a4a4a] mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {tier.price}
              </p>

              <p className="text-gray-600 mb-8">{tier.description}</p>

              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="block text-center py-4 rounded-lg font-semibold transition-colors duration-300 bg-[#4a4a4a] text-white hover:bg-opacity-90"
              >
                Request Quote
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
