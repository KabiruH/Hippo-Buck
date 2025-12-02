# Hotel Hippo Buck Website

A modern, full-stack hotel management and booking system for Hotel Hippo Buck, a lakeside hotel located in Homa Bay Town on the shores of Lake Victoria, Kenya.

## About Hotel Hippo Buck

Hotel Hippo Buck offers comfortable accommodations with stunning Lake Victoria views, featuring:
- Prime lakeside location with sunset views
- Fresh tilapia and local cuisine restaurant
- Modern rooms and suites with lake views
- Warm Kenyan hospitality and personalized service
- Easy access to Lake Victoria attractions

## Tech Stack

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Image Optimization:** Next.js Image component
- **Payment Integration:** M-Pesa API
- **Authentication:** (Your auth solution)
- **Database:** (Your database solution)

## Features

### Public Features

#### Contact Page
- Hero section with background image
- Contact information cards (Address, Phone, Email, Hours)
- Contact form with validation
- Map placeholder for location
- "Why Choose Us" highlights section
- Call-to-action for bookings

#### Rooms Page
- Hero section with stunning imagery
- Room gallery with multiple images
- Detailed room information and amenities
- Alternating layout for visual interest
- Hotel policies section
- Real-time availability display

#### Booking System
- User registration and authentication
- Room selection with availability check
- Date picker with blocked dates
- M-Pesa payment integration
- Booking confirmation and receipt
- Email notifications

### Admin Dashboard Features

#### Dashboard Overview
- Real-time statistics snapshot
  - Total bookings (daily/weekly/monthly)
  - Revenue analytics
  - Occupancy rates
  - Pending approvals count
  - Recent activity feed
- Visual charts and graphs
- Quick action buttons

#### User Management
- View all registered users
- Approve/reject pending sign-ups
- Edit user details and permissions
- Deactivate/activate user accounts
- User role assignment (Admin/Manager/Guest)
- Search and filter users
- Export user data

#### Room Management
- Create new rooms
- Edit existing room details
- Upload room images
- Set room pricing and capacity
- Manage room amenities
- Set room availability
- Archive/delete rooms
- Bulk operations

#### Booking Management
- View all bookings (upcoming/past/cancelled)
- Create manual bookings for walk-in guests
- Edit booking details
- Cancel/refund bookings
- Check-in/check-out management
- Booking calendar view
- Search and filter bookings
- Export booking reports
- Payment status tracking

#### Approval System
- Queue for pending user registrations
- Review user information
- Approve/reject with notes
- Bulk approval actions
- Email notifications to users

### M-Pesa Integration

#### Payment Features
- STK Push for seamless payments
- Real-time payment verification
- Payment status tracking
- Automatic booking confirmation on successful payment
- Failed payment retry mechanism
- Payment receipts generation
- Transaction history
- Refund processing

#### Security
- Secure API credentials management
- Payment callback verification
- Transaction logging
- PCI compliance considerations

## User Roles & Permissions

### Admin
- Full system access
- User management (approve, edit, delete)
- Room management (create, edit, delete)
- Booking management (create, edit, cancel)
- Dashboard analytics access
- System settings configuration

### Manager
- User approval
- Room management
- Booking management
- Dashboard access
- Reports generation

### Guest/User
- View available rooms
- Make bookings
- M-Pesa payments
- View booking history
- Update profile
- Cancel bookings (within policy)

## Design Features

- **Responsive:** Mobile-first design that works on all screen sizes
- **Modern UI:** Clean, contemporary design with blue accent color (#2563eb)
- **Optimized Images:** Next.js Image component for performance
- **Accessibility:** Semantic HTML and proper contrast ratios
- **User Experience:** Intuitive navigation and clear calls-to-action
- **Real-time Updates:** Live dashboard statistics
- **Secure:** Protected admin routes and API endpoints

## Getting Started
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your M-Pesa credentials, database URL, etc.

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables
```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# M-Pesa
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
MPESA_ENVIRONMENT=sandbox # or production

# Email (for notifications)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Future Enhancements

- [ ] Google Maps integration
- [ ] Advanced analytics and reporting
- [ ] Customer reviews and ratings
- [ ] Photo gallery management
- [ ] Multi-language support (English/Swahili)
- [ ] Email/SMS marketing campaigns
- [ ] Loyalty program
- [ ] Room service ordering
- [ ] Integration with other payment methods (Card, PayPal)
- [ ] Mobile app (React Native)
- [ ] AI chatbot for customer support
- [ ] Dynamic pricing based on demand
- [ ] Integration with OTAs (Booking.com, Airbnb)

## Deployment

The application can be deployed to:
- Vercel (recommended for Next.js)
- AWS
- Google Cloud Platform
- DigitalOcean
- Heroku

Ensure all environment variables are properly configured in your deployment environment.

## Support

For support, email ubiruafrica@gmail.com or contact the development team.

## License

© 2020 Ubiru Africa. All rights reserved.