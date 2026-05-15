import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { transporter } from "@/lib/mail";

export const POST = verifySignatureAppRouter(async (request) => {
  try {
    // 1. Get the data that QStash sent us
    const data = await request.json();
    const { email, barberName, time } = data;
    
   const mailOptions = {
      from: `"Ur-Umbrella Bookings" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✂️ Your Barber Appointment is Confirmed!',
      html: `
        <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #374151;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header section -->
            <div style="background-color: #111827; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">Ur-Umbrella</h1>
              <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Premium Booking Services</p>
            </div>
            
            <!-- Body section -->
            <div style="padding: 40px 30px;">
              <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Booking Confirmed! 🎉</h2>
              <p style="font-size: 16px; line-height: 1.6;">Hi there,</p>
              <p style="font-size: 16px; line-height: 1.6;">You are all set. Your haircut appointment has been successfully locked in and is waiting for you.</p>
              
              <!-- Highlighted Details Box -->
              <div style="margin: 30px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #111827; border-radius: 8px; padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="color: #6b7280; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Barber / Shop</span>
                      <strong style="color: #111827; font-size: 18px;">${barberName}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="color: #6b7280; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Date & Time</span>
                      <strong style="color: #111827; font-size: 18px;">${time}</strong>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">Please try to arrive 5 minutes early. If you need to cancel or reschedule, you can manage your bookings directly from your dashboard.</p>
            </div>
            
            <!-- Footer section -->
            <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Thank you for choosing Ur-Umbrella Bookings!</p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">Headquarters: Durgapur, West Bengal</p>
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Mail sent to",email);
    return Response.json({ success: true }, { status: 200 });
    // await transporter.sendMail(...)

    return Response.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Failed to send email", error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
});