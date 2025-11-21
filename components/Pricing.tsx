import React from 'react';
import CheckIcon from './icons/CheckIcon';

const Pricing: React.FC = () => {
  const tiers = [
    {
      name: 'Classic Celebration',
      price: '$3,000',
      description: 'Our most popular package for a traditional Saturday wedding surrounded by friends and family.',
      features: [
        'Saturday availability',
        'Up to 200 guests',
        '12-hour venue rental',
        'Full Barn & Outdoor access',
        'Bridal Suite & Groom\'s Quarters',
        'Setup & Cleanup included',
        'Parking attendants'
      ],
      highlight: true,
    },
    {
      name: 'The Sunset Weekend',
      price: '$6,500',
      description: 'The ultimate experience. Enjoy the property for the entire weekend with overnight accommodations.',
      features: [
        'Friday - Sunday access',
        'Up to 200 guests',
        'Rehearsal Dinner space',
        'Overnight stay for the couple',
        'Priority vendor access',
        'All amenities from Classic package',
        'Sunday Brunch option'
      ],
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-[#FDF8F5]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">Packages & Pricing</h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
            Transparent pricing for your perfect day. Choose the package that fits your vision and budget.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 rounded-2xl transition-transform duration-300 hover:-translate-y-2 ${tier.highlight
                ? 'bg-white shadow-2xl border-2 border-[#EAD1DC] scale-105 z-10'
                : 'bg-white shadow-lg border border-gray-100'
                }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#EAD1DC] text-[#4a4a4a] px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-[#4a4a4a] mb-2">{tier.name}</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-[#D4AF37]">{tier.price}</span>
              </div>
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
                className={`block text-center py-4 rounded-lg font-semibold transition-colors duration-300 ${tier.highlight
                  ? 'bg-[#4a4a4a] text-white hover:bg-opacity-90'
                  : 'bg-[#FDF8F5] text-[#4a4a4a] hover:bg-[#EAD1DC]'
                  }`}
              >
                Request Quote
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 italic">
            * Starting prices don't include service fees, taxes, gratuity, and rental fees.
            <br />
            Guest count and seasonality may also affect prices. Peak season is May-Oct.
            <br />
            A 25% non-refundable deposit is required to save your date.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
