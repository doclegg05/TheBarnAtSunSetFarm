import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import {
  APPLE_MAPS_DIRECTIONS_URL,
  ARRIVAL_INSTRUCTIONS,
  GOOGLE_MAPS_DIRECTIONS_URL,
  GOOGLE_MAPS_EMBED_URL,
  VENUE_ADDRESS,
  VENUE_NAME,
} from '../lib/venueLocation';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: '',
  });
  const [state, handleSubmit] = useForm('mdkjokdw');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-charcoal">
            Get In Touch
          </h2>
          <div className="mt-4 w-24 h-1 bg-brand-pink mx-auto"></div>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
            Have questions or ready to book a tour? Share your preferred event
            date or date range below, and our team will confirm availability.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="w-full">
            {state.succeeded ? (
              <div
                role="status"
                className="bg-brand-sage text-white text-center p-8 rounded-lg shadow-lg"
              >
                <h3 className="text-2xl font-bold">Thank You!</h3>
                <p className="mt-2">
                  Your inquiry has been sent. We'll be in touch soon!
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-gray-50 p-8 rounded-xl shadow-md border border-gray-100"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-xs focus:ring-[#A2B29F] focus:border-brand-sage bg-white"
                  />
                  <ValidationError
                    prefix="Name"
                    field="name"
                    errors={state.errors}
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-xs focus:ring-[#A2B29F] focus:border-brand-sage bg-white"
                  />
                  <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-xs focus:ring-[#A2B29F] focus:border-brand-sage bg-white"
                  />
                  <ValidationError
                    prefix="Phone"
                    field="phone"
                    errors={state.errors}
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Prospective Event Date(s)
                  </label>
                  <input
                    type="text"
                    name="date"
                    id="date"
                    placeholder="MM/DD/YYYY or Date Range"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-xs focus:ring-[#A2B29F] focus:border-brand-sage bg-white"
                  />
                  <ValidationError
                    prefix="Date"
                    field="date"
                    errors={state.errors}
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-xs focus:ring-[#A2B29F] focus:border-brand-sage bg-white"
                  ></textarea>
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={state.errors}
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <ValidationError
                  errors={state.errors}
                  role="alert"
                  className="text-red-700 text-sm"
                />
                <div>
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="w-full bg-brand-sage text-white py-4 px-6 border border-transparent rounded-md shadow-lg text-lg font-semibold hover:bg-[#8c9a89] active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#A2B29F] transition-all duration-300 disabled:opacity-50"
                  >
                    {state.submitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Map & Info */}
          <div className="w-full h-full flex flex-col space-y-8">
            <div className="grow min-h-[400px]">
              <iframe
                width="100%"
                height="100%"
                title="Map showing the exact location of The Barn at Sunset Farm"
                src={GOOGLE_MAPS_EMBED_URL}
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                className="rounded-xl shadow-md"
              ></iframe>
            </div>
            <div className="bg-brand-cream p-8 rounded-xl shadow-md border border-brand-pink">
              <h3 className="text-2xl font-bold text-brand-charcoal mb-4">
                Visit Us
              </h3>
              <p className="text-gray-600 mb-2">
                <strong>{VENUE_NAME}</strong>
                <br />
                {VENUE_ADDRESS.street}
                <br />
                {VENUE_ADDRESS.locality}, {VENUE_ADDRESS.region}{' '}
                {VENUE_ADDRESS.postalCode}
                <br />
                Overlooking the Gauley River Gorge
              </p>
              <p className="text-gray-600 text-sm mb-2">
                <em>
                  Our address is new and most GPS apps can&apos;t find it yet —
                  please use the directions buttons below, which navigate
                  straight to our farm.
                </em>
              </p>
              <p className="text-gray-600 mb-6">
                <em>Visits by appointment only.</em>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <a
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-brand-sage text-white py-3 px-4 rounded-md shadow-sm font-semibold hover:bg-[#8c9a89] transition-colors duration-300"
                >
                  Directions in Google Maps
                </a>
                <a
                  href={APPLE_MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center border border-brand-sage text-brand-charcoal py-3 px-4 rounded-md shadow-sm font-semibold hover:bg-brand-sage hover:text-white transition-colors duration-300"
                >
                  Directions in Apple Maps
                </a>
              </div>
              <div className="border-t border-brand-pink pt-4">
                <h4 className="text-lg font-bold text-brand-charcoal mb-2">
                  Finding Us
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  We are a working farm on a country road, so please use the
                  directions buttons above — they navigate to our exact GPS pin.
                  For the last stretch:
                </p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  {ARRIVAL_INSTRUCTIONS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
