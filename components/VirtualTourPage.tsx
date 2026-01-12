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

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center w-full max-w-sm">
                        <div className="w-full aspect-[9/16] bg-black rounded-lg overflow-hidden relative shadow-inner">
                            <video
                                className="w-full h-full object-cover"
                                controls
                                poster="/photos/gallery/Barn 2.webp"
                            >
                                <source src="/videos/TheBarnAtSunsetFarm_Walkthrough_Winter.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="mt-6 text-center">
                            <h2 className="text-2xl md:text-3xl font-semibold text-[#4a4a4a] mb-2">
                                Experience The Barn
                            </h2>
                            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-6 leading-relaxed">
                                Take a virtual walk through our winter wonderland. Imagine your perfect day in this serene setting.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
