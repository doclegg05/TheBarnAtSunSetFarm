import React from 'react';
import WifiIcon from './icons/WifiIcon';
import ParkingIcon from './icons/ParkingIcon';
import SnowflakeIcon from './icons/SnowflakeIcon';
import MusicIcon from './icons/MusicIcon';
import MountainIcon from './icons/MountainIcon';
import UserIcon from './icons/UserIcon';
import AccessibleIcon from './icons/AccessibleIcon';
import UmbrellaIcon from './icons/UmbrellaIcon';
import HomeIcon from './icons/HomeIcon';

const amenities = [
    {
        icon: MountainIcon,
        title: 'Scenic Views',
        description: 'Breathtaking mountain panoramas and sunset backdrops.'
    },
    {
        icon: SnowflakeIcon,
        title: 'Climate Controlled',
        description: 'Fully heated and air-conditioned barn for year-round comfort.'
    },
    {
        icon: UserIcon,
        title: 'Bridal Suite',
        description: 'Private, elegant space for the bridal party to prepare.'
    },
    {
        icon: MusicIcon,
        title: 'Sound System',
        description: 'State-of-the-art audio equipment for your ceremony and reception.'
    },
    {
        icon: WifiIcon,
        title: 'Free WiFi',
        description: 'High-speed internet access for you and your guests.'
    },
    {
        icon: ParkingIcon,
        title: 'Ample Parking',
        description: 'Convenient on-site parking with attendants available.'
    },
    {
        icon: AccessibleIcon,
        title: 'Handicap Accessible',
        description: 'Wheelchair accessible facilities for all guests.'
    },
    {
        icon: UmbrellaIcon,
        title: 'Covered Outdoor Space',
        description: 'Beautiful covered areas for outdoor ceremonies and cocktail hours.'
    },
    {
        icon: HomeIcon,
        title: 'On-Site Accommodations',
        description: 'Cozy cottages available for overnight stays.'
    }
];

const Amenities: React.FC = () => {
    return (
        <div className="mt-20">
            <h3 className="text-3xl font-semibold text-center text-[#4a4a4a] mb-12">Venue Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {amenities.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
                        <div className="p-4 bg-[#FDF8F5] rounded-full mb-4">
                            <item.icon className="w-8 h-8 text-[#A2B29F]" />
                        </div>
                        <h4 className="text-xl font-bold text-[#4a4a4a] mb-2">{item.title}</h4>
                        <p className="text-gray-600">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Amenities;
