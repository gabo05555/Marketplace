-- Create messages table with correct UUID references
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_seller_id ON messages(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_buyer_id ON messages(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Sellers can view messages for their listings" ON messages
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Authenticated users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update read status" ON messages
  FOR UPDATE USING (auth.uid() = seller_id);
