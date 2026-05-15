import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

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