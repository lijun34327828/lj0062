import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { bookingsApi } from '@/services/api';
import type { Booking } from '../../../shared/types';

const statusConfig: Record<Booking['status'], { label: string; className: string; icon: typeof CheckCircle }> = {
  confirmed: {
    label: '已确认',
    className: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  pending: {
    label: '待确认',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: AlertTriangle,
  },
  cancelled: {
    label: '已取消',
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
};

export default function MyBookingsPage() {
  const [phone, setPhone] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!phone.trim()) return;

    setLoading(true);
    setSearchPhone(phone);
    try {
      const response = await bookingsApi.getMyBookings(phone);
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('查询预约失败:', err);
      setBookings([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleCancel = async (bookingId: number) => {
    setCancelLoading(bookingId);
    try {
      const response = await bookingsApi.cancel(bookingId, searchPhone);
      if (response.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
        );
        setShowConfirm(null);
      }
    } catch (err) {
      console.error('取消预约失败:', err);
      alert(err instanceof Error ? err.message : '取消失败，请稍后重试');
    } finally {
      setCancelLoading(null);
    }
  };

  const isBookingUpcoming = (booking: Booking) => {
    const bookingDateTime = dayjs(`${booking.date} ${booking.startTime}`);
    return bookingDateTime.isAfter(dayjs());
  };

  const canCancel = (booking: Booking) => {
    return booking.status !== 'cancelled' && isBookingUpcoming(booking);
  };

  return (
    <div className="min-h-screen bg-cream-50 animate-fade-in">
      <div className="bg-primary-800 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gold-400">
              我的预约
            </h1>
            <p className="text-cream-300 text-sm mt-1">
              输入手机号查询您的预约记录，可在线取消未开始的预约
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                <input
                  type="tel"
                  placeholder="请输入预约时使用的手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-cream-300 bg-white text-primary-800 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !phone.trim()}
                loading={loading}
                size="lg"
                className="min-w-32"
              >
                <Search className="w-5 h-5" />
                查询
              </Button>
            </div>
          </CardContent>
        </Card>

        {searched && !loading && bookings.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-cream-300 mb-4" />
            <h3 className="text-lg font-bold text-primary-800 mb-2">暂无预约记录</h3>
            <p className="text-cream-600">未查询到手机号 {searchPhone} 的预约记录</p>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-cream-600">
              共找到 <span className="font-bold text-primary-800">{bookings.length}</span> 条预约记录
            </p>

            {bookings.map((booking) => {
              const config = statusConfig[booking.status];
              const StatusIcon = config.icon;
              const showCancelButton = canCancel(booking);

              return (
                <Card key={booking.id} hoverable>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-primary-800 flex items-center gap-2">
                              {booking.exhibition?.name || '展厅预约'}
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {config.label}
                              </span>
                            </h3>
                            {booking.exhibition?.location && (
                              <p className="text-sm text-cream-600 mt-1 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {booking.exhibition.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-cream-700">
                            <Calendar className="w-4 h-4 text-gold-500 flex-shrink-0" />
                            <span>{dayjs(booking.date).format('YYYY年MM月DD日')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-cream-700">
                            <Clock className="w-4 h-4 text-gold-500 flex-shrink-0" />
                            <span>
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-cream-700">
                            <User className="w-4 h-4 text-gold-500 flex-shrink-0" />
                            <span>{booking.visitorName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-cream-700">
                            <Users className="w-4 h-4 text-gold-500 flex-shrink-0" />
                            <span>{booking.visitorCount} 人</span>
                          </div>
                          {booking.guide && (
                            <div className="flex items-center gap-2 text-cream-700">
                              <User className="w-4 h-4 text-gold-500 flex-shrink-0" />
                              <span>讲解：{booking.guide.name}</span>
                            </div>
                          )}
                        </div>

                        {!isBookingUpcoming(booking) && booking.status !== 'cancelled' && (
                          <p className="text-xs text-cream-500 italic">
                            该预约已开始或已结束
                          </p>
                        )}
                      </div>

                      {showCancelButton && (
                        <div className="md:border-l md:border-cream-200 md:pl-6">
                          <Button
                            variant="danger"
                            onClick={() => setShowConfirm(booking.id)}
                            disabled={cancelLoading !== null}
                            loading={cancelLoading === booking.id}
                          >
                            <X className="w-4 h-4" />
                            取消预约
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-800">确认取消预约</h3>
                <p className="text-sm text-cream-600">取消后该时段将被释放</p>
              </div>
            </div>

            <p className="text-cream-700 mb-6">
              您确定要取消这个预约吗？取消后如需再次参观请重新预约。
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(null)}
                disabled={cancelLoading !== null}
                fullWidth
              >
                再想想
              </Button>
              <Button
                variant="danger"
                onClick={() => handleCancel(showConfirm)}
                loading={cancelLoading === showConfirm}
                fullWidth
              >
                确认取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
