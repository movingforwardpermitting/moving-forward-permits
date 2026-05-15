import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
);

export async function POST(req) {
  try {
    const body = await req.json();

    const { error } = await supabase.from("permit_orders").insert({
      total: body.total || 0,
      payment_status: "pending",
    });

    if (error) {
      throw error;
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
      success_url: "https://movingforwardpermits.com/success",
      cancel_url: "https://movingforwardpermits.com",
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}