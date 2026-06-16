import { useState, useEffect } from 'react';
import { X, UserCheck, Shield, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { usersApi, schedulesApi } from '@/services/api';
import type { User, Schedule } from '../../shared/types';

interface AssignPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number | null;
  collectionName?: string;
  currentRestorerId?: number | null;
  currentSecurityId?: number | null;
  onAssigned?: () => void;
}

export default function AssignPersonnelModal({
  isOpen,
  onClose,
  collectionId,
  collectionName,
  currentRestorerId,
  currentSecurityId,
  onAssigned,
}: AssignPersonnelModalProps) {
  const [restorers, setRestorers] = useState<User[]>([]);
  const [security, setSecurity] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedRestorerId, setSelectedRestorerId] = useState<number | null>(null);
  const [selectedSecurityId, setSelectedSecurityId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedRestorerId(currentRestorerId || null);
      setSelectedSecurityId(currentSecurityId || null);
      fetchData();
    }
  }, [isOpen, collectionId, currentRestorerId, currentSecurityId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, schedulesRes] = await Promise.all([
        usersApi.getList(),
        schedulesApi.getList(),
      ]);

      if (usersRes.success && usersRes.data) {
        setRestorers(usersRes.data.filter(u => u.role === 'restorer'));
        setSecurity(usersRes.data.filter(u => u.role === 'security'));
      }
      if (schedulesRes.success && schedulesRes.data) {
        setSchedules(schedulesRes.data);
      }
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserSchedules = (userId: number, type: 'restoration' | 'security') => {
    const today = dayjs().format('YYYY-MM-DD');
    const nextWeek = dayjs().add(7, 'day').format('YYYY-MM-DD');
    return schedules.filter(
      s => s.userId === userId &&
        s.type === type &&
        dayjs(s.date).isAfter(today) &&
        dayjs(s.date).isBefore(nextWeek)
    );
  };

  const hasConflict = (userId: number, type: 'restoration' | 'security') => {
    return getUserSchedules(userId, type).length > 0;
  };

  const handleSubmit = async () => {
    if (!collectionId) return;
    setSubmitting(true);
    try {
      const res = await schedulesApi.assignPersonnel({
        collectionId,
        restorerId: selectedRestorerId || undefined,
        securityId: selectedSecurityId || undefined,
      });
      if (res.success) {
        onAssigned?.();
        onClose();
      }
    } catch (err) {
      console.error('分配人员失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-primary-800 rounded-xl border border-gold-500/30 shadow-2xl shadow-gold-500/10 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gold-500/20">
          <div>
            <h2 className="text-xl font-bold text-gold-400 font-serif">分配人员</h2>
            {collectionName && (
              <p className="text-sm text-cream-400 mt-1">藏品：{collectionName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-cream-400 hover:text-gold-400 transition-colors rounded-lg hover:bg-primary-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-cream-200 mb-3">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  修复师
                </label>
                <div className="space-y-3">
                  {restorers.length === 0 ? (
                    <div className="text-sm text-cream-500 py-4 text-center bg-primary-700/50 rounded-lg">
                      暂无修复师可用
                    </div>
                  ) : (
                    restorers.map(user => {
                      const conflict = hasConflict(user.id, 'restoration');
                      const isSelected = selectedRestorerId === user.id;
                      const userSchedules = getUserSchedules(user.id, 'restoration');
                      return (
                        <div
                          key={user.id}
                          onClick={() => setSelectedRestorerId(isSelected ? null : user.id)}
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                            isSelected
                              ? 'border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/10'
                              : 'border-primary-600 bg-primary-700/30 hover:border-gold-500/50 hover:bg-primary-700/50'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-cream-100">{user.name}</p>
                                <p className="text-xs text-cream-400">{user.phone || '暂无电话'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {conflict && (
                                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                                  <AlertCircle className="w-3 h-3" />
                                  本周有排班
                                </span>
                              )}
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-gold-400" />
                              )}
                            </div>
                          </div>
                          {userSchedules.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-primary-600">
                              <p className="text-xs text-cream-400 mb-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                未来7天排班：
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {userSchedules.slice(0, 5).map(s => (
                                  <span
                                    key={s.id}
                                    className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded"
                                  >
                                    {dayjs(s.date).format('MM-DD')} {s.startTime}-{s.endTime}
                                  </span>
                                ))}
                                {userSchedules.length > 5 && (
                                  <span className="text-xs text-cream-500 px-2 py-1">
                                    +{userSchedules.length - 5} 更多
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-cream-200 mb-3">
                  <Shield className="w-4 h-4 text-green-400" />
                  安保人员
                </label>
                <div className="space-y-3">
                  {security.length === 0 ? (
                    <div className="text-sm text-cream-500 py-4 text-center bg-primary-700/50 rounded-lg">
                      暂无安保人员可用
                    </div>
                  ) : (
                    security.map(user => {
                      const conflict = hasConflict(user.id, 'security');
                      const isSelected = selectedSecurityId === user.id;
                      const userSchedules = getUserSchedules(user.id, 'security');
                      return (
                        <div
                          key={user.id}
                          onClick={() => setSelectedSecurityId(isSelected ? null : user.id)}
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                            isSelected
                              ? 'border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/10'
                              : 'border-primary-600 bg-primary-700/30 hover:border-gold-500/50 hover:bg-primary-700/50'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-cream-100">{user.name}</p>
                                <p className="text-xs text-cream-400">{user.phone || '暂无电话'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {conflict && (
                                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                                  <AlertCircle className="w-3 h-3" />
                                  本周有排班
                                </span>
                              )}
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-gold-400" />
                              )}
                            </div>
                          </div>
                          {userSchedules.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-primary-600">
                              <p className="text-xs text-cream-400 mb-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                未来7天排班：
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {userSchedules.slice(0, 5).map(s => (
                                  <span
                                    key={s.id}
                                    className="text-xs bg-green-500/10 text-green-300 px-2 py-1 rounded"
                                  >
                                    {dayjs(s.date).format('MM-DD')} {s.startTime}-{s.endTime}
                                  </span>
                                ))}
                                {userSchedules.length > 5 && (
                                  <span className="text-xs text-cream-500 px-2 py-1">
                                    +{userSchedules.length - 5} 更多
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gold-500/20">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!selectedRestorerId && !selectedSecurityId}
          >
            <CheckCircle2 className="w-4 h-4" />
            确认分配
          </Button>
        </div>
      </div>
    </div>
  );
}
