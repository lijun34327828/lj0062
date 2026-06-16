import { useState, useEffect, useRef } from 'react';
import {
  CalendarDays,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  UserCheck,
  Shield,
  Clock,
  Package,
  GripVertical,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(weekday);
dayjs.extend(isBetween);

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { schedulesApi, usersApi, collectionsApi } from '@/services/api';
import AssignPersonnelModal from '@/components/AssignPersonnelModal';
import type { Schedule, User, CollectionItem } from '../../../shared/types';

dayjs.extend(weekday);
dayjs.extend(isBetween);

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const hours = Array.from({ length: 24 }, (_, i) => i);

const typeColors = {
  restoration: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    text: 'text-blue-300',
    dot: 'bg-blue-500',
  },
  security: {
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    text: 'text-green-300',
    dot: 'bg-green-500',
  },
};

interface FormData {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'restoration' | 'security';
  collectionId: string;
  area: string;
}

const initialFormData: FormData = {
  userId: '',
  date: dayjs().format('YYYY-MM-DD'),
  startTime: '09:00',
  endTime: '17:00',
  type: 'restoration',
  collectionId: '',
  area: '',
};

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionItem | null>(null);

  const [draggingSchedule, setDraggingSchedule] = useState<Schedule | null>(null);
  const [dragOffset, setDragOffset] = useState({ y: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.userId && formData.date && formData.startTime && formData.endTime) {
      const userId = Number(formData.userId);
      const start = dayjs(`${formData.date} ${formData.startTime}`);
      const end = dayjs(`${formData.date} ${formData.endTime}`);

      const conflictList: string[] = [];
      schedules.forEach(s => {
        if (s.userId !== userId || s.date !== formData.date) return;
        if (editingSchedule && s.id === editingSchedule.id) return;

        const sStart = dayjs(`${s.date} ${s.startTime}`);
        const sEnd = dayjs(`${s.date} ${s.endTime}`);

        if (start.isBefore(sEnd) && end.isAfter(sStart)) {
          const user = users.find(u => u.id === s.userId);
          conflictList.push(`${user?.name || '未知人员'}: ${s.startTime}-${s.endTime} (${s.type === 'restoration' ? '修复' : '安保'})`);
        }
      });
      setConflicts(conflictList);
    } else {
      setConflicts([]);
    }
  }, [formData.userId, formData.date, formData.startTime, formData.endTime, schedules, editingSchedule, users]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, usersRes, collectionsRes] = await Promise.all([
        schedulesApi.getList(),
        usersApi.getList(),
        collectionsApi.getList(),
      ]);
      if (schedulesRes.success && schedulesRes.data) {
        setSchedules(schedulesRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (collectionsRes.success && collectionsRes.data) {
        setCollections(collectionsRes.data);
      }
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthDays = () => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startDay = startOfMonth.weekday();
    const days: dayjs.Dayjs[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
      days.push(startOfMonth.subtract(i + 1, 'day'));
    }
    for (let i = 0; i < endOfMonth.date(); i++) {
      days.push(startOfMonth.add(i, 'day'));
    }
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) {
      days.push(endOfMonth.add(i + 1, 'day'));
    }
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = currentDate.startOf('week');
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  };

  const getDaySchedules = (date: dayjs.Dayjs) => {
    return schedules.filter(s => dayjs(s.date).isSame(date, 'day'));
  };

  const getHourSchedules = (date: dayjs.Dayjs, hour: number) => {
    return getDaySchedules(date).filter(s => {
      const startHour = Number(s.startTime.split(':')[0]);
      const endHour = Number(s.endTime.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  const handleDateClick = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, date: date.format('YYYY-MM-DD') }));
    setEditingSchedule(null);
    setConflicts([]);
    setShowModal(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      userId: String(schedule.userId),
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      type: schedule.type,
      collectionId: schedule.collectionId ? String(schedule.collectionId) : '',
      area: schedule.area || '',
    });
    setConflicts([]);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.userId || !formData.date || !formData.startTime || !formData.endTime) return;
    if (conflicts.length > 0 && !confirm('存在时间冲突，确定要继续吗？')) return;

    setSubmitting(true);
    try {
      const data = {
        userId: Number(formData.userId),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        collectionId: formData.collectionId ? Number(formData.collectionId) : undefined,
        area: formData.area || undefined,
      };

      if (editingSchedule) {
        await schedulesApi.update(editingSchedule.id, data);
      } else {
        await schedulesApi.create(data);
      }
      await fetchData();
      setShowModal(false);
    } catch (err) {
      console.error('保存失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个排班吗？')) return;
    try {
      await schedulesApi.update(id, {});
      await fetchData();
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const handleDragStart = (e: React.MouseEvent, schedule: Schedule) => {
    e.stopPropagation();
    setDraggingSchedule(schedule);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({ y: e.clientY - rect.top });
  };

  const handleDragMove = (e: React.MouseEvent, date: dayjs.Dayjs) => {
    if (!draggingSchedule || !calendarRef.current) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const cellHeight = rect.height / hours.length;
    const relativeY = e.clientY - rect.top - dragOffset.y;
    const newHour = Math.max(0, Math.min(23, Math.floor(relativeY / cellHeight)));

    const startMinutes = Number(draggingSchedule.startTime.split(':')[1]);
    const endMinutes = Number(draggingSchedule.endTime.split(':')[1]);
    const durationHours = Number(draggingSchedule.endTime.split(':')[0]) - Number(draggingSchedule.startTime.split(':')[0]);

    const newStartHour = newHour;
    const newEndHour = Math.min(23, newHour + durationHours);

    if (newStartHour !== Number(draggingSchedule.startTime.split(':')[0]) ||
        !dayjs(draggingSchedule.date).isSame(date, 'day')) {
      const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
      const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

      setSchedules(prev => prev.map(s =>
        s.id === draggingSchedule.id
          ? { ...s, date: date.format('YYYY-MM-DD'), startTime: newStartTime, endTime: newEndTime }
          : s
      ));
    }
  };

  const handleDragEnd = async () => {
    if (draggingSchedule) {
      try {
        const updated = schedules.find(s => s.id === draggingSchedule.id);
        if (updated) {
          await schedulesApi.update(draggingSchedule.id, {
            date: updated.date,
            startTime: updated.startTime,
            endTime: updated.endTime,
          });
        }
      } catch (err) {
        console.error('更新失败:', err);
        await fetchData();
      }
    }
    setDraggingSchedule(null);
  };

  const getUserTodayStatus = (userId: number) => {
    const today = dayjs().format('YYYY-MM-DD');
    const todaySchedules = schedules.filter(s => s.userId === userId && s.date === today);
    if (todaySchedules.length === 0) return { status: '休息', className: 'text-cream-500', dot: 'bg-cream-500' };

    const now = dayjs();
    for (const s of todaySchedules) {
      const start = dayjs(`${s.date} ${s.startTime}`);
      const end = dayjs(`${s.date} ${s.endTime}`);
      if (now.isBetween(start, end)) {
        return {
          status: s.type === 'restoration' ? '修复中' : '值班中',
          className: s.type === 'restoration' ? 'text-blue-400' : 'text-green-400',
          dot: s.type === 'restoration' ? 'bg-blue-500' : 'bg-green-500',
        };
      }
    }

    return { status: '待班', className: 'text-amber-400', dot: 'bg-amber-500' };
  };

  const navigatePrev = () => {
    setCurrentDate(prev => viewMode === 'month' ? prev.subtract(1, 'month') : prev.subtract(1, 'week'));
  };

  const navigateNext = () => {
    setCurrentDate(prev => viewMode === 'month' ? prev.add(1, 'month') : prev.add(1, 'week'));
  };

  const navigateToday = () => {
    setCurrentDate(dayjs());
    setSelectedDate(dayjs());
  };

  const restorers = users.filter(u => u.role === 'restorer');
  const security = users.filter(u => u.role === 'security');

  const renderMonthView = () => {
    const days = getMonthDays();
    return (
      <div className="bg-primary-800 rounded-xl border border-gold-500/20 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gold-500/20">
          {weekDays.map(day => (
            <div key={day} className="px-4 py-3 text-center text-sm font-medium text-cream-400 border-r border-primary-700/50 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date, idx) => {
            const daySchedules = getDaySchedules(date);
            const isCurrentMonth = date.month() === currentDate.month();
            const isToday = date.isSame(dayjs(), 'day');
            const isSelected = date.isSame(selectedDate, 'day');

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(date)}
                className={cn(
                  'min-h-[120px] p-2 border-r border-b border-primary-700/30 cursor-pointer hover:bg-primary-700/30 transition-colors',
                  !isCurrentMonth && 'bg-primary-900/50',
                  isSelected && 'bg-gold-500/10',
                  idx % 7 === 6 && 'border-r-0'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    'text-sm font-medium',
                    isToday && 'w-6 h-6 rounded-full bg-gold-500 text-primary-900 flex items-center justify-center',
                    !isToday && isCurrentMonth && 'text-cream-200',
                    !isToday && !isCurrentMonth && 'text-cream-600'
                  )}>
                    {date.date()}
                  </span>
                  {daySchedules.length > 0 && (
                    <span className="text-xs text-cream-500">{daySchedules.length}</span>
                  )}
                </div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map(s => {
                    const user = users.find(u => u.id === s.userId);
                    const colors = typeColors[s.type];
                    return (
                      <div
                        key={s.id}
                        onClick={(e) => { e.stopPropagation(); handleEditSchedule(s); }}
                        className={cn(
                          'text-xs px-2 py-1 rounded truncate border-l-2',
                          colors.bg,
                          colors.border,
                          colors.text
                        )}
                      >
                        {s.startTime} {user?.name || '未知'}
                      </div>
                    );
                  })}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-cream-500 px-2">
                      +{daySchedules.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays();
    return (
      <div className="bg-primary-800 rounded-xl border border-gold-500/20 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gold-500/20">
          <div className="px-4 py-3 text-center text-sm font-medium text-cream-400 border-r border-primary-700/50">
            <Clock className="w-4 h-4 mx-auto" />
          </div>
          {days.map((date, idx) => {
            const isToday = date.isSame(dayjs(), 'day');
            const isSelected = date.isSame(selectedDate, 'day');
            return (
              <div
                key={idx}
                className={cn(
                  'px-4 py-3 text-center border-r border-primary-700/50 last:border-r-0',
                  isSelected && 'bg-gold-500/10'
                )}
              >
                <p className="text-xs text-cream-400">{weekDays[date.weekday()]}</p>
                <p className={cn(
                  'text-lg font-bold',
                  isToday && 'text-gold-400',
                  !isToday && 'text-cream-200'
                )}>
                  {date.date()}
                </p>
              </div>
            );
          })}
        </div>
        <div
          ref={calendarRef}
          className="relative overflow-y-auto max-h-[600px]"
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-primary-700/30">
              <div className="px-2 py-1 text-right text-xs text-cream-500 border-r border-primary-700/50 sticky left-0 bg-primary-800">
                {String(hour).padStart(2, '0')}:00
              </div>
              {days.map((date, dayIdx) => {
                const hourSchedules = getHourSchedules(date, hour);
                const isToday = date.isSame(dayjs(), 'day');
                const isSelected = date.isSame(selectedDate, 'day');

                return (
                  <div
                    key={dayIdx}
                    onClick={() => {
                      if (!draggingSchedule) {
                        setFormData(prev => ({
                          ...prev,
                          date: date.format('YYYY-MM-DD'),
                          startTime: `${String(hour).padStart(2, '0')}:00`,
                          endTime: `${String(hour + 1).padStart(2, '0')}:00`,
                        }));
                        handleDateClick(date);
                      }
                    }}
                    onMouseMove={(e) => handleDragMove(e, date)}
                    className={cn(
                      'h-12 border-r border-primary-700/30 relative cursor-crosshair hover:bg-primary-700/20 transition-colors',
                      isSelected && 'bg-gold-500/5',
                      isToday && hour === dayjs().hour() && 'bg-blue-500/10',
                      dayIdx === 6 && 'border-r-0'
                    )}
                  >
                    {hourSchedules.map(s => {
                      const startHour = Number(s.startTime.split(':')[0]);
                      if (hour !== startHour) return null;

                      const endHour = Number(s.endTime.split(':')[0]);
                      const endMin = Number(s.endTime.split(':')[1]);
                      const duration = (endHour - startHour) + (endMin / 60);
                      const user = users.find(u => u.id === s.userId);
                      const colors = typeColors[s.type];

                      return (
                        <div
                          key={s.id}
                          onMouseDown={(e) => handleDragStart(e, s)}
                          onClick={(e) => { e.stopPropagation(); handleEditSchedule(s); }}
                          className={cn(
                            'absolute left-1 right-1 rounded border-l-4 p-1.5 overflow-hidden cursor-move group',
                            colors.bg,
                            colors.border,
                            draggingSchedule?.id === s.id && 'opacity-50',
                            `h-[calc(${duration * 100}% - 4px)]`
                          )}
                          style={{ top: '2px' }}
                        >
                          <div className="flex items-center gap-1">
                            <GripVertical className={cn('w-3 h-3', colors.text)} />
                            <span className={cn('text-xs font-medium truncate', colors.text)}>
                              {user?.name || '未知'}
                            </span>
                          </div>
                          <p className={cn('text-xs truncate', colors.text)}>
                            {s.startTime}-{s.endTime}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                            className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-black/20"
                          >
                            <X className={cn('w-3 h-3', colors.text)} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-primary-900 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gold-400 font-serif">排班管理</h1>
          <p className="text-sm text-cream-400 mt-1">管理修复师和安保人员的工作排班</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-primary-800 rounded-lg border border-gold-500/20 p-1">
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'week'
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'text-cream-400 hover:text-cream-200'
              )}
            >
              <CalendarDays className="w-4 h-4" />
              周视图
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'month'
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'text-cream-400 hover:text-cream-200'
              )}
            >
              <Calendar className="w-4 h-4" />
              月视图
            </button>
          </div>
          <Button
            variant="primary"
            onClick={() => { setEditingSchedule(null); setFormData(initialFormData); setConflicts([]); setShowModal(true); }}
          >
            <Plus className="w-4 h-4" />
            新增排班
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="bg-primary-800 rounded-xl border border-gold-500/20 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigatePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToday}
                >
                  今天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <h2 className="text-lg font-bold text-cream-100">
                {viewMode === 'month'
                  ? currentDate.format('YYYY年 M月')
                  : `${currentDate.startOf('week').format('M月D日')} - ${currentDate.endOf('week').format('M月D日')}`
                }
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-cream-400">修复师</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-cream-400">安保</span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 bg-primary-800 rounded-xl border border-gold-500/20">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div onMouseUp={handleDragEnd}>
              {viewMode === 'month' ? renderMonthView() : renderWeekView()}
            </div>
          )}
        </div>

        <div className="w-72 flex-shrink-0">
          <div className="bg-primary-800 rounded-xl border border-gold-500/20 overflow-hidden sticky top-0">
            <div className="p-4 border-b border-gold-500/20">
              <h3 className="text-lg font-bold text-gold-400 font-serif">人员状态</h3>
              <p className="text-xs text-cream-400 mt-1">今天 ({dayjs().format('YYYY-MM-DD')})</p>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              <div className="p-3 border-b border-primary-700/30">
                <p className="text-sm font-medium text-cream-400 mb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  修复师 ({restorers.length})
                </p>
                <div className="space-y-2">
                  {restorers.length === 0 ? (
                    <p className="text-sm text-cream-500 py-2">暂无修复师</p>
                  ) : (
                    restorers.map(user => {
                      const status = getUserTodayStatus(user.id);
                      const todaySchedules = getDaySchedules(dayjs()).filter(s => s.userId === user.id);
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-primary-700/30 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedCollection(null);
                            setShowAssignModal(true);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-cream-200">{user.name}</p>
                              <p className="text-xs text-cream-500">{todaySchedules.length} 个排班</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn('w-2 h-2 rounded-full', status.dot)} />
                            <span className={cn('text-xs', status.className)}>{status.status}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-3">
                <p className="text-sm font-medium text-cream-400 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  安保人员 ({security.length})
                </p>
                <div className="space-y-2">
                  {security.length === 0 ? (
                    <p className="text-sm text-cream-500 py-2">暂无安保人员</p>
                  ) : (
                    security.map(user => {
                      const status = getUserTodayStatus(user.id);
                      const todaySchedules = getDaySchedules(dayjs()).filter(s => s.userId === user.id);
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-primary-700/30 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedCollection(null);
                            setShowAssignModal(true);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                              <Shield className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-cream-200">{user.name}</p>
                              <p className="text-xs text-cream-500">{todaySchedules.length} 个排班</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn('w-2 h-2 rounded-full', status.dot)} />
                            <span className={cn('text-xs', status.className)}>{status.status}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-3 border-t border-gold-500/20">
                <p className="text-sm font-medium text-cream-400 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gold-400" />
                  待分配藏品
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {collections.filter(c => !c.assignedRestorerId || !c.assignedSecurityId).slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      onClick={() => { setSelectedCollection(item); setShowAssignModal(true); }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-700/30 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded bg-primary-700 overflow-hidden flex-shrink-0 border border-gold-500/20">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cream-500">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cream-200 truncate">{item.name}</p>
                        <p className="text-xs text-cream-500">
                          {!item.assignedRestorerId && '缺修复师'}
                          {!item.assignedRestorerId && !item.assignedSecurityId && ' / '}
                          {!item.assignedSecurityId && '缺安保'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-primary-800 rounded-xl border border-gold-500/30 shadow-2xl shadow-gold-500/10 animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gold-500/20">
              <h2 className="text-xl font-bold text-gold-400 font-serif">
                {editingSchedule ? '编辑排班' : '新增排班'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-cream-400 hover:text-gold-400 transition-colors rounded-lg hover:bg-primary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">人员 *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                >
                  <option value="">请选择人员</option>
                  <optgroup label="修复师">
                    {restorers.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="安保人员">
                    {security.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">类型 *</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'restoration' }))}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors',
                      formData.type === 'restoration'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-primary-700/50 border-primary-600 text-cream-400 hover:border-blue-500/50'
                    )}
                  >
                    <UserCheck className="w-4 h-4" />
                    修复
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'security' }))}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors',
                      formData.type === 'security'
                        ? 'bg-green-500/20 border-green-500 text-green-300'
                        : 'bg-primary-700/50 border-primary-600 text-cream-400 hover:border-green-500/50'
                    )}
                  >
                    <Shield className="w-4 h-4" />
                    安保
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">日期 *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">开始时间 *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">结束时间 *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">关联藏品</label>
                <select
                  value={formData.collectionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, collectionId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                >
                  <option value="">不关联藏品</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">区域</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="如：一号展厅、文物库房等"
                  className="w-full px-4 py-2.5 bg-primary-700/50 border border-primary-600 rounded-lg text-cream-100 placeholder-cream-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>

              {conflicts.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-400">检测到时间冲突</p>
                      <ul className="mt-1 text-xs text-amber-300 space-y-1">
                        {conflicts.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gold-500/20">
              {editingSchedule && (
                <Button
                  variant="outline"
                  onClick={() => handleDelete(editingSchedule.id)}
                  className="border-accent-500 text-accent-400 hover:bg-accent-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </Button>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={!formData.userId || !formData.date || !formData.startTime || !formData.endTime}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingSchedule ? '保存修改' : '创建排班'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AssignPersonnelModal
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); setSelectedCollection(null); }}
        collectionId={selectedCollection?.id || null}
        collectionName={selectedCollection?.name}
        currentRestorerId={selectedCollection?.assignedRestorerId || null}
        currentSecurityId={selectedCollection?.assignedSecurityId || null}
        onAssigned={() => { fetchData(); setShowAssignModal(false); setSelectedCollection(null); }}
      />
    </div>
  );
}
