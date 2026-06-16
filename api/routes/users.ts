import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/init.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { mapToUser } from '../utils/rowMapper.js';
import type { User, UserCreateRequest } from '../../shared/types.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const { role } = req.query;

    let sql = 'SELECT * FROM users WHERE 1=1';
    const params: unknown[] = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
    const users: User[] = rows.map(row => mapToUser(row));

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const body = req.body as UserCreateRequest;

    if (!body.username || !body.password || !body.name || !body.role) {
      res.status(400).json({ success: false, error: '缺少必填字段' });
      return;
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(body.username);
    if (existingUser) {
      res.status(400).json({ success: false, error: '用户名已存在' });
      return;
    }

    const passwordHash = bcrypt.hashSync(body.password, 10);

    const sql = `
      INSERT INTO users (username, password_hash, name, role, phone, bio)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = db.prepare(sql).run(
      body.username,
      passwordHash,
      body.name,
      body.role,
      body.phone || null,
      body.bio || null
    );

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;

    res.status(201).json({ success: true, data: mapToUser(newUser) });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const body = req.body as Partial<UserCreateRequest> & { password?: string };

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id)) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    if (body.username && body.username !== existing.username) {
      const usernameExists = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(body.username, Number(id));
      if (usernameExists) {
        res.status(400).json({ success: false, error: '用户名已存在' });
        return;
      }
    }

    const updateFields: string[] = [];
    const updateValues: unknown[] = [];

    if (body.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(body.name);
    }
    if (body.role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(body.role);
    }
    if (body.phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(body.phone);
    }
    if (body.bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(body.bio);
    }
    if (body.password !== undefined) {
      const passwordHash = bcrypt.hashSync(body.password, 10);
      updateFields.push('password_hash = ?');
      updateValues.push(passwordHash);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ success: false, error: '没有提供更新字段' });
      return;
    }

    updateValues.push(Number(id));

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...updateValues);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id)) as Record<string, unknown>;

    res.json({ success: true, data: mapToUser(updatedUser) });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(Number(id));
    if (!existing) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(Number(id));

    res.json({ success: true, data: { message: '删除成功' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

export default router;
