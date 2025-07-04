// Test script to verify messages table after creation
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testMessagesTable() {
  console.log('Testing messages table...')
  
  // Check if messages table exists
  const { data: messagesCheck, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .limit(1)
  
  if (messagesError) {
    console.error('Messages table check failed:', messagesError)
    console.log('\n❌ Messages table does not exist or has issues.')
    console.log('Please run the SQL from database/create_messages_table.sql in your Supabase dashboard.')
    return
  } else {
    console.log('✅ Messages table exists and is accessible')
  }
  
  // Try to get a sample listing
  const { data: listings, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .limit(1)
    .single()
  
  if (listingError) {
    console.error('Error fetching sample listing:', listingError)
    return
  }
  
  console.log('Sample listing found:', {
    id: listings.id,
    title: listings.title,
    user_id: listings.user_id,
    user_email: listings.user_email
  })
  
  // Try to insert a test message
  const testMessage = {
    listing_id: listings.id,
    seller_id: listings.user_id,
    seller_email: listings.user_email || listings.email,
    buyer_id: listings.user_id, // Using same user for test
    buyer_email: 'test@example.com',
    buyer_name: 'Test User',
    message: 'This is a test message to verify the table works',
    listing_title: listings.title,
    listing_price: listings.price
  }
  
  console.log('Attempting to insert test message...')
  const { data: messageData, error: messageError } = await supabase
    .from('messages')
    .insert(testMessage)
    .select()
  
  if (messageError) {
    console.error('❌ Error inserting test message:', messageError)
    console.log('Error details:', {
      code: messageError.code,
      message: messageError.message,
      details: messageError.details,
      hint: messageError.hint
    })
  } else {
    console.log('✅ Test message inserted successfully!')
    console.log('Message data:', messageData)
    
    // Clean up test message
    await supabase
      .from('messages')
      .delete()
      .eq('id', messageData[0].id)
    
    console.log('Test message cleaned up.')
  }
}

testMessagesTable().catch(console.error)
