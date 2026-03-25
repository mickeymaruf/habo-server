import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import Stripe from "stripe";
import { stripe } from "../../config/stripe.config";
import { ParticipationService } from "../participation/participation.service";
import { env } from "../../config/env";

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
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    // 1. Verify the event (Requires the RAW body from app.ts)
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(status.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract metadata we attached during 'createCheckoutSession'
    const userId = session.metadata?.userId;
    const challengeId = session.metadata?.challengeId;

    if (userId && challengeId) {
      try {
        // 3. Directly call your existing service to join the user
        await ParticipationService.joinChallenge(userId, challengeId);
        console.log(
          `User ${userId} successfully joined challenge ${challengeId}`,
        );
      } catch (dbError: any) {
        console.error(`Database Update Error: ${dbError.message}`);
        // We still return 200 to Stripe because the payment was successful;
        // we just need to handle the DB retry internally.
      }
    }
  }

  // 4. Return 200 to Stripe
  res.status(status.OK).json({ received: true });
};

export const PaymentController = {
  createCheckoutSession,
  handleStripeWebhookEvent,
};
