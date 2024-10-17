import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { verifyToken } from '../utils/jwt';

export function authenticate(handler: NextApiHandler, requireAdmin: boolean = false) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      req.user = decoded;
      if (requireAdmin && !(decoded as any).isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      return handler(req, res);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ message: 'Invalid token', error: error.message });
      } else {
        return res.status(401).json({ message: 'Invalid token', error: 'Unknown error' });
      }
    }
  };
}
