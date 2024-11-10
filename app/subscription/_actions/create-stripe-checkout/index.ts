"use server";

import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

// Utilizado para validar se o usuario esta logado, logo após isso ele validar as keys e redireciona o cliente
// para a web do stripe para efetuar o pagamento por lá
export const createStripeCheckout = async () => {
  const { userId } = await auth();
  console.log("userId " + userId);
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: "http://localhost:3000",
    cancel_url: "http://localhost:3000",
    subscription_data: {
      metadata: {
        clerk_user_id: userId,
      },
    },
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PRICE_ID,
        quantity: 1,
      },
    ],
  });
  return { sessionId: session.id };
};
