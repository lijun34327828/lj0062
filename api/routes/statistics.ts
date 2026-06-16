import { Router, type Response } from 'express';
import db from '../db/init.js';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';
import type { VisitFrequencyData } from '../../shared/types.js';

const router = Router();

router.get(
  '/visit-freq',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      let sql = `SELECT vs.date, 
                        SUM(vs.visit_count) as count, 
                        vs.exhibition_id, 
                        e.name as exhibition_name
                 FROM visit_statistics vs
                 LEFT JOIN exhibitions e ON vs.exhibition_id = e.id
                 WHERE 1=1`;
      const params: (string | number)[] = [];

      if (startDate) {
        sql += ' AND vs.date >= ?';
        params.push(startDate as string);
      }

      if (endDate) {
        sql += ' AND vs.date <= ?';
        params.push(endDate as string);
      }

      sql += ' GROUP BY vs.date, vs.exhibition_id ORDER BY vs.date DESC, count DESC';

      const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];

      const data: VisitFrequencyData[] = rows.map((row) => ({
        date: row.date as string,
        count: row.count as number,
        exhibitionId: row.exhibition_id as number,
        exhibitionName: row.exhibition_name as string,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: (err as Error).message,
      });
    }
  }
);

router.get(
  '/exhibition-usage',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      let sql = `SELECT e.id,
                        e.name,
                        e.capacity,
                        COUNT(DISTINCT b.id) as booking_count,
                        COALESCE(SUM(b.visitor_count), 0) as total_visitors,
                        (COUNT(DISTINCT b.id) * 1.0 / (7 * 8)) * 100 as usage_rate
                 FROM exhibitions e
                 LEFT JOIN bookings b ON e.id = b.exhibition_id AND b.status != 'cancelled'
                 WHERE 1=1`;
      const params: (string | number)[] = [];

      if (startDate) {
        sql += ' AND b.date >= ?';
        params.push(startDate as string);
      }

      if (endDate) {
        sql += ' AND b.date <= ?';
        params.push(endDate as string);
      }

      sql += ' GROUP BY e.id ORDER BY usage_rate DESC';

      const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];

      const data = rows.map((row) => ({
        exhibitionId: row.id as number,
        exhibitionName: row.name as string,
        capacity: row.capacity as number,
        bookingCount: row.booking_count as number,
        totalVisitors: row.total_visitors as number,
        usageRate: Math.round((row.usage_rate as number) * 100) / 100,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: (err as Error).message,
      });
    }
  }
);

router.get(
  '/workload',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, type } = req.query;

      let sql = `SELECT u.id,
                        u.name,
                        u.role,
                        COUNT(s.id) as total_tasks,
                        SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                        COALESCE(SUM(
                          (CAST(strftime('%H', s.end_time) AS INTEGER) * 60 + CAST(strftime('%M', s.end_time) AS INTEGER)) -
                          (CAST(strftime('%H', s.start_time) AS INTEGER) * 60 + CAST(strftime('%M', s.start_time) AS INTEGER))
                        ), 0) as total_minutes
                 FROM users u
                 LEFT JOIN schedules s ON u.id = s.user_id
                 WHERE 1=1`;
      const params: (string | number)[] = [];

      if (startDate) {
        sql += ' AND s.date >= ?';
        params.push(startDate as string);
      }

      if (endDate) {
        sql += ' AND s.date <= ?';
        params.push(endDate as string);
      }

      if (type) {
        sql += ' AND s.type = ?';
        params.push(type as string);
      }

      sql += ' GROUP BY u.id ORDER BY total_minutes DESC';

      const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];

      const data = rows.map((row) => ({
        userId: row.id as number,
        userName: row.name as string,
        role: row.role as string,
        totalTasks: row.total_tasks as number,
        completedTasks: row.completed_tasks as number,
        totalMinutes: row.total_minutes as number,
        totalHours: Math.round(((row.total_minutes as number) / 60) * 100) / 100,
      }));

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: (err as Error).message,
      });
    }
  }
);

export default router;
