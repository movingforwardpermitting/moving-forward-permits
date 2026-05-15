import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: body.email || undefined,

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

    const { error } = await supabase.from("permit_orders").insert({
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
      stripe_session_id: session.id,
      order_items: body.orderItems || [],
      email: body.email || null,
    });

    if (error) {
      throw error;
    }

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}