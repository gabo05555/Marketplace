# 🛍️ Dynamic Marketplace

A modern, dynamic marketplace web application built with Next.js and Supabase. Users can create, browse, and manage listings with a Facebook Marketplace-inspired interface.

## ✨ Features

- **🔐 Authentication**: Secure user authentication with Supabase Auth (Magic Link)
- **🛍️ Dynamic Marketplace**: Users can create, view, and manage their own listings
- **📄 Listing Detail Pages**: Dedicated pages for each listing with full information
- **💬 Message Seller System**: Buyers can message sellers with email notifications
- **📧 Messages Management**: Sellers can view and manage messages from buyers
- **🔍 Advanced Search**: Fuzzy search with filters, pagination, and suggestions
- **🏷️ Category Filtering**: Browse listings by category (Electronics, Vehicles, etc.)
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **👥 Guest Browsing**: Users can browse listings without signing in
- **🔒 Secure**: Row Level Security (RLS) ensures users can only modify their own listings
- **📸 Image Upload**: Users can add photos to their listings
- **🎨 Modern UI**: Clean, Facebook Marketplace-inspired design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd marketplace
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Set up the database**
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `database/setup.sql`
- Click "Run" to create the listings table

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**
Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

The application uses these main tables:

### Listings Table
- `id` (BIGSERIAL) - Primary key
- `title` (VARCHAR) - Listing title
- `description` (TEXT) - Listing description
- `price` (DECIMAL) - Item price
- `email` (VARCHAR) - Seller email
- `category` (VARCHAR) - Category name
- `location` (VARCHAR) - Location string
- `image_url` (TEXT) - Image URL or base64 data
- `user_id` (UUID) - Owner's user ID
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Messages Table
- `id` (BIGSERIAL) - Primary key
- `listing_id` (BIGINT) - Reference to listing
- `seller_id` (UUID) - Seller's user ID
- `seller_email` (VARCHAR) - Seller's email
- `buyer_id` (UUID) - Buyer's user ID
- `buyer_email` (VARCHAR) - Buyer's email
- `buyer_name` (VARCHAR) - Buyer's name
- `message` (TEXT) - Message content
- `listing_title` (VARCHAR) - Listing title for reference
- `listing_price` (DECIMAL) - Listing price for reference
- `read_by_seller` (BOOLEAN) - Read status
- `created_at` (TIMESTAMP) - Creation timestamp

## 🎯 Usage

### For Guests
- Browse all listings
- Filter by category
- View listing details
- Sign up prompt for creating listings

### For Authenticated Users
- All guest features
- Create new listings
- Upload photos
- Manage their own listings
- Edit/delete their listings
- Send messages to sellers
- View and manage received messages
- Get email notifications for new messages

### Creating a Listing
1. Click "Sign In" and authenticate with your email
2. Click "Choose listing type" in the sidebar
3. Fill out the listing form:
   - Title and description
   - Price and category
   - Location
   - Upload a photo (optional)
4. Click "Create Listing"

### Messaging System
1. **As a Buyer**: Click on any listing to view details, then click "Message Seller"
2. **As a Seller**: Check "Your messages" in the sidebar to view and respond to inquiries
3. **Email Notifications**: Sellers receive email notifications when buyers send messages

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel (recommended)

## 🔧 Development

### Project Structure
```
marketplace/
├── src/
│   ├── app/
│   │   ├── add-listing/
│   │   │   └── page.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── lib/
│       └── supabaseClient.js
├── database/
│   ├── setup.sql
│   └── README.md
├── public/
└── ...config files
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `.next` folder to your hosting provider
3. Set environment variables on your hosting platform

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own listings
- Authentication required for creating/editing listings
- Input validation and sanitization
- CSRF protection via Supabase Auth

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [database setup guide](database/README.md)
2. Verify your environment variables
3. Check the browser console for errors
4. Review Supabase logs for backend issues

## 🎉 Acknowledgments

- Inspired by Facebook Marketplace
- Built with Next.js and Supabase
- Styled with Tailwind CSS
