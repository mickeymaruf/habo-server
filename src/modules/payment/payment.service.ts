import { stripe } from "../../config/stripe.config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errorHelpers/AppError";
import status from "http-status";
import { env } from "../../config/env";

const createCheckoutSession = async (userId: string, challengeId: string) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) throw new AppError("Challenge not found", status.NOT_FOUND);

  if (!challenge.isPremium || !challenge.price || challenge.price <= 0) {
    throw new AppError(
      "This challenge does not require payment",
      status.BAD_REQUEST,
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${env.FRONTEND_URL}/participations/${challengeId}?success=true`,
    cancel_url: `${env.FRONTEND_URL}/challenges/${challengeId}?canceled=true`,
    metadata: { userId, challengeId }, // Used for checkout.session events

    payment_intent_data: {
      metadata: { userId, challengeId }, // Used for payment_intent events (failures)
    },

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: challenge.title },
          unit_amount: Math.round(challenge.price * 100),
        },
        quantity: 1,
      },
    ],
  });

  await prisma.payment.create({
    data: {
      userId,
      challengeId,
      amount: challenge.price!,
      currency: "usd",
      status: "PENDING",
      provider: "STRIPE",
      sessionId: session.id,
    },
  });

  return { url: session.url };
};

export const PaymentService = {
  createCheckoutSession,
};
