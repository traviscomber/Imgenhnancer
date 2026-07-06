import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Send email via Resend or your email service
    // For now, we'll just log it and return success
    console.log('[v0] Support form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // TODO: Implement actual email sending via Resend or SendGrid
    // Example for Resend:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'support@clar1ty.art',
        to: 'info@clar1ty.art',
        replyTo: email,
        subject: `Support Request: ${subject} from ${name}`,
        html: `
          <h2>New Support Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    */

    return NextResponse.json(
      { 
        success: true,
        message: 'Your support request has been received. We will get back to you soon.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error processing support form:', error)
    return NextResponse.json(
      { error: 'Failed to process support request' },
      { status: 500 }
    )
  }
}
