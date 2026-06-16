import { useState, useEffect } from 'react';
import {
  Wrench,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  Circle,
  X,
  FileText,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { tasksApi, collectionsApi } from '@/services/api';
import type { Schedule, CollectionItem } from '../../shared/types';

type TaskStatus = 'scheduled' | 'in-progress' | 'completed';

interface TaskWithCollection extends Schedule {
  collection?: CollectionItem;
}

interface CompleteForm {
  remark: string;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  scheduled: {
    label: '待开始',
    color: 'text-cream-400',
    bgColor: 'bg-cream-400/20',
  },
  'in-progress': {
    label: '进行中',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  completed: {
    label: '已完成',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
};

const mockTasks: TaskWithCollection[] = [
  {
    id: 1,
    userId: 1,
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '12:00',
    type: 'restoration',
    collectionId: 1,
    status: 'scheduled',
    collection: {
      id: 1,
      name: '青铜方鼎',
      category: '青铜器',
      description: '商代青铜鼎，国家一级文物',
      era: '商代',
      image: '',
      exhibitionId: 1,
      locationX: 0,
      locationY: 0,
      maintenanceCycle: 30,
      lastMaintenanceDate: '2024-12-15',
      nextMaintenanceDate: '2025-01-15',
      visitCount: 15000,
      status: 'normal',
    },
  },
  {
    id: 2,
    userId: 1,
    date: '2025-01-15',
    startTime: '14:00',
    endTime: '16:00',
    type: 'restoration',
    collectionId: 3,
    status: 'in-progress',
    collection: {
      id: 3,
      name: '青花瓷瓶',
      category: '瓷器',
      description: '明代青花瓷瓶，造型优美',
      era: '明代',
      image: '',
      exhibitionId: 2,
      locationX: 0,
      locationY: 0,
      maintenanceCycle: 60,
      lastMaintenanceDate: '2024-11-15',
      nextMaintenanceDate: '2025-01-15',
      visitCount: 12000,
      status: 'maintenance',
    },
  },
  {
    id: 3,
    userId: 1,
    date: '2025-01-14',
    startTime: '10:00',
    endTime: '11:30',
    type: 'restoration',
    collectionId: 2,
    status: 'completed',
    collection: {
      id: 2,
      name: '玉如意',
      category: '玉器',
      description: '清代玉如意，雕工精细',
      era: '清代',
      image: '',
      exhibitionId: 1,
      locationX: 0,
      locationY: 0,
      maintenanceCycle: 90,
      lastMaintenanceDate: '2024-10-14',
      nextMaintenanceDate: '2025-01-14',
      visitCount: 8000,
      status: 'normal',
    },
  },
  {
    id: 4,
    userId: 2,
    date: '2025-01-15',
    startTime: '08:00',
    endTime: '10:00',
    type: 'security',
    area: '一号展厅',
    status: 'scheduled',
  },
  {
    id: 5,
    userId: 2,
    date: '2025-01-14',
    startTime: '15:00',
    endTime: '17:00',
    type: 'security',
    area: '二号展厅',
    status: 'completed',
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithCollection[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithCollection | null>(null);
  const [completeForm, setCompleteForm] = useState<CompleteForm>({ remark: '' });
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await tasksApi.getMyTasks();
        if (res.success && res.data) {
          setTasks(res.data as TaskWithCollection[]);
        } else {
          setTasks(mockTasks);
        }
      } catch (err) {
        console.error('获取任务失败:', err);
        setTasks(mockTasks);
      }
    };
    fetchTasks();
  }, []);

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, TaskWithCollection[]>);

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => b.localeCompare(a));

  const handleStartTask = async (taskId: number) => {
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: 'in-progress' as const } : t
        )
      );
    } catch (err) {
      console.error('开始任务失败:', err);
    }
  };

  const handleOpenCompleteModal = (task: TaskWithCollection) => {
    setSelectedTask(task);
    setCompleteForm({ remark: '' });
    setShowCompleteModal(true);
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    try {
      const res = await tasksApi.completeTask(selectedTask.id);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTask.id ? { ...t, status: 'completed' as const } : t
          )
        );
      }
      setShowCompleteModal(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('完成任务失败:', err);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, status: 'completed' as const } : t
        )
      );
      setShowCompleteModal(false);
      setSelectedTask(null);
    }
  };

  const filteredDates = sortedDates.filter((date) => {
    if (filterStatus === 'all') return true;
    return groupedTasks[date].some((t) => t.status === filterStatus);
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return '明天';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天';
    }

    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 ${weekday}`;
  };

  const getTaskIcon = (type: string) => {
    if (type === 'restoration') {
      return <Wrench className="w-5 h-5" />;
    }
    return <Shield className="w-5 h-5" />;
  };

  const getStatusIcon = (status: TaskStatus) => {
    if (status === 'scheduled') {
      return <Circle className="w-4 h-4" />;
    } else if (status === 'in-progress') {
      return <PlayCircle className="w-4 h-4" />;
    }
    return <CheckCircle className="w-4 h-4" />;
  };

  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'scheduled', label: '待开始' },
    { key: 'in-progress', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ];

  return (
    <div className="min-h-screen bg-primary-900 p-4 lg:p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cream-100 font-serif">我的任务</h1>
            <p className="text-sm text-cream-400 mt-1">查看和处理您的工作任务</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-cream-400">筛选:</span>
            <div className="flex bg-primary-800 rounded-lg p-1 border border-gold-500/20">
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilterStatus(option.key as TaskStatus | 'all')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-all duration-200',
                    filterStatus === option.key
                      ? 'bg-gold-500 text-primary-900 font-medium'
                      : 'text-cream-400 hover:text-cream-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredDates.length === 0 ? (
            <div className="bg-primary-800 rounded-xl p-12 text-center border border-gold-500/20">
              <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gold-500" />
              </div>
              <p className="text-cream-200 font-medium">暂无任务</p>
              <p className="text-sm text-cream-500 mt-1">您当前没有需要处理的任务</p>
            </div>
          ) : (
            filteredDates.map((date) => {
              const dayTasks = groupedTasks[date].filter(
                (t) => filterStatus === 'all' || t.status === filterStatus
              );
              if (dayTasks.length === 0) return null;

              const isExpanded = expandedDate === date || expandedDate === null;
              const completedCount = dayTasks.filter((t) => t.status === 'completed').length;

              return (
                <div
                  key={date}
                  className="bg-primary-800 rounded-xl border border-gold-500/20 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedDate(isExpanded ? date : null)}
                    className="w-full flex items-center justify-between p-4 hover:bg-primary-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gold-500" />
                        <span className="text-lg font-semibold text-cream-100">
                          {formatDate(date)}
                        </span>
                        <span className="text-sm text-cream-500">{date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                          {dayTasks.length} 个任务
                        </span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          已完成 {completedCount}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-cream-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-cream-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-3 border-t border-gold-500/10">
                      {dayTasks.map((task) => {
                        const statusInfo = statusConfig[task.status];
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              'p-4 rounded-lg border transition-all duration-300',
                              task.status === 'completed'
                                ? 'bg-primary-900/50 border-green-500/20'
                                : task.status === 'in-progress'
                                ? 'bg-primary-700/50 border-blue-500/30 animate-pulse'
                                : 'bg-primary-700/30 border-gold-500/20 hover:border-gold-500/40'
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div
                                  className={cn(
                                    'p-2.5 rounded-lg',
                                    task.type === 'restoration'
                                      ? 'bg-gold-500/20 text-gold-400'
                                      : 'bg-blue-500/20 text-blue-400'
                                  )}
                                >
                                  {getTaskIcon(task.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-base font-semibold text-cream-100">
                                      {task.collection?.name || task.area}
                                    </h3>
                                    <span
                                      className={cn(
                                        'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
                                        statusInfo.bgColor,
                                        statusInfo.color
                                      )}
                                    >
                                      {getStatusIcon(task.status)}
                                      {statusInfo.label}
                                    </span>
                                    {task.collection && (
                                      <span className="px-2 py-0.5 bg-primary-600 text-cream-300 text-xs rounded-full">
                                        {task.collection.category}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-cream-400">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>
                                        {task.startTime} - {task.endTime}
                                      </span>
                                    </div>
                                    {task.collection && (
                                      <div className="flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        <span>{task.collection.era}</span>
                                      </div>
                                    )}
                                  </div>
                                  {task.collection && (
                                    <p className="text-sm text-cream-500 mt-2 line-clamp-2">
                                      {task.collection.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {task.status === 'scheduled' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStartTask(task.id)}
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    开始任务
                                  </Button>
                                )}
                                {task.status === 'in-progress' && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleOpenCompleteModal(task)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    完成任务
                                  </Button>
                                )}
                                {task.status === 'completed' && (
                                  <div className="flex items-center gap-1 text-green-400 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>已完成</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800 rounded-xl border border-gold-500/20 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gold-500/20">
              <h3 className="text-lg font-semibold text-cream-100">完成任务</h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-cream-400 hover:text-cream-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-primary-900/50 rounded-lg p-4 border border-gold-500/10">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      selectedTask.type === 'restoration'
                        ? 'bg-gold-500/20 text-gold-400'
                        : 'bg-blue-500/20 text-blue-400'
                    )}
                  >
                    {getTaskIcon(selectedTask.type)}
                  </div>
                  <div>
                    <p className="font-medium text-cream-100">
                      {selectedTask.collection?.name || selectedTask.area}
                    </p>
                    <p className="text-sm text-cream-500">
                      {selectedTask.startTime} - {selectedTask.endTime}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-cream-300 mb-1">任务备注</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-3 text-cream-400" />
                  <textarea
                    value={completeForm.remark}
                    onChange={(e) => setCompleteForm({ remark: e.target.value })}
                    placeholder="请填写任务完成情况备注（可选）"
                    rows={4}
                    className="w-full bg-primary-700 text-cream-100 border border-gold-500/30 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gold-500/20">
              <Button variant="outline" size="sm" onClick={() => setShowCompleteModal(false)}>
                取消
              </Button>
              <Button size="sm" onClick={handleCompleteTask}>
                确认完成
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
