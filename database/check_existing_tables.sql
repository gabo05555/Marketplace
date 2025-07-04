-- Check what tables already exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Check if messages table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'messages'
) as messages_exists;

-- Check if storage bucket exists
SELECT name 
FROM storage.buckets 
WHERE name = 'listings';

-- Check existing policies on listings table
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'listings';

-- Check existing policies on messages table (if it exists)
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'messages';
