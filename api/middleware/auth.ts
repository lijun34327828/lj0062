import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../shared/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'museum-secret-key-2026';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: '认证令牌无效或已过期' });
  }
};

export const requireRole = (...roles: User['role'][]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: '未登录' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: '权限不足' });
    }

    next();
  };
};

export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
