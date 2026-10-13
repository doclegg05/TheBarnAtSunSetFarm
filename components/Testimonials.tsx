import React from 'react';
import {
  GOOGLE_REVIEWS_URL,
  TESTIMONIALS,
  Testimonial,
} from '../lib/testimonials';

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-5 h-5 ${filled ? 'text-[#D4AF37]' : 'text-gray-300'}`}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
      clipRule="evenodd"
    />
  </svg>
);

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials = TESTIMONIALS,
}) => {
  // Hidden until the first real testimonial is added — an empty
  // "Love Notes" heading would hurt more than it helps.
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">
            Love Notes
          </h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-600">
            Kind words from couples and families who celebrated with us.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <figure
              key={`${testimonial.names}-${testimonial.date}`}
              className="flex flex-col w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] bg-[#FDF8F5] p-8 rounded-lg shadow-lg border border-gray-100"
            >
              {testimonial.rating && (
                <div
                  className="flex space-x-1 mb-4"
                  role="img"
                  aria-label={`Rated ${testimonial.rating} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      filled={star <= (testimonial.rating ?? 0)}
                    />
                  ))}
                </div>
              )}
              <blockquote className="flex-grow text-gray-600 italic leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="border-t border-gray-200 pt-4">
                <span
                  className="block font-bold text-[#4a4a4a] text-lg"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {testimonial.names}
                </span>
                <span className="block mt-1 text-sm text-gray-500">
                  {testimonial.event} &middot; {testimonial.date}
                </span>
                <span className="block mt-1 text-xs text-gray-500">
                  {testimonial.source}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Selected testimonials, shared with our guests&rsquo; permission.
          </p>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-[#A2B29F] text-[#4a4a4a] py-3 px-6 rounded-md font-semibold hover:bg-[#A2B29F] hover:text-white transition-colors duration-300"
          >
            Read all our reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
