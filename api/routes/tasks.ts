import { Router, Response } from 'express';
import dayjs from 'dayjs';
import db from '../db/init.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { mapToSchedule, mapToCollectionItem } from '../utils/rowMapper.js';
import type { Schedule, CollectionItem } from '../../shared/types.js';

const router = Router();

router.use(authenticateToken);

router.get('/my', (req: AuthRequest, res: Response): void => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: '未登录' });
      return;
    }

    const { status, date } = req.query;

    let type: string;
    if (user.role === 'restorer') {
      type = 'restoration';
    } else if (user.role === 'security') {
      type = 'security';
    } else {
      res.status(403).json({ success: false, error: '该角色无任务' });
      return;
    }

    let sql = `
      SELECT s.*,
             c.id as collection_id, c.name as collection_name, c.category as collection_category, 
             c.description as collection_description, c.era as collection_era, c.image as collection_image,
             c.exhibition_id as collection_exhibition_id, c.location_x as collection_location_x,
             c.location_y as collection_location_y, c.maintenance_cycle as collection_maintenance_cycle,
             c.last_maintenance_date as collection_last_maintenance_date, 
             c.next_maintenance_date as collection_next_maintenance_date, 
             c.visit_count as collection_visit_count, c.status as collection_status
      FROM schedules s
      LEFT JOIN collections c ON s.collection_id = c.id
      WHERE s.user_id = ? AND s.type = ?
    `;
    const params: unknown[] = [user.id, type];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    if (date) {
      sql += ' AND s.date = ?';
      params.push(date);
    }

    sql += ' ORDER BY s.date DESC, s.start_time ASC';

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];

    const tasks: Schedule[] = rows.map(row => {
      const schedule = mapToSchedule(row);

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

    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

router.put('/:id/complete', (req: AuthRequest, res: Response): void => {
  const updateTransaction = db.transaction(() => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: '未登录' });
      return;
    }

    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(Number(id)) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ success: false, error: '任务不存在' });
      return;
    }

    if (existing.user_id !== user.id) {
      res.status(403).json({ success: false, error: '无权完成他人任务' });
      return;
    }

    if (existing.status === 'completed') {
      res.status(400).json({ success: false, error: '任务已完成' });
      return;
    }

    db.prepare("UPDATE schedules SET status = 'completed' WHERE id = ?").run(Number(id));

    if (existing.type === 'restoration' && existing.collection_id) {
      const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(Number(existing.collection_id)) as Record<string, unknown> | undefined;
      if (collection) {
        const maintenanceCycle = (collection.maintenance_cycle as number) || 30;
        const nextMaintenanceDate = dayjs().add(maintenanceCycle, 'day').format('YYYY-MM-DD');
        const currentDate = dayjs().format('YYYY-MM-DD');

        db.prepare(`
          UPDATE collections 
          SET last_maintenance_date = ?, next_maintenance_date = ? 
          WHERE id = ?
        `).run(currentDate, nextMaintenanceDate, Number(existing.collection_id));
      }
    }

    const updatedSchedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(Number(id)) as Record<string, unknown>;

    let updatedCollection: CollectionItem | undefined;
    if (existing.type === 'restoration' && existing.collection_id) {
      const collectionRow = db.prepare('SELECT * FROM collections WHERE id = ?').get(Number(existing.collection_id)) as Record<string, unknown>;
      updatedCollection = mapToCollectionItem(collectionRow);
    }

    const result: { schedule: Schedule; collection?: CollectionItem } = {
      schedule: mapToSchedule(updatedSchedule),
    };
    if (updatedCollection) {
      result.collection = updatedCollection;
    }

    res.json({ success: true, data: result });
  });

  try {
    updateTransaction();
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : '服务器错误' });
  }
});

export default router;
