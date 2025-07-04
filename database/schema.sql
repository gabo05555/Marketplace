-- Create listings table
CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can view listings
CREATE POLICY "Anyone can view listings" ON listings
  FOR SELECT USING (true);

-- Users can insert their own listings
CREATE POLICY "Users can insert their own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);

-- Create storage policies
CREATE POLICY "Anyone can view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings');

CREATE POLICY "Users can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing images" ON storage.objects
  FOR DELETE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create messages table for seller-buyer communication
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_email VARCHAR(255) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  listing_title VARCHAR(255) NOT NULL,
  listing_price DECIMAL(10, 2) NOT NULL,
  read_by_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for messages table
CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_messages_seller_id ON messages(seller_id);
CREATE INDEX idx_messages_buyer_id ON messages(buyer_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
-- Sellers can view messages for their listings
CREATE POLICY "Sellers can view messages for their listings" ON messages
  FOR SELECT USING (auth.uid() = seller_id);

-- Buyers can view their own messages
CREATE POLICY "Buyers can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = buyer_id);

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update read status
CREATE POLICY "Sellers can update read status" ON messages
  FOR UPDATE USING (auth.uid() = seller_id);
