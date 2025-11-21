import React from 'react';

interface Testimonial {
    id: number;
    name: string;
    date: string;
    text: string;
    location?: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Sarah & James",
        date: "October 2023",
        text: "The Barn at Sunset Farm was the absolute perfect venue for our dream wedding. The views were breathtaking, and the staff went above and beyond to make sure everything was perfect. Our guests are still talking about how beautiful it was!",
        location: "Charleston, WV"
    },
    {
        id: 2,
        name: "Emily & Michael",
        date: "June 2024",
        text: "We couldn't have asked for a better experience. The rustic charm of the barn combined with the elegant amenities made for a magical evening. Highly recommend to any couple looking for a unique and unforgettable venue.",
        location: "Morgantown, WV"
    },
    {
        id: 3,
        name: "Jessica & David",
        date: "September 2023",
        text: "From the moment we toured the venue, we knew this was the one. The bridal suite was stunning, and the outdoor ceremony space was exactly what we envisioned. Thank you for making our day so special!",
        location: "Beckley, WV"
    }
];

const Testimonials: React.FC = () => {
    return (
        <section id="testimonials" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Love Notes
                    </h2>
                    <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
                    <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-600" style={{ fontFamily: "'Raleway', sans-serif" }}>
                        Kind words from our happy couples.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-[#FDF8F5] p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            <div className="mb-4 text-[#D4AF37]">
                                {/* 5 Stars SVG */}
                                <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 italic mb-6 leading-relaxed" style={{ fontFamily: "'Raleway', sans-serif" }}>
                                "{testimonial.text}"
                            </p>
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="font-bold text-[#4a4a4a] text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    {testimonial.name}
                                </h4>
                                <div className="flex justify-between items-center mt-1 text-sm text-gray-500">
                                    <span>{testimonial.date}</span>
                                    {testimonial.location && <span>{testimonial.location}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
