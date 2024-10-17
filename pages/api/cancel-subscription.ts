import { NextApiRequest, NextApiResponse } from 'next/types';
import { cancelSubscriptionHandler } from '../../controllers/subscriptionController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await authenticate(cancelSubscriptionHandler)(req, res)
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
