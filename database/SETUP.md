# Database Setup Guide

## Setting up Supabase Database

1. **Go to your Supabase Dashboard**
   - Visit [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Run the Database Schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Run the script to create the tables and policies

3. **Configure Storage**
   - The schema will automatically create a storage bucket called `listings`
   - This bucket is configured to be public for viewing images
   - Users can only upload/edit their own images

4. **Environment Variables**
   - Make sure your `.env.local` file has the correct Supabase configuration:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Database Structure

### listings table
- `id` - Primary key (auto-generated)
- `title` - Listing title (required)
- `description` - Listing description (required)
- `price` - Price in dollars (required)
- `email` - Contact email (required)
- `category` - Product category (required)
- `location` - Location string (required)
- `image_url` - URL to uploaded image (optional)
- `user_id` - Reference to authenticated user (auto-filled)
- `created_at` - Timestamp when listing was created
- `updated_at` - Timestamp when listing was last updated

### Security Policies
- **Read**: Anyone can view all listings
- **Create**: Authenticated users can create listings
- **Update**: Users can only update their own listings
- **Delete**: Users can only delete their own listings

### Storage Bucket
- **Name**: `listings`
- **Public**: Yes (for viewing images)
- **Upload**: Authenticated users only
- **Edit/Delete**: Users can only modify their own images

## Testing the Setup

1. **Create a test listing**
   - Sign in to your application
   - Go to "Add Listing" page
   - Fill out the form with test data
   - Upload an image
   - Submit the form

2. **Verify in Supabase**
   - Check the `listings` table in your Supabase dashboard
   - Verify the data was inserted correctly
   - Check the storage bucket for the uploaded image

3. **Test filtering**
   - Create listings in different categories
   - Test the category filter on the main page
   - Verify listings display correctly

## Troubleshooting

### Common Issues

1. **Storage bucket not found**
   - Make sure the storage bucket was created successfully
   - Check the bucket name matches exactly (`listings`)

2. **Upload permissions denied**
   - Verify the user is authenticated
   - Check that RLS policies are set up correctly

3. **Images not displaying**
   - Ensure the storage bucket is public
   - Check the image URL format is correct

4. **Database connection errors**
   - Verify your environment variables are correct
   - Check that the Supabase project is active

### SQL Queries for Testing

```sql
-- Check if listings table exists
SELECT * FROM listings LIMIT 5;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'listings';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'listings';
```
