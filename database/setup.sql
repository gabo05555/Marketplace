-- Create listings table
CREATE TABLE public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    user_id UUID NOT NULL,
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow all users to read all listings
CREATE POLICY "Allow public read access" ON public.listings
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own listings
CREATE POLICY "Allow authenticated users to insert" ON public.listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own listings
CREATE POLICY "Allow users to update own listings" ON public.listings
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own listings
CREATE POLICY "Allow users to delete own listings" ON public.listings
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
