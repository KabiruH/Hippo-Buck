export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: 'Hotel Hippo Buck',
    description:
      'Premier lakeside hotel in Homa Bay Town offering breathtaking Lake Victoria sunsets, fresh Tilapia cuisine, comfortable rooms and warm hospitality. Perfect for peaceful getaways, romantic escapes, and family vacations.',
    image: 'https://hotelhippobuck.com/og-image.jpg',
    '@id': 'https://hotelhippobuck.com',
    url: 'https://hotelhippobuck.com',
    telephone: '+254723262000',
    email: 'info@hippobuck.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Homa Bay Town',
      addressLocality: 'Homa Bay',
      addressRegion: 'Homa Bay County',
      addressCountry: 'KE',
    },

    
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -0.5273,
      longitude: 34.457,
    },
    priceRange: 'KES 3,000 - KES 7,500 (East Africans) | USD 40 - USD 110 (Non East Africans)',
    starRating: {
      '@type': 'Rating',
      ratingValue: '4',
    },
    checkinTime: '14:00',
    checkoutTime: '10:00',
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Free WiFi',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Restaurant',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Room Service',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Lake View',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Pool View Rooms',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Garden View Rooms',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Free Parking',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Bed & Breakfast Included',
        value: true,
      },
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Hotel',
          name: 'Standard Room - Single Bed & Breakfast',
        },
        priceSpecification: [
          {
            '@type': 'PriceSpecification',
            price: '3000',
            priceCurrency: 'KES',
            eligibleCustomerType: 'East African Residents',
          },
          {
            '@type': 'PriceSpecification',
            price: '40',
            priceCurrency: 'USD',
            eligibleCustomerType: 'Non East African Residents',
          },
        ],
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Hotel',
          name: 'Standard Room - Double Bed & Breakfast',
        },
        priceSpecification: [
          {
            '@type': 'PriceSpecification',
            price: '3500',
            priceCurrency: 'KES',
            eligibleCustomerType: 'East African Residents',
          },
          {
            '@type': 'PriceSpecification',
            price: '45',
            priceCurrency: 'USD',
            eligibleCustomerType: 'Non East African Residents',
          },
        ],
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Hotel',
          name: 'Superior Room (Pool View) - Single Bed & Breakfast',
        },
        priceSpecification: [
          {
            '@type': 'PriceSpecification',
            price: '5000',
            priceCurrency: 'KES',
            eligibleCustomerType: 'East African Residents',
          },
          {
            '@type': 'PriceSpecification',
            price: '55',
            priceCurrency: 'USD',
            eligibleCustomerType: 'Non East African Residents',
          },
        ],
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Hotel',
          name: 'Superior Room (Pool View) - Double Bed & Breakfast',
        },
        priceSpecification: [
          {
            '@type': 'PriceSpecification',
            price: '5500',
            priceCurrency: 'KES',
            eligibleCustomerType: 'East African Residents',
          },
          {
            '@type': 'PriceSpecification',
            price: '65',
            priceCurrency: 'USD',
            eligibleCustomerType: 'Non East African Residents',
          },
        ],
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Hotel',
          name: 'Superior Room (Garden View) - Single Bed & Breakfast',
        },
        priceSpecification: [
          {
            '@type': 'PriceSpecification',
            price: '6500',
            priceCurrency: 'KES',
            eligibleCustomerType: 'East African Residents',
          },
          {
            '@type': 'PriceSpecification',
            price: '75',
            priceCurrency: 'USD',
            eligibleCustomerType: 'Non East African Residents',
          },
        ],
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Hotel',
          name: 'Superior Room (Garden View) - Double Bed & Breakfast',
        },
        priceSpecification: [
          {
            '@type': 'PriceSpecification',
            price: '7500',
            priceCurrency: 'KES',
            eligibleCustomerType: 'East African Residents',
          },
          {
            '@type': 'PriceSpecification',
            price: '110',
            priceCurrency: 'USD',
            eligibleCustomerType: 'Non East African Residents',
          },
        ],
      },
    ],
    servesCuisine: 'Fresh Tilapia, Local Kenyan Cuisine',
    acceptsReservations: true,
    currenciesAccepted: 'KES, USD',
    paymentAccepted: 'Cash, Credit Card, M-Pesa',
    openingHours: 'Mo-Su 00:00-24:00',
    hasMap: 'https://www.google.com/maps/place/Homa+Bay,+Kenya',
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://hotelhippobuck.com/booking',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'LodgingReservation',
        name: 'Hotel Reservation',
      },
    },
    knowsAbout: [
      'Bed & Breakfast included in all rates',
      'Check-out time: 10:00 AM',
      'Room charges settled at check-in',
      'All rates inclusive of relevant taxes',
      'East African and Non East African pricing available',
    ],
    sameAs: [
      'https://facebook.com/hippobuck',
      'https://instagram.com/hippobuck',
      'https://twitter.com/hippobuck',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}