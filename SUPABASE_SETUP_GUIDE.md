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

## Step 5: Create an Update Trigger (Optional but Recommended)
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"**
3. Copy and paste this SQL code:

```sql
-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for the listings table
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
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
- ✅ Dedicated "My Listings" page for listing management

## Features Available After Setup:
- **Browse Listings**: View all listings without signing in
- **Create Listings**: Add new listings with photos, title, description, price, and category
- **Delete Listings**: Remove your own listings with confirmation
- **Manage Listings**: Dedicated page to view and manage your listings
- **Secure Access**: RLS ensures users can only modify their own data

Once you complete these steps, let me know and I'll fix the add-listing page to work properly with better UI/UX!
