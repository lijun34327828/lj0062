import dayjs from 'dayjs';

export const isTimeOverlap = (
  start1: string, end1: string,
  start2: string, end2: string
): boolean => {
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return s1 < e2 && s2 < e1;
};

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const generateTimeSlots = (
  date: string,
  openTime: string = '09:00',
  closeTime: string = '17:00',
  duration: number = 90
) => {
  const slots: { startTime: string; endTime: string }[] = [];
  let current = dayjs(`${date} ${openTime}`);
  const close = dayjs(`${date} ${closeTime}`);

  while (current.add(duration, 'minute').isBefore(close) || 
         current.add(duration, 'minute').isSame(close)) {
    const startTime = current.format('HH:mm');
    current = current.add(duration, 'minute');
    const endTime = current.format('HH:mm');
    slots.push({ startTime, endTime });
  }

  return slots;
};

export const getDaysUntil = (targetDate: string): number => {
  const today = dayjs().startOf('day');
  const target = dayjs(targetDate).startOf('day');
  return target.diff(today, 'day');
};

export const getMaintenanceLevel = (daysUntil: number): 'warning' | 'urgent' | 'overdue' => {
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 3) return 'urgent';
  if (daysUntil <= 7) return 'warning';
  return 'warning';
};
