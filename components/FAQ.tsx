import React, { useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

const faqs = [
    {
        question: "What is the venue capacity?",
        answer: "We can comfortably accommodate up to 200 guests for both the ceremony and reception, ensuring an intimate and enjoyable experience for everyone."
    },
    {
        question: "Can we bring our own vendors?",
        answer: "We have a curated list of preferred vendors we love and trust, but you are welcome to bring your own licensed and insured professionals for catering, photography, and florals."
    },
    {
        question: "Is there parking on-site?",
        answer: "Yes, we have ample parking available for all your guests."
    },
    {
        question: "Do you require event insurance?",
        answer: "Yes, we require a standard event insurance policy for the day of your wedding. This protects both you and the venue and is a standard practice in the industry."
    }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 md:py-32 bg-[#FDF8F5]">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">Frequently Asked Questions</h2>
                    <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
                    <p className="mt-6 text-lg text-gray-600">
                        Everything you need to know about hosting your special day at The Barn at Sunset Farm.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50"
                            >
                                <span className="text-lg font-semibold text-[#4a4a4a]">{faq.question}</span>
                                <ChevronDownIcon
                                    className={`w-6 h-6 text-[#A2B29F] transition-transform duration-300 ${openIndex === index ? 'transform rotate-180' : ''}`}
                                />
                            </button>
                            <div
                                className={`px-6 text-gray-600 transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-48 py-5 border-t border-gray-100 opacity-100' : 'max-h-0 py-0 opacity-0'
                                    }`}
                            >
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-lg text-gray-600 mb-6">Still have questions?</p>
                    <a
                        href="#contact"
                        className="inline-block bg-[#4a4a4a] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-colors duration-300 shadow-lg"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
