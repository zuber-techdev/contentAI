import Subscription, { subscriptionStatus } from "../models/subscription";
import Plan from "../models/plan";
import { addDays } from "date-fns"; // You can use this library to manage date operations

interface SubscriptionInput {
  userId: string;
  planId: string;
}

export async function createSubscription(data: SubscriptionInput) {
  const { userId, planId } = data;

  // Find the plan to get its duration
  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new Error("Plan not found");
  }

  // Calculate endDateTime based on the plan's duration
  const startDateTime = new Date();
  const endDateTime = addDays(startDateTime, parseInt(plan.duration));

  // Create the subscription
  const newSubscription = new Subscription({
    userId,
    planId,
    startDateTime,
    endDateTime,
    stripeSubscriptionId: `random_${new Date()}`,
    status: subscriptionStatus.active,
  });

  return await newSubscription.save();
}

// Extend the trial by a specified number of days (only admin can do this)
export async function extendSubscription(
  subscriptionId: string,
  additionalDays: number
) {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  // Extend the endDateTime by the additional days
  subscription.endDateTime = addDays(subscription.endDateTime, additionalDays);
  return await subscription.save();
}

// Set subscription to the maximum possible time (admin only)
export async function setMaxSubscription(subscriptionId: string) {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  // Set endDateTime to a far-future date (e.g., year 9999)
  subscription.endDateTime = new Date("9999-12-31");
  return await subscription.save();
}

export async function terminateSubscription(subscriptionId: string) {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new Error("Subscription not found");
  }
  subscription.status = 2;
  return await subscription.save();
}
