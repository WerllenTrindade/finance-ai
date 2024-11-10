import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// app\api\webhooks\stripe\route.ts foi criado para ser uma rota que o clerk vai chamar assim que finalizar
// o processo de pagamento do usuario, hoje eu utilizo a rota o comando stripe.exe listen --forward-to http://localhost:3000/api/webhooks/stripe
// para iniciar um "backend" para obter o retorno do stripe que vai cair nessa função POST

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.error();
  }

  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  const event = stripe.webhooks.constructEvent(
    text,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  // Utilizado para atualizar o usuario no clerk, ele vai pegar o retorno do pagamento
  // e vai atualizar mediante ao pagamento com sucesso
  switch (event.type) {
    case "invoice.paid": {
      const { customer, subscription, subscription_details } =
        event.data.object;

      const clerkUserId = subscription_details?.metadata?.clerk_user_id;

      if (!clerkUserId) {
        return NextResponse.error();
      }

      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: customer,
          stripeSubscriptionId: subscription,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      //Remover plano do cliente
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );

      const clerkUserId = subscription.metadata.clerk_user_id;

      if (!clerkUserId) {
        return NextResponse.error();
      }

      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null,
        },
      });
    }
  }
  return NextResponse.json({ received: true });
};
