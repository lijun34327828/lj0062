import { Router, type Response } from 'express';
import db from '../db/init.js';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';
import { mapToOpenRule, mapToExhibition } from '../utils/rowMapper.js';
import type { OpenRule, UpdateOpenRuleRequest } from '../../shared/types.js';

const router = Router();

router.get(
  '/rules',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sql = `SELECT r.*, 
                          e.id as exhibition_id,
                          e.name as exhibition_name, 
                          e.description as exhibition_description,
                          e.cover_image as exhibition_cover_image,
                          e.capacity as exhibition_capacity,
                          e.location as exhibition_location,
                          e.is_active as exhibition_is_active
                   FROM open_rules r
                   LEFT JOIN exhibitions e ON r.exhibition_id = e.id
                   ORDER BY r.exhibition_id, r.day_of_week`;

      const rows = db.prepare(sql).all() as Record<string, unknown>[];

      const data: OpenRule[] = rows.map((row) => {
        const exhibitionRow: Record<string, unknown> = {
          id: row.exhibition_id,
          name: row.exhibition_name,
          description: row.exhibition_description,
          cover_image: row.exhibition_cover_image,
          capacity: row.exhibition_capacity,
          location: row.exhibition_location,
          is_active: row.exhibition_is_active,
        };

        return {
          ...mapToOpenRule(row),
          exhibition: row.exhibition_id ? mapToExhibition(exhibitionRow) : undefined,
        };
      });

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

router.put(
  '/rules',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const rules = req.body as UpdateOpenRuleRequest[];

      if (!Array.isArray(rules) || rules.length === 0) {
        res.status(400).json({
          success: false,
          error: '请求体必须是一个非空数组',
        });
        return;
      }

      for (const rule of rules) {
        if (!rule.id || rule.openTime === undefined || rule.closeTime === undefined || rule.isClosed === undefined) {
          res.status(400).json({
            success: false,
            error: '每条规则必须包含 id、openTime、closeTime 和 isClosed 字段',
          });
          return;
        }

        const existingRule = db.prepare('SELECT id FROM open_rules WHERE id = ?').get(rule.id) as Record<string, unknown> | undefined;

        if (!existingRule) {
          res.status(404).json({
            success: false,
            error: `规则 ID ${rule.id} 不存在`,
          });
          return;
        }
      }

      const updateStmt = db.prepare(`
        UPDATE open_rules 
        SET open_time = ?, close_time = ?, is_closed = ?
        WHERE id = ?
      `);

      const transaction = db.transaction((rulesToUpdate: UpdateOpenRuleRequest[]) => {
        for (const rule of rulesToUpdate) {
          updateStmt.run(rule.openTime, rule.closeTime, rule.isClosed ? 1 : 0, rule.id);
        }
      });

      transaction(rules);

      const sql = `SELECT r.*, 
                          e.id as exhibition_id,
                          e.name as exhibition_name, 
                          e.description as exhibition_description,
                          e.cover_image as exhibition_cover_image,
                          e.capacity as exhibition_capacity,
                          e.location as exhibition_location,
                          e.is_active as exhibition_is_active
                   FROM open_rules r
                   LEFT JOIN exhibitions e ON r.exhibition_id = e.id
                   WHERE r.id IN (${rules.map(() => '?').join(', ')})
                   ORDER BY r.exhibition_id, r.day_of_week`;

      const updatedRows = db.prepare(sql).all(...rules.map((r) => r.id)) as Record<string, unknown>[];

      const data: OpenRule[] = updatedRows.map((row) => {
        const exhibitionRow: Record<string, unknown> = {
          id: row.exhibition_id,
          name: row.exhibition_name,
          description: row.exhibition_description,
          cover_image: row.exhibition_cover_image,
          capacity: row.exhibition_capacity,
          location: row.exhibition_location,
          is_active: row.exhibition_is_active,
        };

        return {
          ...mapToOpenRule(row),
          exhibition: row.exhibition_id ? mapToExhibition(exhibitionRow) : undefined,
        };
      });

      res.json({
        success: true,
        data,
        message: `成功更新 ${rules.length} 条开放规则`,
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
