-- Safe schema update - only creates what doesn't exist
-- Run this AFTER running the check script above

-- Create messages table (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
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
    CREATE POLICY "Sellers can view messages for their listings" ON messages
      FOR SELECT USING (auth.uid() = seller_id);

    CREATE POLICY "Buyers can view their own messages" ON messages
      FOR SELECT USING (auth.uid() = buyer_id);

    CREATE POLICY "Authenticated users can send messages" ON messages
      FOR INSERT WITH CHECK (auth.uid() = buyer_id);

    CREATE POLICY "Sellers can update read status" ON messages
      FOR UPDATE USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Create storage bucket (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM storage.buckets WHERE name = 'listings') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);
  END IF;
END $$;

-- Create storage policies (only if they don't exist)
DO $$ 
BEGIN
  -- Check and create storage policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can view listing images') THEN
    CREATE POLICY "Anyone can view listing images" ON storage.objects
      FOR SELECT USING (bucket_id = 'listings');
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload listing images') THEN
    CREATE POLICY "Users can upload listing images" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update their own listing images') THEN
    CREATE POLICY "Users can update their own listing images" ON storage.objects
      FOR UPDATE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their own listing images') THEN
    CREATE POLICY "Users can delete their own listing images" ON storage.objects
      FOR DELETE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
