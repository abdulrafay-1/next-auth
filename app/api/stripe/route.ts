import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const { productName, price , id} = await request.json();
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
//   if (!stripeSecret) {
//     return NextResponse.json(
//       {
//         message: "Stripe Secret Not Found",
//       },
//       { status: 404 }
//     );
//   }
  const stripe = new Stripe(stripeSecret!);
  if (!price || isNaN(parseFloat(price)) || !productName || isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid price or productName or ID provided" },
      { status: 400 }
    );
  }

  // Convert the price from string (e.g., "9.99") to integer (e.g., 999)
  const priceInCents = Math.round(parseFloat(price) * 100);
  const session = await stripe.checkout.sessions.create({
    success_url: `http://localhost:3001/success?id=${id}`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });

  try {
    return NextResponse.json(
      {
        message: "Checkout Session Created",
        sesson:session,
        redirectUrl: session.url,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
