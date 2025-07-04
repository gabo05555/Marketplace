import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      sellerEmail, 
      sellerName, 
      buyerEmail, 
      buyerName, 
      message, 
      listingTitle, 
      listingPrice,
      listingId 
    } = await req.json()

    // Validate required fields
    if (!sellerEmail || !buyerEmail || !message || !listingTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Email configuration (you'll need to set these as environment variables)
    const smtpConfig = {
      hostname: Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USERNAME'),
      password: Deno.env.get('SMTP_PASSWORD'),
    }

    // Create SMTP client
    const client = new SmtpClient()
    await client.connectTLS(smtpConfig)

    // Email content
    const subject = `New message about your listing: ${listingTitle}`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📬 New Message from Marketplace</h1>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">Someone is interested in your listing!</h2>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3b82f6; margin: 0 0 10px 0;">Listing Details</h3>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${listingTitle}</p>
            <p style="margin: 5px 0;"><strong>Price:</strong> $${listingPrice}</p>
            <p style="margin: 5px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/listing/${listingId}" 
                 style="color: #3b82f6; text-decoration: none;">
                View Listing →
              </a>
            </p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3b82f6; margin: 0 0 10px 0;">Message from ${buyerName}</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${buyerEmail}</p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">💡 How to Respond</h3>
            <p style="margin: 5px 0; color: #92400e;">
              Reply directly to this email to contact ${buyerName}. Their email is: 
              <a href="mailto:${buyerEmail}" style="color: #3b82f6;">${buyerEmail}</a>
            </p>
          </div>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">🛡️ Safety Tips</h3>
            <ul style="margin: 5px 0; color: #dc2626; padding-left: 20px;">
              <li>Meet in a public place for transactions</li>
              <li>Trust your instincts about potential buyers</li>
              <li>Never share sensitive personal information</li>
              <li>Verify payment before handing over items</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>This email was sent from your Marketplace listing. If you didn't expect this message, please ignore it.</p>
        </div>
      </div>
    `

    // Send email
    await client.send({
      from: smtpConfig.username,
      to: sellerEmail,
      replyTo: buyerEmail,
      subject: subject,
      content: message,
      html: htmlContent,
    })

    await client.close()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully' 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
