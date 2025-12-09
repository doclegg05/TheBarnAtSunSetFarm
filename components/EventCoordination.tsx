import React from 'react';
import CheckIcon from './icons/CheckIcon';

const EventCoordination: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Logo Section */}
                    <div className="w-full md:w-1/3 flex justify-center">
                        <img
                            src="/photos/sunset-willow-logo.png"
                            alt="Sunset Willow Event Planning, LLC Logo"
                            className="w-full max-w-sm object-contain hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    </div>

                    {/* Intro Section */}
                    <div className="w-full md:w-2/3 text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#4a4a4a] mb-4">
                            Sunset Willow Event Planning, LLC
                        </h2>
                        <h3 className="text-xl text-[#D4AF37] font-semibold mb-6">
                            Wedding & Event Coordination Services
                        </h3>
                        <p className="text-lg text-gray-600 mb-6 italic">
                            "Where your vision meets seamless execution."
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Sunset Willow Event Planning, LLC partners with The Barn at Sunset Farms to provide couples with a stress-free and beautifully organized wedding experience. Whether you need full-service coordination from engagement to exit, or simply a steady hand on the wedding day itself, Sunset Willow ensures every moment flows effortlessly.
                        </p>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mt-16 grid md:grid-cols-2 gap-12">
                    <div className="bg-[#FDF8F5] p-8 rounded-xl shadow-md border border-gray-100">
                        <h4 className="text-2xl font-bold text-[#4a4a4a] mb-4">Full Service Wedding Coordination</h4>
                        <p className="text-gray-600 mb-4">A comprehensive planning partnership from start to finish, including:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Timeline creation and management</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Vendor sourcing and communication</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Rehearsal direction</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Ceremony and reception flow coordination</span></li>
                        </ul>
                    </div>

                    <div className="bg-[#FDF8F5] p-8 rounded-xl shadow-md border border-gray-100">
                        <h4 className="text-2xl font-bold text-[#4a4a4a] mb-4">Day Of Event Coordination</h4>
                        <p className="text-gray-600 mb-4">Perfect for couples who have planned their details but want professional execution:</p>
                        <ul className="space-y-3">
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Wedding day timeline oversight</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Vendor arrival and setup monitoring</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Ceremony cueing</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Problem solving and guest assistance</span></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 grid md:grid-cols-2 gap-12">
                    <div>
                        <h4 className="text-xl font-bold text-[#4a4a4a] mb-4">Venue Partnership Benefits</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Knowledge of venue layout, logistics, and policies</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Streamlined communication between the venue and your vendors</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Support with parking flow, seating arrangements, and accessibility needs</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-[#4a4a4a] mb-4">Additional Support Services</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Vendor recommendations & coordination</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Setup and teardown assistance</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Parking and guest flow management</span></li>
                            <li className="flex items-start"><CheckIcon className="w-5 h-5 text-[#A2B29F] mt-1 mr-3 flex-shrink-0" /><span className="text-gray-600">Décor staging</span></li>
                        </ul>
                    </div>
                </div>

                {/* Why Choose Us & Contact */}
                <div className="mt-20 bg-[#4a4a4a] text-white rounded-2xl p-8 md:p-12 shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold mb-6">Why Couples Choose Sunset Willow</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start"><span className="text-[#D4AF37] mr-3">•</span>Organized, calm, and professional event leadership</li>
                                <li className="flex items-start"><span className="text-[#D4AF37] mr-3">•</span>Clear communication from planning to final send-off</li>
                                <li className="flex items-start"><span className="text-[#D4AF37] mr-3">•</span>An experienced and caring coordinator dedicated to making your day memorable</li>
                                <li className="flex items-start"><span className="text-[#D4AF37] mr-3">•</span>Flexibility to tailor services to your exact needs</li>
                            </ul>
                        </div>
                        <div className="bg-white text-gray-800 p-8 rounded-xl shadow-lg">
                            <h4 className="text-2xl font-bold text-[#4a4a4a] mb-4">Contact Information</h4>
                            <div className="space-y-2">
                                <p className="text-xl font-semibold">Heather Tharp</p>
                                <p className="text-[#A2B29F] font-medium">Event Coordinator</p>
                                <p className="mt-4"><span className="font-semibold">Phone:</span> 304 619 6805</p>
                                <p><span className="font-semibold">Email:</span> <a href="mailto:sunsetwillowevents@gmail.com" className="hover:text-[#A2B29F] transition-colors">sunsetwillowevents@gmail.com</a></p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="italic text-center text-sm text-gray-500">
                                    Ask about availability and package options!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EventCoordination;
