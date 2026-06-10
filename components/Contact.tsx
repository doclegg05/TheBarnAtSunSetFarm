import React, { useMemo, useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { useBooking } from '../contexts/useBooking';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: '',
  });
  const [isDateEdited, setIsDateEdited] = useState(false);
  const [state, handleSubmit] = useForm('mdkjokdw');
  const {
    selectedDateRange: { start, end },
  } = useBooking();

  const selectedDateLabel = useMemo(() => {
    if (!start) {
      return '';
    }

    const formattedStart = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // A single-day selection arrives as start === end (or no end yet).
    if (!end || end.getTime() === start.getTime()) {
      return formattedStart;
    }

    const formattedEnd = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${formattedStart} - ${formattedEnd}`;
  }, [start, end]);

  const dateValue = isDateEdited
    ? formData.date
    : selectedDateLabel || formData.date;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'date') {
      setIsDateEdited(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">
            Get In Touch
          </h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
            Have questions or ready to book a tour? Fill out the form below, and
            our team will get back to you shortly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="w-full">
            {state.succeeded ? (
              <div className="bg-[#A2B29F] text-white text-center p-8 rounded-lg shadow-lg">
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
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#A2B29F] focus:border-[#A2B29F] bg-white"
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
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#A2B29F] focus:border-[#A2B29F] bg-white"
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
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#A2B29F] focus:border-[#A2B29F] bg-white"
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
                    value={dateValue}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#A2B29F] focus:border-[#A2B29F] bg-white"
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
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#A2B29F] focus:border-[#A2B29F] bg-white"
                  ></textarea>
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={state.errors}
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="w-full bg-[#A2B29F] text-white py-4 px-6 border border-transparent rounded-md shadow-lg text-lg font-semibold hover:bg-[#8c9a89] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A2B29F] transition-all duration-300 disabled:opacity-50"
                  >
                    {state.submitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Map & Info */}
          <div className="w-full h-full flex flex-col space-y-8">
            <div className="flex-grow min-h-[400px]">
              <iframe
                width="100%"
                height="100%"
                title="map"
                src="https://maps.google.com/maps?width=100%&height=100%&hl=en&q=19%20Boulder%20Trail%2C%20Mt.%20Nebo%2C%20WV&ie=UTF8&t=&z=14&iwloc=B&output=embed"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                className="rounded-xl shadow-md"
              ></iframe>
            </div>
            <div className="bg-[#FDF8F5] p-8 rounded-xl shadow-md border border-[#EAD1DC]">
              <h3 className="text-2xl font-bold text-[#4a4a4a] mb-4">
                Visit Us
              </h3>
              <p className="text-gray-600 mb-2">
                <strong>The Barn at Sunset Farm</strong>
                <br />
                19 Boulder Trail
                <br />
                Mount Nebo, West Virginia 26679
                <br />
                Overlooking the Gauley River Gorge
              </p>
              <p className="text-gray-600">
                <em>Visits by appointment only.</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
