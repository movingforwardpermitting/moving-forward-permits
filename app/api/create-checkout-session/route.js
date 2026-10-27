import Stripe from "stripe";
import { prepareOrder } from "../../../lib/order.mjs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

export async function POST(req) {
  try {
    const input = await req.json();
    let order;
    try { order = prepareOrder(input); }
    catch (error) { return Response.json({ error: error.message }, { status: 400 }); }
    const body = { ...order.customer, ...order, permitType: order.orderItems[0].permitType, state: order.orderItems[0].state };
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
      );

      const { error: saveError } = await supabase.from("permit_orders").insert([
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
      if (saveError) throw new Error("Order storage failed");
    } catch (supabaseError) {
      console.error("Order storage unavailable");
      return Response.json({ error: "Unable to save your order. Please contact movingforwardpermitting@gmail.com before payment." }, { status: 503 });
    }

    try {
      await resend.emails.send({
        from: "Moving Forward Permits <onboarding@resend.dev>",
        to: process.env.ADMIN_ALERT_EMAIL,
        subject: "New Permit Request — Payment Not Confirmed",
        html: `<h2>New permit request — payment not confirmed</h2><p>Standard service: $35 per permit. Rush service: $50 per permit.</p><pre>${escapeHtml(JSON.stringify(body, null, 2))}</pre>`,
      });
    } catch (emailError) {
      console.log("Email alert skipped:", emailError.message);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: body.email,
      line_items: body.orderItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: `${item.state} ${item.permitType}`, description: `State fee $${item.stateFee}; service fee $${item.serviceFee}` },
          unit_amount: Math.round(item.subtotal * 100),
        },
        quantity: 1,
      })),
      success_url: "https://movingforwardpermits.com",
      cancel_url: "https://movingforwardpermits.com",
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout creation failed");
    return Response.json({ error: "Checkout unavailable. Please contact movingforwardpermitting@gmail.com." }, { status: 500 });
  }
}