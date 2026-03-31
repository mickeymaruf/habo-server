import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import Stripe from "stripe";
import { stripe } from "../../config/stripe.config";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";

const createCheckoutSession = catchAsync(async (req, res) => {
  const { challengeId } = req.body;
  const userId = req.user.id;

  const result = await PaymentService.createCheckoutSession(
    userId,
    challengeId,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Checkout session created",
    data: result,
  });
});

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(status.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Extract metadata we attached during 'createCheckoutSession'
      const userId = session.metadata?.userId;
      const challengeId = session.metadata?.challengeId;

      if (userId && challengeId) {
        try {
          await prisma.$transaction(async (tx) => {
            // 1. Check if this specific event was already processed (Idempotency)
            const existingPayment = await tx.payment.findUnique({
              where: { stripeEventId: event.id },
            });
            if (existingPayment) return;

            // 2. Update Payment Record
            await tx.payment.update({
              where: { sessionId: session.id },
              data: {
                status: "SUCCESS",
                paymentIntentId: session.payment_intent as string,
                stripeEventId: event.id,
                gatewayResponse: session as any, // Full audit log
              },
            });

            // 3. Grant Challenge Access
            await tx.participation.upsert({
              where: { userId_challengeId: { userId, challengeId } },
              update: { status: "ACTIVE" },
              create: { userId, challengeId, status: "ACTIVE" },
            });
          });
        } catch (error: any) {
          console.error("WEBHOOK_DB_ERROR:", error.message);
          throw error;
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: {
          userId: intent.metadata?.userId,
          challengeId: intent.metadata?.challengeId,
          status: "PENDING",
        },
        data: {
          status: "FAILED",
          stripeEventId: event.id,
          gatewayResponse: intent as any,
        },
      });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.payment.updateMany({
        where: {
          sessionId: session.id,
          status: "PENDING",
        },
        data: { status: "FAILED" },
      });
      break;
    }

    default:
      console.log(`INFO: Ignoring event ${event.type}`);
  }

  // 4. Return 200 to Stripe
  res.status(status.OK).json({ received: true });
};

export const PaymentController = {
  createCheckoutSession,
  handleStripeWebhookEvent,
};
