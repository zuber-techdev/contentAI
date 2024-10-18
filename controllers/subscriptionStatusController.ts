import type { NextApiRequest, NextApiResponse } from "next";
import { subscriptionStatus } from "../services/stripeService";

export async function subscriptionStatusHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { userId } = req.user as { userId: string };
      const newSubscription = await subscriptionStatus(userId);
      res.status(201).json(newSubscription);
    } catch (error) {
      res
        .status(400)
        .json({
          message: "Error terminating subscription",
          error: (error as Error).message,
        });
    }
 }