import WifiIcon from './icons/WifiIcon';
import ParkingIcon from './icons/ParkingIcon';
import MountainIcon from './icons/MountainIcon';
import UserIcon from './icons/UserIcon';
import AccessibleIcon from './icons/AccessibleIcon';
import UmbrellaIcon from './icons/UmbrellaIcon';
import HomeIcon from './icons/HomeIcon';

/** Shared by the classic home page and the /experience page. */
export const AMENITIES = [
  {
    icon: MountainIcon,
    title: 'Scenic Views',
    description: 'Breathtaking mountain panoramas and sunset backdrops.',
  },
  {
    icon: UserIcon,
    title: 'Bridal Suite',
    description: 'Elegant space for the bridal party to prepare.',
  },
  {
    icon: WifiIcon,
    title: 'Free WiFi',
    description: 'High-speed internet access for you and your guests.',
  },
  {
    icon: ParkingIcon,
    title: 'Ample Parking',
    description: 'Convenient on-site parking available.',
  },
  {
    icon: AccessibleIcon,
    title: 'Handicap Accessible',
    description: 'Wheelchair accessible facilities for all guests.',
  },
  {
    icon: UmbrellaIcon,
    title: 'Covered Outdoor Space',
    description:
      'Beautiful covered areas for outdoor ceremonies and cocktail hours.',
  },
  {
    icon: HomeIcon,
    title: 'On-Site Accommodations',
    description: 'Cozy cottage available for overnight stays.',
  },
] as const;
