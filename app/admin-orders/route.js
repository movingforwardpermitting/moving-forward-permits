import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from("permit_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({
      orders: data,
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}