import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const VirtualTourPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#FDF8F5] min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow pt-32 pb-20 px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center">
                <div className="container mx-auto text-center max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#4a4a4a] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Virtual Tour
                    </h1>
                    <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto mb-12"></div>

                    <div className="bg-white p-12 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#FDF8F5] rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-[#4a4a4a] mb-4">
                            Step Inside The Barn - Coming Soon
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
                            We are currently crafting an immersive virtual tour experience for you. Soon you will be able to explore every corner of The Barn at Sunset Farm from the comfort of your home.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => navigate('/gallery')}
                                className="px-8 py-3 bg-[#4a4a4a] text-white rounded-lg hover:bg-opacity-90 transition-colors duration-300 font-semibold"
                            >
                                View Photo Gallery
                            </button>
                            <a 
                                href="/#contact"
                                className="px-8 py-3 bg-[#EAD1DC] text-[#4a4a4a] rounded-lg hover:bg-[#d4b5c3] transition-colors duration-300 font-semibold"
                            >
                                Book a Personal Tour
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default VirtualTourPage;
