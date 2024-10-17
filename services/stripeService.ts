import Subscription from "../models/subscription";
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
    console.log("Cancel Subscription : ", cancelSub);
    const cancelDateTime = new Date();
    await Subscription.findByIdAndUpdate(subscription._id, {
      status: 3,
      canceledAt: cancelDateTime,
    });
    return { message: "Success! Your subscription has been canceled." };
  } else {
    return { message: "Error! Please try again later." };
  }
}
