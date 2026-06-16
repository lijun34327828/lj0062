import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Archive,
  AlertTriangle,
  Bell,
  Clock,
  Shield,
  Wrench,
  ChevronRight,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/Button';
import CollectionMap from '@/components/CollectionMap';
import { useAuthStore } from '@/store/authStore';
import {
  collectionsApi,
  exhibitionsApi,
  bookingsApi,
  statisticsApi,
  usersApi,
  schedulesApi,
} from '@/services/api';
import type {
  CollectionItem,
  Exhibition,
  Booking,
  MaintenanceAlert,
  User,
} from '../../../shared/types';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: 'gold' | 'green' | 'accent' | 'blue';
}

const StatCard = ({ title, value, icon, trend, trendValue, color }: StatCardProps) => {
  const colorClasses = {
    gold: 'from-gold-500/20 to-gold-600/10 border-gold-500/50 text-gold-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/50 text-green-400',
    accent: 'from-accent-500/20 to-accent-600/10 border-accent-500/50 text-accent-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/50 text-blue-400',
  };

  return (
    <div className={cn(
      'relative bg-gradient-to-br rounded-xl p-6 border backdrop-blur-sm',
      'animate-fade-in transition-all duration-300 hover:scale-[1.02]',
      colorClasses[color]
    )}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-cream-400 text-sm mb-2">{title}</p>
          <p className="text-4xl font-bold text-cream-100">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-accent-400" />
              )}
              <span className={cn(
                'text-xs',
                trend === 'up' ? 'text-green-400' : 'text-accent-400'
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg bg-current/10',
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const bookingChartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [restorers, setRestorers] = useState<User[]>([]);
  const [securityStaff, setSecurityStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [assigningCollection, setAssigningCollection] = useState<CollectionItem | null>(null);
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          collectionsRes,
          exhibitionsRes,
          bookingsRes,
          alertsRes,
          usersRes,
        ] = await Promise.all([
          collectionsApi.getList(),
          exhibitionsApi.getList(),
          bookingsApi.getList(),
          collectionsApi.getMaintenanceAlerts(),
          usersApi.getList(),
        ]);

        if (collectionsRes.success && collectionsRes.data) {
          setCollections(collectionsRes.data);
        }
        if (exhibitionsRes.success && exhibitionsRes.data) {
          setExhibitions(exhibitionsRes.data);
        }
        if (bookingsRes.success && bookingsRes.data) {
          setBookings(bookingsRes.data);
        }
        if (alertsRes.success && alertsRes.data) {
          setMaintenanceAlerts(alertsRes.data);
          const urgentAlerts = alertsRes.data.filter(a => a.level === 'urgent');
          if (urgentAlerts.length > 0) {
            setTimeout(() => setShowAlertModal(true), 500);
          }
        }
        if (usersRes.success && usersRes.data) {
          setRestorers(usersRes.data.filter(u => u.role === 'restorer'));
          setSecurityStaff(usersRes.data.filter(u => u.role === 'security'));
        }
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!bookingChartRef.current || bookings.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(bookingChartRef.current);
    }

    const last7Days = Array.from({ length: 7 }, (_, i) =>
      dayjs().subtract(6 - i, 'day').format('MM-DD')
    );

    const bookingCounts = last7Days.map(date => {
      const dayStart = dayjs(date, 'MM-DD').format('YYYY-MM-DD');
      return bookings.filter(b => b.date === dayStart).length;
    });

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: last7Days,
        axisLine: { lineStyle: { color: '#558080' } },
        axisLabel: { color: '#B8B0A0', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#558080' } },
        axisLabel: { color: '#B8B0A0', fontSize: 11 },
        splitLine: { lineStyle: { color: '#1A3A3A', type: 'dashed' } },
      },
      series: [
        {
          data: bookingCounts,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#C9A962',
            width: 3,
            shadowColor: 'rgba(201, 169, 98, 0.5)',
            shadowBlur: 10,
          },
          itemStyle: {
            color: '#C9A962',
            borderColor: '#FAF7EF',
            borderWidth: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(201, 169, 98, 0.3)' },
              { offset: 1, color: 'rgba(201, 169, 98, 0.05)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [bookings]);

  const todayBookings = bookings.filter(b => b.date === dayjs().format('YYYY-MM-DD')).length;
  const pendingAlerts = maintenanceAlerts.filter(a => !a.acknowledged).length;
  const urgentAlerts = maintenanceAlerts.filter(a => a.level === 'urgent');

  const handleAssignRestorer = async (collectionId: number, restorerId: number) => {
    try {
      const response = await schedulesApi.create({
        userId: restorerId,
        date: dayjs().format('YYYY-MM-DD'),
        startTime: '09:00',
        endTime: '12:00',
        type: 'restoration',
        collectionId,
      });

      if (response.success) {
        await collectionsApi.update(collectionId, {
          assignedRestorerId: restorerId,
          status: 'maintenance',
        });
        setAssigningCollection(null);
        const collectionsRes = await collectionsApi.getList();
        if (collectionsRes.success && collectionsRes.data) {
          setCollections(collectionsRes.data);
        }
        const alertsRes = await collectionsApi.getMaintenanceAlerts();
        if (alertsRes.success && alertsRes.data) {
          setMaintenanceAlerts(alertsRes.data);
        }
      }
    } catch (err) {
      console.error('分配修复师失败:', err);
    }
  };

  const getMaintenanceStatusColor = (level: string) => {
    switch (level) {
      case 'overdue':
        return 'border-accent-500 bg-accent-900/30';
      case 'urgent':
        return 'border-accent-500/70 bg-accent-900/20';
      case 'warning':
        return 'border-gold-500/70 bg-gold-900/20';
      default:
        return 'border-gold-500/30 bg-primary-800/50';
    }
  };

  const isPulseAnimation = (alert: MaintenanceAlert) => {
    return alert.level === 'urgent' || alert.level === 'overdue';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="text-gold-400 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900 text-cream-200 p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
              管理大屏
            </h1>
            <p className="text-cream-500 mt-1">欢迎回来，{user?.name || '管理员'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-cream-400 text-sm">
              <Clock className="w-4 h-4 inline mr-2" />
              {currentTime}
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-gold-400 cursor-pointer" />
              {pendingAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
                  {pendingAlerts}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="今日预约"
          value={todayBookings}
          icon={<Calendar className="w-6 h-6" />}
          trend="up"
          trendValue="较昨日 +12%"
          color="gold"
        />
        <StatCard
          title="在馆人数"
          value="156"
          icon={<Users className="w-6 h-6" />}
          trend="up"
          trendValue="较昨日 +8%"
          color="green"
        />
        <StatCard
          title="藏品总数"
          value={collections.length}
          icon={<Archive className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="待处理预警"
          value={pendingAlerts}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend="down"
          trendValue="较昨日 -3"
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-primary-800/50 rounded-xl border border-gold-500/30 p-4 h-[500px]">
            <h2 className="text-xl font-serif font-bold text-gold-400 mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5" />
              藏品分布图
            </h2>
            <CollectionMap
              collections={collections}
              exhibitions={exhibitions}
            />
          </div>
        </div>

        <div className="bg-primary-800/50 rounded-xl border border-gold-500/30 p-4 h-[500px] overflow-hidden flex flex-col">
          <h2 className="text-xl font-serif font-bold text-gold-400 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            养护预警列表
            {urgentAlerts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-accent-500/80 text-white text-xs rounded-full animate-pulse">
                {urgentAlerts.length} 紧急
              </span>
            )}
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {maintenanceAlerts.slice(0, 10).map((alert, index) => (
              <div
                key={alert.id}
                className={cn(
                  'relative p-4 rounded-lg border transition-all duration-300',
                  'hover:border-gold-400 cursor-pointer group',
                  getMaintenanceStatusColor(alert.level),
                  isPulseAnimation(alert) && 'animate-pulse-slow'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {isPulseAnimation(alert) && (
                  <div className="absolute inset-0 rounded-lg border-2 border-accent-500 animate-ping opacity-30" />
                )}
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-cream-100">{alert.collectionName}</h3>
                      {alert.level === 'urgent' && (
                        <AlertTriangle className="w-4 h-4 text-accent-400" />
                      )}
                    </div>
                    <p className="text-xs text-cream-500 mt-1">
                      下次养护: {dayjs(alert.nextMaintenanceDate).format('YYYY-MM-DD')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        alert.level === 'overdue' ? 'bg-accent-500 text-white' :
                        alert.level === 'urgent' ? 'bg-accent-500/80 text-white' :
                        'bg-gold-500/80 text-primary-900'
                      )}>
                        {alert.level === 'overdue' ? '已逾期' :
                         alert.level === 'urgent' ? `还剩 ${alert.daysUntil} 天` :
                         `还剩 ${alert.daysUntil} 天`}
                      </span>
                      {alert.collection?.assignedRestorer && (
                        <span className="text-xs text-cream-500">
                          修复师: {alert.collection.assignedRestorer.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssigningCollection(alert.collection || null);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    分配修复师
                  </Button>
                </div>
              </div>
            ))}
            {maintenanceAlerts.length === 0 && (
              <div className="text-center py-12 text-cream-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无养护预警</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary-800/50 rounded-xl border border-gold-500/30 p-4 h-[300px]">
          <h2 className="text-xl font-serif font-bold text-gold-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            近7日预约趋势
          </h2>
          <div ref={bookingChartRef} className="w-full h-[220px]" />
        </div>

        <div className="bg-primary-800/50 rounded-xl border border-gold-500/30 p-4 h-[300px] overflow-hidden">
          <h2 className="text-xl font-serif font-bold text-gold-400 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            安保在岗情况
          </h2>
          <div className="space-y-3 overflow-y-auto h-[220px] pr-2">
            {securityStaff.map((staff, index) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-3 bg-primary-700/50 rounded-lg border border-gold-500/20 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-gold-400 font-bold">
                      {staff.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-primary-800" />
                  </div>
                  <div>
                    <p className="font-medium text-cream-200">{staff.name}</p>
                    <p className="text-xs text-cream-500">在岗中</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-cream-300">
                    {['一号展厅', '二号展厅', '三号展厅', '四号展厅'][index % 4]}
                  </p>
                  <p className="text-xs text-cream-500">09:00 - 17:00</p>
                </div>
              </div>
            ))}
            {securityStaff.length === 0 && (
              <div className="text-center py-8 text-cream-500">
                <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>暂无安保人员</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAlertModal && urgentAlerts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-primary-800 border-2 border-accent-500 rounded-t-2xl p-6 w-full max-w-2xl mx-4 mb-0 animate-slide-up shadow-2xl shadow-accent-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-accent-400">紧急养护提醒</h3>
                  <p className="text-cream-500 text-sm">发现 {urgentAlerts.length} 件藏品需要紧急养护</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-cream-500 hover:text-cream-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {urgentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-accent-900/30 rounded-lg border border-accent-500/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={alert.collection?.image}
                      alt={alert.collectionName}
                      className="w-12 h-12 rounded-lg object-cover border border-accent-500/30"
                    />
                    <div>
                      <p className="font-medium text-cream-100">{alert.collectionName}</p>
                      <p className="text-xs text-accent-400">
                        逾期 {Math.abs(alert.daysUntil)} 天
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setAssigningCollection(alert.collection || null);
                      setShowAlertModal(false);
                    }}
                  >
                    立即处理
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAlertModal(false)}>
                稍后处理
              </Button>
              <Button variant="danger" onClick={() => navigate('/tasks')}>
                查看全部任务
              </Button>
            </div>
          </div>
        </div>
      )}

      {assigningCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-primary-800 border-2 border-gold-500/50 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-gold-500/20 animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl font-serif font-bold text-gold-400">分配修复师</h3>
              <button
                onClick={() => setAssigningCollection(null)}
                className="text-cream-500 hover:text-cream-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-primary-700/50 rounded-lg border border-gold-500/30">
              <div className="flex items-center gap-3">
                <img
                  src={assigningCollection.image}
                  alt={assigningCollection.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gold-500/30"
                />
                <div>
                  <p className="font-bold text-cream-100">{assigningCollection.name}</p>
                  <p className="text-sm text-cream-500">{assigningCollection.era} · {assigningCollection.category}</p>
                  <p className="text-xs text-accent-400 mt-1">
                    下次养护: {dayjs(assigningCollection.nextMaintenanceDate).format('YYYY-MM-DD')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
              {restorers.map((restorer) => (
                <button
                  key={restorer.id}
                  onClick={() => handleAssignRestorer(assigningCollection.id, restorer.id)}
                  className="w-full flex items-center justify-between p-3 bg-primary-700/30 rounded-lg border border-gold-500/20 hover:border-gold-400 hover:bg-primary-700/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-primary-900 font-bold">
                      {restorer.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-cream-200">{restorer.name}</p>
                      <p className="text-xs text-cream-500">{restorer.phone || '暂无电话'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gold-400" />
                </button>
              ))}
              {restorers.length === 0 && (
                <div className="text-center py-8 text-cream-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>暂无可用修复师</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={() => setAssigningCollection(null)}
            >
              取消
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #152E2E;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #558080;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #729696;
        }
      `}</style>
    </div>
  );
}
