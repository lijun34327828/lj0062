import { Router, type Request, type Response } from 'express'
import db from '../db/init.js'
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js'
import { isTimeOverlap } from '../utils/timeUtils.js'
import { mapToBooking } from '../utils/rowMapper.js'
import dayjs from 'dayjs'
import type {
  BookingCheckRequest,
  BookingCheckResponse,
  BookingCreateRequest,
  Booking,
} from '../../shared/types.js'

const router = Router()

const checkConflicts = (
  exhibitionId: number,
  guideId: number | undefined,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: number
): { type: 'exhibition' | 'guide'; message: string }[] => {
  const conflicts: { type: 'exhibition' | 'guide'; message: string }[] = []

  const exhibitionBookings = db
    .prepare(
      `SELECT id, start_time, end_time FROM bookings 
       WHERE exhibition_id = ? AND date = ? AND status != ? 
       ${excludeBookingId ? 'AND id != ?' : ''}`
    )
    .all(
      excludeBookingId ? [exhibitionId, date, 'cancelled', excludeBookingId] : [exhibitionId, date, 'cancelled']
    ) as { id: number; start_time: string; end_time: string }[]

  for (const booking of exhibitionBookings) {
    if (isTimeOverlap(startTime, endTime, booking.start_time, booking.end_time)) {
      conflicts.push({
        type: 'exhibition',
        message: '展厅该时段已被预约',
      })
      break
    }
  }

  if (guideId) {
    const guideBookings = db
      .prepare(
        `SELECT id, start_time, end_time FROM bookings 
         WHERE guide_id = ? AND date = ? AND status != ? 
         ${excludeBookingId ? 'AND id != ?' : ''}`
      )
      .all(
        excludeBookingId ? [guideId, date, 'cancelled', excludeBookingId] : [guideId, date, 'cancelled']
      ) as { id: number; start_time: string; end_time: string }[]

    for (const booking of guideBookings) {
      if (isTimeOverlap(startTime, endTime, booking.start_time, booking.end_time)) {
        conflicts.push({
          type: 'guide',
          message: '讲解人员该时段已被预约',
        })
        break
      }
    }
  }

  return conflicts
}

router.post('/check', async (req: Request, res: Response): Promise<void> => {
  try {
    const { exhibitionId, guideId, date, startTime, endTime } = req.body as BookingCheckRequest

    if (!exhibitionId || !date || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        error: '缺少必填字段',
      })
      return
    }

    const conflicts = checkConflicts(exhibitionId, guideId, date, startTime, endTime)

    const result: BookingCheckResponse = {
      available: conflicts.length === 0,
      conflicts,
    }

    res.json({
      success: true,
      data: result,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      exhibitionId,
      guideId,
      visitorName,
      visitorPhone,
      visitorCount,
      date,
      startTime,
      endTime,
    } = req.body as BookingCreateRequest

    if (!exhibitionId || !visitorName || !visitorPhone || !visitorCount || !date || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        error: '缺少必填字段',
      })
      return
    }

    const conflicts = checkConflicts(exhibitionId, guideId, date, startTime, endTime)

    if (conflicts.length > 0) {
      res.status(400).json({
        success: false,
        error: '时段冲突，无法预约',
        data: {
          available: false,
          conflicts,
        },
      })
      return
    }

    const result = db
      .prepare(
        `INSERT INTO bookings 
         (exhibition_id, guide_id, visitor_name, visitor_phone, visitor_count, date, start_time, end_time, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        exhibitionId,
        guideId ?? null,
        visitorName,
        visitorPhone,
        visitorCount,
        date,
        startTime,
        endTime,
        'confirmed'
      )

    const bookingRow = db
      .prepare(
        `SELECT b.*, 
                e.name as exhibition_name, e.location as exhibition_location,
                u.name as guide_name, u.phone as guide_phone
         FROM bookings b
         LEFT JOIN exhibitions e ON b.exhibition_id = e.id
         LEFT JOIN users u ON b.guide_id = u.id
         WHERE b.id = ?`
      )
      .get(result.lastInsertRowid) as Record<string, unknown>

    const booking: Booking = {
      ...mapToBooking(bookingRow),
      exhibition: bookingRow.exhibition_name
        ? {
            id: exhibitionId,
            name: bookingRow.exhibition_name as string,
            description: '',
            coverImage: '',
            capacity: 0,
            location: (bookingRow.exhibition_location as string) || '',
            isActive: true,
          }
        : undefined,
      guide: bookingRow.guide_name && guideId
        ? {
            id: guideId,
            username: '',
            name: bookingRow.guide_name as string,
            role: 'guide',
            phone: bookingRow.guide_phone as string | undefined,
          }
        : undefined,
    }

    res.json({
      success: true,
      data: booking,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    })
  }
})

router.get(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { date, exhibitionId } = req.query

      let sql = `SELECT b.*, 
                        e.name as exhibition_name, e.location as exhibition_location,
                        u.name as guide_name, u.phone as guide_phone
                 FROM bookings b
                 LEFT JOIN exhibitions e ON b.exhibition_id = e.id
                 LEFT JOIN users u ON b.guide_id = u.id
                 WHERE 1=1`
      const params: (string | number)[] = []

      if (date) {
        sql += ' AND b.date = ?'
        params.push(date as string)
      }

      if (exhibitionId) {
        sql += ' AND b.exhibition_id = ?'
        params.push(parseInt(exhibitionId as string))
      }

      sql += ' ORDER BY b.date DESC, b.start_time DESC'

      const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]

      const bookings: Booking[] = rows.map((row) => ({
        ...mapToBooking(row),
        exhibition: row.exhibition_name
          ? {
              id: row.exhibition_id as number,
              name: row.exhibition_name as string,
              description: '',
              coverImage: '',
              capacity: 0,
              location: (row.exhibition_location as string) || '',
              isActive: true,
            }
          : undefined,
        guide: row.guide_name && row.guide_id
          ? {
              id: row.guide_id as number,
              username: '',
              name: row.guide_name as string,
              role: 'guide',
              phone: row.guide_phone as string | undefined,
            }
          : undefined,
      }))

      res.json({
        success: true,
        data: bookings,
      })
    } catch (err) {
      res.status(500).json({
        success: false,
        error: (err as Error).message,
      })
    }
  }
)

router.get('/my', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.query

    if (!phone) {
      res.status(400).json({
        success: false,
        error: '请提供手机号',
      })
      return
    }

    const sql = `SELECT b.*, 
                        e.name as exhibition_name, e.location as exhibition_location,
                        u.name as guide_name, u.phone as guide_phone
                 FROM bookings b
                 LEFT JOIN exhibitions e ON b.exhibition_id = e.id
                 LEFT JOIN users u ON b.guide_id = u.id
                 WHERE b.visitor_phone = ?
                 ORDER BY b.date DESC, b.start_time DESC`

    const rows = db.prepare(sql).all(phone as string) as Record<string, unknown>[]

    const bookings: Booking[] = rows.map((row) => ({
      ...mapToBooking(row),
      exhibition: row.exhibition_name
        ? {
            id: row.exhibition_id as number,
            name: row.exhibition_name as string,
            description: '',
            coverImage: '',
            capacity: 0,
            location: (row.exhibition_location as string) || '',
            isActive: true,
          }
        : undefined,
      guide: row.guide_name && row.guide_id
        ? {
            id: row.guide_id as number,
            username: '',
            name: row.guide_name as string,
            role: 'guide',
            phone: row.guide_phone as string | undefined,
          }
        : undefined,
    }))

    res.json({
      success: true,
      data: bookings,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    })
  }
})

router.put('/:id/cancel', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { phone } = req.body as { phone: string }

    if (!phone) {
      res.status(400).json({
        success: false,
        error: '请提供手机号',
      })
      return
    }

    const bookingRow = db
      .prepare('SELECT * FROM bookings WHERE id = ?')
      .get(parseInt(id)) as Record<string, unknown> | undefined

    if (!bookingRow) {
      res.status(404).json({
        success: false,
        error: '预约不存在',
      })
      return
    }

    if (bookingRow.visitor_phone !== phone) {
      res.status(403).json({
        success: false,
        error: '无权取消此预约',
      })
      return
    }

    if (bookingRow.status === 'cancelled') {
      res.status(400).json({
        success: false,
        error: '预约已取消',
      })
      return
    }

    const bookingDateTime = dayjs(`${bookingRow.date as string} ${bookingRow.start_time as string}`)
    if (bookingDateTime.isBefore(dayjs())) {
      res.status(400).json({
        success: false,
        error: '预约已开始或已结束，无法取消',
      })
      return
    }

    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', parseInt(id))

    const updatedRow = db
      .prepare(
        `SELECT b.*, 
                e.name as exhibition_name, e.location as exhibition_location,
                u.name as guide_name, u.phone as guide_phone
         FROM bookings b
         LEFT JOIN exhibitions e ON b.exhibition_id = e.id
         LEFT JOIN users u ON b.guide_id = u.id
         WHERE b.id = ?`
      )
      .get(parseInt(id)) as Record<string, unknown>

    const booking: Booking = {
      ...mapToBooking(updatedRow),
      exhibition: updatedRow.exhibition_name
        ? {
            id: updatedRow.exhibition_id as number,
            name: updatedRow.exhibition_name as string,
            description: '',
            coverImage: '',
            capacity: 0,
            location: (updatedRow.exhibition_location as string) || '',
            isActive: true,
          }
        : undefined,
      guide: updatedRow.guide_name && updatedRow.guide_id
        ? {
            id: updatedRow.guide_id as number,
            username: '',
            name: updatedRow.guide_name as string,
            role: 'guide',
            phone: updatedRow.guide_phone as string | undefined,
          }
        : undefined,
    }

    res.json({
      success: true,
      data: booking,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    })
  }
})

export default router
