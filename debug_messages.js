// Debug script to test message insertion
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testMessageInsertion() {
  console.log('Testing message insertion...')
  
  // First, get a sample listing to test with
  const { data: listings, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .limit(1)
    .single()
  
  if (listingError) {
    console.error('Error fetching listing:', listingError)
    return
  }
  
  console.log('Sample listing:', listings)
  
  // Test message insertion
  const testMessage = {
    listing_id: listings.id,
    seller_id: listings.user_id,
    seller_email: listings.user_email || listings.email,
    buyer_id: listings.user_id, // Using the same user for testing
    buyer_email: 'test@example.com',
    buyer_name: 'Test Buyer',
    message: 'This is a test message',
    listing_title: listings.title,
    listing_price: listings.price
  }
  
  console.log('Attempting to insert message:', testMessage)
  
  const { data, error } = await supabase
    .from('messages')
    .insert(testMessage)
    .select()
  
  if (error) {
    console.error('Error inserting message:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
  } else {
    console.log('Message inserted successfully:', data)
  }
  
  // Test if the messages table exists
  const { data: tableData, error: tableError } = await supabase
    .from('messages')
    .select('*')
    .limit(1)
  
  if (tableError) {
    console.error('Error checking messages table:', tableError)
  } else {
    console.log('Messages table exists. Sample data:', tableData)
  }
}

testMessageInsertion().catch(console.error)
