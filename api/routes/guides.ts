import { Router, type Request, type Response } from 'express'
import db from '../db/init.js'
import { isTimeOverlap, generateTimeSlots } from '../utils/timeUtils.js'
import { mapToUser } from '../utils/rowMapper.js'
import type { TimeSlot, User } from '../../shared/types.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = db
      .prepare(
        'SELECT id, username, name, role, avatar, phone, bio, rating FROM users WHERE role = ?'
      )
      .all('guide') as Record<string, unknown>[]

    const guides: User[] = rows.map(mapToUser)

    res.json({
      success: true,
      data: guides,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    })
  }
})

router.get('/:id/timeslots', async (req: Request, res: Response): Promise<void> => {
  try {
    const guideId = parseInt(req.params.id)
    const { date } = req.query

    if (!date) {
      res.status(400).json({
        success: false,
        error: '缺少 date 查询参数',
      })
      return
    }

    const guideExists = db
      .prepare('SELECT id FROM users WHERE id = ? AND role = ?')
      .get(guideId, 'guide')

    if (!guideExists) {
      res.status(404).json({
        success: false,
        error: '讲解人员不存在',
      })
      return
    }

    const bookings = db
      .prepare(
        'SELECT start_time, end_time FROM bookings WHERE guide_id = ? AND date = ? AND status != ?'
      )
      .all(guideId, date, 'cancelled') as { start_time: string; end_time: string }[]

    const rawSlots = generateTimeSlots(date as string)

    const timeSlots: TimeSlot[] = rawSlots.map((slot) => {
      let isAvailable = true
      let conflictType: 'exhibition' | 'guide' | undefined

      for (const booking of bookings) {
        if (isTimeOverlap(slot.startTime, slot.endTime, booking.start_time, booking.end_time)) {
          isAvailable = false
          conflictType = 'guide'
          break
        }
      }

      return {
        id: `${guideId}-${date}-${slot.startTime}`,
        date: date as string,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable,
        conflictType,
      }
    })

    res.json({
      success: true,
      data: timeSlots,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    })
  }
})

export default router
