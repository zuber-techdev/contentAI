import { buffer } from 'micro';
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import User from "../../models/user";
import Subscription from "../../models/subscription";
import Plan from "../../models/plan"; 
import { addDays } from "date-fns";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err:any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  switch (event.type) {
    case 'invoice.payment_succeeded': {
      const subscription = event.data.object;
      const customerEmail = subscription.customer_email;
      const subscriptionId = subscription.subscription;
      const userInfo:any = await User.findOne({ email: customerEmail });
      const planInfo:any = await Plan.findOne({ name: "professional" });
      const subscriptionInfo:any = await Subscription.findOne({ userId: userInfo._id });
      const subscriptionEndDate:any = subscriptionInfo?.endDateTime;
      const newSubscriptionEndDate = addDays(subscriptionEndDate, parseInt(planInfo.duration));
      await Subscription.updateOne({ _id: subscriptionInfo._id }, {stripeSubscriptionId: subscriptionId, endDateTime: newSubscriptionEndDate});
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
}
