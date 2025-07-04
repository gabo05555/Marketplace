# Supabase Database Setup Instructions

## Step 1: Access Your Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your project to open the dashboard

## Step 2: Create the Listings Table
1. In the left sidebar, click on **"Table Editor"**
2. Click the **"New Table"** button
3. Fill in the table details:
   - **Name**: `listings`
   - **Description**: `User marketplace listings`
   - **Enable Row Level Security (RLS)**: ✅ Check this box

## Step 3: Add Table Columns
Click **"Add Column"** for each of these columns:

### Column 1: id (Primary Key)
- **Name**: `id`
- **Type**: `uuid`
- **Default Value**: `gen_random_uuid()`
- **Primary Key**: ✅ Check this
- **Nullable**: ❌ Uncheck this

### Column 2: title
- **Name**: `title`
- **Type**: `text`
- **Nullable**: ❌ Uncheck this

### Column 3: description
- **Name**: `description`
- **Type**: `text`
- **Nullable**: ❌ Uncheck this

### Column 4: price
- **Name**: `price`
- **Type**: `numeric`
- **Default Value**: `0`
- **Nullable**: ❌ Uncheck this

### Column 5: category
- **Name**: `category`
- **Type**: `text`
- **Nullable**: ❌ Uncheck this

### Column 6: location
- **Name**: `location`
- **Type**: `text`
- **Nullable**: ❌ Uncheck this

### Column 7: image_url
- **Name**: `image_url`
- **Type**: `text`
- **Nullable**: ✅ Check this (images are optional)

### Column 8: user_id
- **Name**: `user_id`
- **Type**: `uuid`
- **Nullable**: ❌ Uncheck this

### Column 9: user_email
- **Name**: `user_email`
- **Type**: `text`
- **Nullable**: ❌ Uncheck this

### Column 10: created_at
- **Name**: `created_at`
- **Type**: `timestamptz`
- **Default Value**: `now()`
- **Nullable**: ❌ Uncheck this

### Column 11: updated_at
- **Name**: `updated_at`
- **Type**: `timestamptz`
- **Default Value**: `now()`
- **Nullable**: ❌ Uncheck this

4. Click **"Save"** to create the table

## Step 4: Set Up Row Level Security (RLS) Policies
1. In the left sidebar, click on **"Authentication"** → **"Policies"**
2. Find your `listings` table and click **"New Policy"**

### Policy 1: Allow Public Read Access
- **Policy Name**: `Allow public read access`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `public`
- **USING Expression**: `true`
- Click **"Review"** then **"Save Policy"**

### Policy 2: Allow Authenticated Users to Insert
- Click **"New Policy"** again
- **Policy Name**: `Allow authenticated users to insert`
- **Allowed Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **WITH CHECK Expression**: `auth.uid() = user_id`
- Click **"Review"** then **"Save Policy"**

### Policy 3: Allow Users to Update Own Listings
- Click **"New Policy"** again
- **Policy Name**: `Allow users to update own listings`
- **Allowed Operation**: `UPDATE`
- **Target Roles**: `authenticated`
- **USING Expression**: `auth.uid() = user_id`
- **WITH CHECK Expression**: `auth.uid() = user_id`
- Click **"Review"** then **"Save Policy"**

### Policy 4: Allow Users to Delete Own Listings
- Click **"New Policy"** again
- **Policy Name**: `Allow users to delete own listings`
- **Allowed Operation**: `DELETE`
- **Target Roles**: `authenticated`
- **USING Expression**: `auth.uid() = user_id`
- Click **"Review"** then **"Save Policy"**

## Step 5: Create the Messages Table
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"**
3. Copy and paste this SQL code:

```sql
-- Create messages table for seller-buyer communication
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_seller_id ON messages(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_buyer_id ON messages(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Sellers can view messages for their listings" ON messages
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Authenticated users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update read status" ON messages
  FOR UPDATE USING (auth.uid() = seller_id);
```

4. Click **"Run"** to execute the SQL

## Step 6: Verify Your Setup
1. Go back to **"Table Editor"**
2. Click on your `listings` table
3. Verify all columns are present and properly configured
4. The table should show "RLS enabled" status

## Step 7: Test the Setup
1. In the **"Table Editor"**, you can try inserting a test row manually
2. Use these sample values:
   - **title**: `Test Item`
   - **description**: `This is a test listing`
   - **price**: `99.99`
   - **category**: `Electronics`
   - **location**: `Test City, ST`
   - **user_id**: `00000000-0000-0000-0000-000000000000` (placeholder)
   - **user_email**: `test@example.com`

## Step 8: Check Your Environment Variables
Make sure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase dashboard under **"Settings"** → **"API"**.

---

## What This Setup Achieves:
- ✅ Users can browse all listings without authentication
- ✅ Only authenticated users can create listings
- ✅ Users can only edit/delete their own listings
- ✅ Automatic timestamp management
- ✅ Secure data access with RLS policies
- ✅ Support for images stored as base64 data
- ✅ Delete functionality with confirmation dialogs
- ✅ Secure messaging system between buyers and sellers
- ✅ Message history and seller notifications
- ✅ RLS protection for message privacy

## Features Available After Setup:
- **Browse Listings**: View all listings without signing in
- **Create Listings**: Add new listings with photos, title, description, price, and category
- **Delete Listings**: Remove your own listings with confirmation
- **Manage Listings**: Dedicated page to view and manage your listings
- **Contact Sellers**: Send messages to sellers directly from listing pages
- **Message Management**: Sellers can view messages for their listings  
- **Privacy Protection**: Messages are secured with RLS policies

Once you complete these steps, let me know and I'll fix the add-listing page to work properly with better UI/UX!
