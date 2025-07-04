# Database Setup Guide

## Setting up the Supabase Database

1. **Go to your Supabase project**
   - Navigate to [supabase.com](https://supabase.com)
   - Open your project dashboard

2. **Run the database setup**
   - Go to the "SQL Editor" tab in your Supabase dashboard
   - Copy and paste the contents of `database/setup.sql`
   - Click "Run" to execute the SQL

3. **Verify the setup**
   - Go to the "Table Editor" tab
   - You should see a new table called "listings"
   - The table should have the following columns:
     - id (UUID, Primary Key)
     - title (TEXT)
     - description (TEXT)
     - price (DECIMAL)
     - category (TEXT)
     - location (TEXT)
     - image_url (TEXT)
     - user_id (UUID)
     - user_email (TEXT)
     - created_at (TIMESTAMP)
     - updated_at (TIMESTAMP)

## Features Enabled

- **Row Level Security (RLS)**: Ensures users can only modify their own listings
- **Public Read Access**: Anyone can view listings (guests and authenticated users)
- **Authenticated Write Access**: Only logged-in users can create, update, or delete listings
- **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed

## Next Steps

1. Make sure your `.env.local` file has the correct Supabase credentials
2. Test the application by creating a new listing
3. Verify that listings appear in the marketplace
4. Test category filtering

## Environment Variables

Make sure your `.env.local` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

- If you get RLS errors, make sure the policies are correctly set up
- If authentication doesn't work, verify your Supabase auth configuration
- Check the browser console for any JavaScript errors
- Verify that your environment variables are correctly set
