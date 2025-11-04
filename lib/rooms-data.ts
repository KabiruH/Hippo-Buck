export const roomsData = [
  {
    id: 'standard',
    name: 'Standard Room',
    description: 'Comfortable accommodation with all essential amenities for a pleasant stay',
    images: ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg', '/5.jpg'],
    pricing: {
      eastAfrican: {
        single: 3000,
        double: 3500,
      },
      nonEastAfrican: {
        single: 40,
        double: 45,
      },
    },
    amenities: [
      'Free High-Speed WiFi',
      'Flat-Screen Smart TV',
      'Air Conditioning',
      'Coffee/Tea Facilities',
      'En-suite Bathroom',
      'Complimentary Toiletries',
      'Work Desk',
      'Daily Housekeeping',
      'Bed & Breakfast Included',
    ],
    features: {
      bedTypes: ['Single Bed', 'Double Bed'],
      maxGuests: 2,
      roomSize: '20 sqm',
    },
  },
  {
    id: 'superior-pool',
    name: 'Superior Room (Pool View)',
    description: 'Enhanced comfort with stunning views of our swimming pool',
    images: ['/2.jpg', '/3.jpg', '/4.jpg', '/5.jpg', '/6.jpg'],
    pricing: {
      eastAfrican: {
        single: 5000,
        double: 5500,
      },
      nonEastAfrican: {
        single: 55,
        double: 65,
      },
    },
    amenities: [
      'Free High-Speed WiFi',
      'Flat-Screen Smart TV',
      'Air Conditioning',
      'Premium Coffee/Tea Facilities',
      'Luxury En-suite Bathroom',
      'Premium Toiletries',
      'Work Desk & Seating Area',
      'Mini Refrigerator',
      'Balcony/Terrace',
      'Pool View',
      'Priority Room Service',
      'Bed & Breakfast Included',
    ],
    features: {
      bedTypes: ['Single Bed', 'Double Bed'],
      maxGuests: 2,
      roomSize: '28 sqm',
      view: 'Pool View',
    },
  },
  {
    id: 'superior-garden',
    name: 'Superior Room (Garden View)',
    description: 'Premium luxury with serene views of our landscaped gardens',
    images: ['/3.jpg', '/4.jpg', '/5.jpg', '/6.jpg', '/1.jpg'],
    pricing: {
      eastAfrican: {
        single: 6500,
        double: 7500,
      },
      nonEastAfrican: {
        single: 75,
        double: 110,
      },
    },
    amenities: [
      'Free High-Speed WiFi',
      'Premium Smart TV with Channels',
      'Air Conditioning',
      'Premium Coffee/Tea Facilities',
      'Luxury Bathroom with Bathtub',
      'Premium Toiletries & Bathrobes',
      'Executive Work Desk',
      'Mini Refrigerator',
      'In-Room Safe',
      'Private Balcony',
      'Garden View',
      'Turndown Service',
      'Complimentary Welcome Drink',
      'Bed & Breakfast Included',
    ],
    features: {
      bedTypes: ['Single Bed', 'Double Bed'],
      maxGuests: 2,
      roomSize: '32 sqm',
      view: 'Garden View',
    },
  },
];

export const hotelPolicies = {
  checkIn: '14:00',
  checkOut: '10:00',
  breakfast: 'Included in all rates',
  payment: 'Room charges settled at check-in. We accept Cash, Cards & M-Pesa',
  taxes: 'All rates are inclusive of relevant taxes',
};