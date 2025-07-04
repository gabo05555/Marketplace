// Check the actual structure of the listings table
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTableStructure() {
  console.log('Checking table structure...')
  
  // First check if messages table exists
  const { data: messagesCheck, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .limit(1)
  
  if (messagesError) {
    console.log('Messages table does not exist:', messagesError)
  } else {
    console.log('Messages table exists')
  }
  
  // Get a listing to check its ID type
  const { data: listings, error: listingError } = await supabase
    .from('listings')
    .select('id')
    .limit(1)
  
  if (listingError) {
    console.error('Error fetching listing:', listingError)
  } else {
    console.log('Listing ID type:', typeof listings[0].id, 'Value:', listings[0].id)
  }
}

checkTableStructure().catch(console.error)
