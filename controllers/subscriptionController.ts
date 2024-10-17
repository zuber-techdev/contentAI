import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSubscription,
  extendSubscription,
  setMaxSubscription,
  terminateSubscription,
} from "../services/subscriptionService";
import {cancelSubscription} from "../services/stripeService";

export async function createSubscriptionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { userId, planId } = req.body;
      const newSubscription = await createSubscription({ userId, planId });
      res.status(201).json(newSubscription);
    } catch (error) {
      res
        .status(400)
        .json({
          message: "Error creating subscription",
          error: (error as Error).message,
        });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function extendSubscriptionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    try {
      const { subscriptionId, additionalDays } = req.body;
      const updatedSubscription = await extendSubscription(
        subscriptionId,
        additionalDays
      );
      res.status(200).json(updatedSubscription);
    } catch (error) {
      res
        .status(400)
        .json({
          message: "Error extending subscription",
          error: (error as Error).message,
        });
    }
  } else {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function setMaxSubscriptionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    try {
      const { subscriptionId } = req.body;
      const updatedSubscription = await setMaxSubscription(subscriptionId);
      res.status(200).json(updatedSubscription);
    } catch (error) {
      res
        .status(400)
        .json({
          message: "Error setting maximum subscription",
          error: (error as Error).message,
        });
    }
  } else {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function terminateSubscriptionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    try {
      const { subscriptionId } = req.body;
      const updatedSubscription = await terminateSubscription(subscriptionId);
      res.status(200).json(updatedSubscription);
    } catch (error) {
      res
        .status(400)
        .json({
          message: "Error terminating subscription",
          error: (error as Error).message,
        });
    }
  } else {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function cancelSubscriptionHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { userId } = req.user as { userId: string };
      const newSubscription = await cancelSubscription(userId);
      res.status(201).json(newSubscription);
    } catch (error) {
      res
        .status(400)
        .json({
          message: "Error terminating subscription",
          error: (error as Error).message,
        });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
 }
