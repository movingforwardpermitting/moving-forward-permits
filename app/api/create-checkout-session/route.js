import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
      );

      await supabase.from("permit_orders").insert([
        {
          company_name: body.companyName || null,
          usdot: body.usdot || null,
          mc_number: body.mcNumber || null,
          vin: body.vin || null,
          plate_number: body.plateNumber || null,
          phone_number: body.phoneNumber || null,
          permit_type: body.permitType || null,
          permit_state: body.state || null,
          processing_type: body.rush ? "Rush" : "Standard",
          total: body.total || 0,
          payment_status: "pending",
          order_status: "pending_review",
          order_items: body.orderItems || [],
        },
      ]);
    } catch (supabaseError) {
      console.log("Supabase save skipped:", supabaseError.message);
    }

    try {
      await resend.emails.send({
        from: "Moving Forward Permits <onboarding@resend.dev>",
        to: process.env.ADMIN_ALERT_EMAIL,
        subject: "New Permit Order Received",
        html: `
          <h2>New Permit Order Received</h2>
          <p><strong>Company:</strong> ${body.companyName || "Not provided"}</p>
          <p><strong>USDOT:</strong> ${body.usdot || "Not provided"}</p>
          <p><strong>MC Number:</strong> ${body.mcNumber || "Not provided"}</p>
          <p><strong>Phone:</strong> ${body.phoneNumber || "Not provided"}</p>
          <p><strong>Total:</strong> $${body.total || 0}</p>
          <p><strong>Processing:</strong> ${body.rush ? "Rush" : "Standard"}</p>
          <p><strong>Permit Items:</strong></p>
          <pre>${JSON.stringify(body.orderItems || [], null, 2)}</pre>
        `,
      });
    } catch (emailError) {
      console.log("Email alert skipped:", emailError.message);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Moving Forward Permit Services",
            },
            unit_amount: Math.round(body.total * 100),
          },
          quantity: 1,
        },
      ],
      success_url: "https://movingforwardpermits.com",
      cancel_url: "https://movingforwardpermits.com",
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}