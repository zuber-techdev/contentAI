import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsersHandler, getUsersByPlanHandler } from '../../controllers/userController';
import { generatePostTopicsHandler, getPostTopicsHandler} from '../../controllers/postController';
import { authenticate } from '../../middlewares/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  if (req.method === 'GET' && action === 'get-all-users') {
    await authenticate(getUsersHandler, true) (req, res);
  } else if (req.method === 'GET' && action === 'users-by-plan') {
    await authenticate(getUsersByPlanHandler, true) (req, res);
  } else if (req.method === 'GET' && action === 'generate-post-topics') {
    await authenticate(generatePostTopicsHandler)(req, res);
  } else if (req.method === 'GET' && action === 'get-custom-topics') { 
    await authenticate(getPostTopicsHandler)(req, res);
  }else if (req.method === 'PUT' && action === 'cancel-post-schedule') { 
    await authenticate(getPostTopicsHandler)(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed or Invalid Action` });
  }
}
