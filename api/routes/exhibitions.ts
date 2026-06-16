import { Router, type Request, type Response } from 'express';
import dayjs from 'dayjs';
import db from '../db/init.js';
import { generateTimeSlots, isTimeOverlap } from '../utils/timeUtils.js';
import { mapToExhibition } from '../utils/rowMapper.js';
import type { Exhibition, TimeSlot, Booking } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const rows = db.prepare('SELECT * FROM exhibitions WHERE is_active = 1 ORDER BY id').all() as Record<string, unknown>[];
    const exhibitions: Exhibition[] = rows.map(row => mapToExhibition(row));

    res.json({
      success: true,
      data: exhibitions
    });
  } catch (err) {
    console.error('获取展厅列表错误:', err);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: '无效的展厅ID'
      });
      return;
    }

    const row = db.prepare('SELECT * FROM exhibitions WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!row) {
      res.status(404).json({
        success: false,
        error: '展厅不存在'
      });
      return;
    }

    const exhibition: Exhibition = mapToExhibition(row);

    res.json({
      success: true,
      data: exhibition
    });
  } catch (err) {
    console.error('获取展厅详情错误:', err);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

router.get('/:id/timeslots', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id, 10);
    const { date } = req.query;

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: '无效的展厅ID'
      });
      return;
    }

    if (!date || typeof date !== 'string') {
      res.status(400).json({
        success: false,
        error: '请提供日期参数 date'
      });
      return;
    }

    const exhibitionRow = db.prepare('SELECT * FROM exhibitions WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!exhibitionRow) {
      res.status(404).json({
        success: false,
        error: '展厅不存在'
      });
      return;
    }

    const dayOfWeek = dayjs(date).day();
    const openRuleRow = db.prepare(
      'SELECT * FROM open_rules WHERE exhibition_id = ? AND day_of_week = ?'
    ).get(id, dayOfWeek) as Record<string, unknown> | undefined;

    if (!openRuleRow || openRuleRow.is_closed) {
      res.json({
        success: true,
        data: []
      });
      return;
    }

    const openTime = openRuleRow.open_time as string;
    const closeTime = openRuleRow.close_time as string;
    const slots = generateTimeSlots(date, openTime, closeTime);

    const bookingRows = db.prepare(
      'SELECT * FROM bookings WHERE exhibition_id = ? AND date = ? AND status != ?'
    ).all(id, date, 'cancelled') as Record<string, unknown>[];

    const bookings: Booking[] = bookingRows.map(row => ({
      id: row.id as number,
      exhibitionId: row.exhibition_id as number,
      guideId: row.guide_id as number | undefined,
      visitorName: row.visitor_name as string,
      visitorPhone: row.visitor_phone as string,
      visitorCount: row.visitor_count as number,
      date: row.date as string,
      startTime: row.start_time as string,
      endTime: row.end_time as string,
      status: row.status as Booking['status'],
      createdAt: row.created_at as string
    }));

    const timeSlots: TimeSlot[] = slots.map((slot, index) => {
      let isAvailable = true;
      let conflictType: 'exhibition' | 'guide' | undefined;

      for (const booking of bookings) {
        if (isTimeOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime)) {
          isAvailable = false;
          conflictType = 'exhibition';
          break;
        }
      }

      return {
        id: `${id}-${date}-${index}`,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable,
        conflictType
      };
    });

    res.json({
      success: true,
      data: timeSlots
    });
  } catch (err) {
    console.error('获取可预约时段错误:', err);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

export default router;
