import Subscription, {subscriptionStatus} from "../models/subscription";
import Stripe from 'stripe';
import connectToDatabase from '../lib/mongodb';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function cancelSubscription(userId: string) {
    await connectToDatabase();
  const subscription: any = await Subscription.findOne({ userId });
  const cancelSub = await stripe.subscriptions.cancel(`${subscription.stripeSubscriptionId}`);
  if (cancelSub.status === "canceled") {
    const cancelDateTime = new Date();
    await Subscription.findByIdAndUpdate(subscription._id, {
      status: subscriptionStatus.canceled,
      canceledAt: cancelDateTime,
    });
    return { message: "Success! Your subscription has been canceled." };
  } else {
    return { message: "Error! Please try again later." };
  }
}

export async function subscription_Status(userId: string) {
  await connectToDatabase();
  const subscription: any = await Subscription.findOne({ userId });
  const subStatus = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  if (!subStatus) { 
    return { status: "Trial"}
  }
  return {"status": subStatus.status};
}
