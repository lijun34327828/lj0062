import { Router, Response } from 'express';
import db from '../db/init.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { mapToSchedule, mapToUser, mapToCollectionItem } from '../utils/rowMapper.js';
import { Schedule, ScheduleCreateRequest, AssignPersonnelRequest } from '../../shared/types.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const { date, userId, type } = req.query;
    
    let sql = `
      SELECT s.*,
             u.id as user_id, u.username as user_username, u.name as user_name, u.role as user_role, u.avatar as user_avatar, u.phone as user_phone, u.bio as user_bio, u.rating as user_rating,
             c.id as collection_id, c.name as collection_name, c.category as collection_category, c.description as collection_description, c.era as collection_era, c.image as collection_image, c.exhibition_id as collection_exhibition_id, c.location_x as collection_location_x, c.location_y as collection_location_y, c.maintenance_cycle as collection_maintenance_cycle, c.last_maintenance_date as collection_last_maintenance_date, c.next_maintenance_date as collection_next_maintenance_date, c.visit_count as collection_visit_count, c.status as collection_status
      FROM schedules s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN collections c ON s.collection_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    
    if (date) {
      sql += ' AND s.date = ?';
      params.push(date);
    }
    
    if (userId) {
      sql += ' AND s.user_id = ?';
      params.push(Number(userId));
    }
    
    if (type) {
      sql += ' AND s.type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY s.date DESC, s.start_time ASC';
    
    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
    
    const schedules: Schedule[] = rows.map(row => {
      const schedule = mapToSchedule(row);
      
      if (row.user_id) {
        schedule.user = mapToUser({
          id: row.user_id,
          username: row.user_username,
          name: row.user_name,
          role: row.user_role,
          avatar: row.user_avatar,
          phone: row.user_phone,
          bio: row.user_bio,
          rating: row.user_rating,
        });
      }
      
      if (row.collection_id) {
        schedule.collection = mapToCollectionItem({
          id: row.collection_id,
          name: row.collection_name,
          category: row.collection_category,
          description: row.collection_description,
          era: row.collection_era,
          image: row.collection_image,
          exhibition_id: row.collection_exhibition_id,
          location_x: row.collection_location_x,
          location_y: row.collection_location_y,
          maintenance_cycle: row.collection_maintenance_cycle,
          last_maintenance_date: row.collection_last_maintenance_date,
          next_maintenance_date: row.collection_next_maintenance_date,
          visit_count: row.collection_visit_count,
          status: row.collection_status,
        });
      }
      
      return schedule;
    });
    
    res.json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const body = req.body as ScheduleCreateRequest;
    
    if (!body.userId || !body.date || !body.startTime || !body.endTime || !body.type) {
      res.status(400).json({ success: false, error: '缺少必填字段' });
      return;
    }
    
    const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(Number(body.userId)) as Record<string, unknown> | undefined;
    if (!user) {
      res.status(400).json({ success: false, error: '用户不存在' });
      return;
    }
    
    if (body.type === 'restoration' && user.role !== 'restorer') {
      res.status(400).json({ success: false, error: '修复排班只能分配给修复师' });
      return;
    }
    
    if (body.type === 'security' && user.role !== 'security') {
      res.status(400).json({ success: false, error: '安保排班只能分配给安保人员' });
      return;
    }
    
    if (body.collectionId) {
      const collection = db.prepare('SELECT id FROM collections WHERE id = ?').get(Number(body.collectionId));
      if (!collection) {
        res.status(400).json({ success: false, error: '藏品不存在' });
        return;
      }
    }
    
    const overlapSql = `
      SELECT id FROM schedules 
      WHERE user_id = ? AND date = ? AND (
        (start_time < ? AND end_time > ?) OR
        (start_time < ? AND end_time > ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `;
    
    const overlap = db.prepare(overlapSql).get(
      body.userId,
      body.date,
      body.endTime,
      body.startTime,
      body.endTime,
      body.startTime,
      body.startTime,
      body.endTime
    );
    
    if (overlap) {
      res.status(400).json({ success: false, error: '该用户在此时间段已有排班' });
      return;
    }
    
    const sql = `
      INSERT INTO schedules (user_id, date, start_time, end_time, type, collection_id, area, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = db.prepare(sql).run(
      body.userId,
      body.date,
      body.startTime,
      body.endTime,
      body.type,
      body.collectionId || null,
      body.area || null,
      'scheduled'
    );
    
    const newSchedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
    
    res.json({ success: true, data: mapToSchedule(newSchedule) });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const body = req.body as Partial<ScheduleCreateRequest> & { status?: Schedule['status'] };
    
    const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(Number(id)) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ success: false, error: '排班不存在' });
      return;
    }
    
    const userId = body.userId ?? existing.user_id;
    const date = body.date ?? existing.date;
    const startTime = body.startTime ?? existing.start_time;
    const endTime = body.endTime ?? existing.end_time;
    
    if (body.userId) {
      const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(Number(body.userId)) as Record<string, unknown> | undefined;
      if (!user) {
        res.status(400).json({ success: false, error: '用户不存在' });
        return;
      }
      
      const type = body.type ?? existing.type;
      if (type === 'restoration' && user.role !== 'restorer') {
        res.status(400).json({ success: false, error: '修复排班只能分配给修复师' });
        return;
      }
      
      if (type === 'security' && user.role !== 'security') {
        res.status(400).json({ success: false, error: '安保排班只能分配给安保人员' });
        return;
      }
    }
    
    if (body.collectionId) {
      const collection = db.prepare('SELECT id FROM collections WHERE id = ?').get(Number(body.collectionId));
      if (!collection) {
        res.status(400).json({ success: false, error: '藏品不存在' });
        return;
      }
    }
    
    if (body.userId || body.date || body.startTime || body.endTime) {
      const overlapSql = `
        SELECT id FROM schedules 
        WHERE user_id = ? AND date = ? AND id != ? AND (
          (start_time < ? AND end_time > ?) OR
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `;
      
      const overlap = db.prepare(overlapSql).get(
        userId,
        date,
        Number(id),
        endTime,
        startTime,
        endTime,
        startTime,
        startTime,
        endTime
      );
      
      if (overlap) {
        res.status(400).json({ success: false, error: '该用户在此时间段已有排班' });
        return;
      }
    }
    
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    
    const fieldMap: Record<string, string> = {
      userId: 'user_id',
      date: 'date',
      startTime: 'start_time',
      endTime: 'end_time',
      type: 'type',
      collectionId: 'collection_id',
      area: 'area',
      status: 'status',
    };
    
    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (body[key as keyof typeof body] !== undefined) {
        updateFields.push(`${dbField} = ?`);
        updateValues.push(body[key as keyof typeof body]);
      }
    }
    
    if (updateFields.length === 0) {
      res.status(400).json({ success: false, error: '没有提供更新字段' });
      return;
    }
    
    updateValues.push(Number(id));
    
    const sql = `UPDATE schedules SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...updateValues);
    
    const updatedSchedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(Number(id)) as Record<string, unknown>;
    
    res.json({ success: true, data: mapToSchedule(updatedSchedule) });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.post('/assign', (req: AuthRequest, res: Response): void => {
  try {
    const body = req.body as AssignPersonnelRequest;
    
    if (!body.collectionId) {
      res.status(400).json({ success: false, error: '缺少藏品ID' });
      return;
    }
    
    if (!body.restorerId && !body.securityId) {
      res.status(400).json({ success: false, error: '至少需要提供修复师ID或安保ID' });
      return;
    }
    
    const collection = db.prepare('SELECT id FROM collections WHERE id = ?').get(Number(body.collectionId));
    if (!collection) {
      res.status(404).json({ success: false, error: '藏品不存在' });
      return;
    }
    
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    
    if (body.restorerId !== undefined) {
      if (body.restorerId !== null) {
        const restorer = db.prepare('SELECT id, role FROM users WHERE id = ?').get(Number(body.restorerId)) as Record<string, unknown> | undefined;
        if (!restorer) {
          res.status(400).json({ success: false, error: '修复师不存在' });
          return;
        }
        if (restorer.role !== 'restorer') {
          res.status(400).json({ success: false, error: '该用户不是修复师' });
          return;
        }
      }
      updateFields.push('assigned_restorer_id = ?');
      updateValues.push(body.restorerId);
    }
    
    if (body.securityId !== undefined) {
      if (body.securityId !== null) {
        const security = db.prepare('SELECT id, role FROM users WHERE id = ?').get(Number(body.securityId)) as Record<string, unknown> | undefined;
        if (!security) {
          res.status(400).json({ success: false, error: '安保人员不存在' });
          return;
        }
        if (security.role !== 'security') {
          res.status(400).json({ success: false, error: '该用户不是安保人员' });
          return;
        }
      }
      updateFields.push('assigned_security_id = ?');
      updateValues.push(body.securityId);
    }
    
    updateValues.push(Number(body.collectionId));
    
    const sql = `UPDATE collections SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...updateValues);
    
    const updatedCollection = db.prepare('SELECT * FROM collections WHERE id = ?').get(Number(body.collectionId)) as Record<string, unknown>;
    
    res.json({ success: true, data: mapToCollectionItem(updatedCollection) });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

export default router;
