import React from 'react';
import CheckIcon from './icons/CheckIcon';
import { PACKAGE_TIERS } from '../lib/siteContent';

const Pricing: React.FC = () => {
  return (
    <section id="packages" className="py-20 md:py-32 bg-brand-cream">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-charcoal">
            Packages
          </h2>
          <div className="mt-4 w-24 h-1 bg-brand-pink mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PACKAGE_TIERS.map((tier, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 rounded-2xl transition-transform duration-300 hover:-translate-y-2 ${
                tier.highlight
                  ? 'bg-white shadow-2xl border-2 border-brand-pink scale-105 z-10'
                  : 'bg-white shadow-lg border border-gray-100'
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-white text-sm font-semibold tracking-wide uppercase px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold text-brand-charcoal mb-2">
                {tier.name}
              </h3>

              <p className="text-gray-600 mb-8">{tier.description}</p>

              <ul className="space-y-4 mb-8 grow">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-brand-sage mt-1 mr-3 shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="block text-center py-4 rounded-lg font-semibold transition-colors duration-300 bg-brand-charcoal text-white hover:bg-brand-charcoal/90"
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
