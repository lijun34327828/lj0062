import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/init.js';
import { generateToken } from '../middleware/auth.js';
import { mapToUser } from '../utils/rowMapper.js';
import type { LoginRequest, LoginResponse } from '../../shared/types.js';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: '用户名和密码不能为空'
      });
      return;
    }

    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as Record<string, unknown> | undefined;

    if (!row) {
      res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      });
      return;
    }

    const passwordHash = row.password_hash as string;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      });
      return;
    }

    const user = mapToUser(row);
    const token = generateToken(user);

    const data: LoginResponse = {
      token,
      user
    };

    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

export default router;
