import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const body = await req.json();

    // SAVE ORDER FIRST
    const { data: orderData, error: orderError } = await supabase
      .from("permit_orders")
      .insert([
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
      ])
      .select();

    if (orderError) {
      console.error(orderError);
      return Response.json(
        { error: orderError.message },
        { status: 500 }
      );
    }

    // CREATE STRIPE SESSION
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

    return Response.json({
      url: session.url,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}