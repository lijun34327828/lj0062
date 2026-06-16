import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Home,
  Ticket,
  Sparkles,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useBookingStore } from '@/store/bookingStore';

export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const {
    selectedExhibition,
    selectedDate,
    selectedTimeSlot,
    selectedGuide,
    visitorInfo,
    resetBooking,
  } = useBookingStore();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!selectedExhibition || !selectedDate || !selectedTimeSlot) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-gold-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-800 mb-2">暂无预约信息</h2>
          <p className="text-cream-600 mb-4">请先完成预约流程</p>
          <button
            onClick={() => navigate('/visitor')}
            className="px-6 py-2 bg-gold-500 text-primary-900 font-bold rounded-lg hover:bg-gold-400 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleBackHome = () => {
    resetBooking();
    navigate('/visitor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-800 via-primary-700 to-cream-50 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className={`text-center transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gold-400 rounded-full blur-2xl opacity-50 animate-pulse-slow" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-gold-300 animate-bounce" />
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 mb-4">
            预约成功！
          </h1>
          <p className="text-cream-300 text-lg mb-8">
            您的博物馆参观预约已确认，请按时前往
          </p>
        </div>

        <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-primary-900 font-semibold">预约编号</span>
              <span className="text-primary-900 font-bold text-xl tracking-wider">
                #{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-cream-200">
              <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-cream-500">展厅</p>
                <p className="font-semibold text-primary-800">
                  {selectedExhibition.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-cream-200">
              <Calendar className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-cream-500">日期</p>
                <p className="font-semibold text-primary-800">
                  {dayjs(selectedDate).format('YYYY年MM月DD日')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-cream-200">
              <Clock className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-cream-500">时段</p>
                <p className="font-semibold text-primary-800">
                  {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </p>
              </div>
            </div>

            {selectedGuide && (
              <div className="flex items-start gap-4 pb-4 border-b border-cream-200">
                <User className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-cream-500">讲解人员</p>
                  <p className="font-semibold text-primary-800">
                    {selectedGuide.name}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 pb-4 border-b border-cream-200">
              <Users className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-cream-500">参观人数</p>
                <p className="font-semibold text-primary-800">
                  {visitorInfo.count} 人
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <User className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-cream-500">访客信息</p>
                <p className="font-semibold text-primary-800">
                  {visitorInfo.name}
                </p>
                <p className="text-sm text-cream-600">
                  {visitorInfo.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-cream-50 px-6 py-4">
            <div className="flex items-start gap-3 text-sm text-cream-600">
              <Sparkles className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-primary-700">温馨提示</p>
                <ul className="mt-1 space-y-1">
                  <li>• 请提前15分钟到达博物馆入口处</li>
                  <li>• 入馆时请出示预约编号或手机号</li>
                  <li>• 开放时间：09:00-17:00（16:30停止入馆）</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-8 text-center transition-all duration-700 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button
            onClick={handleBackHome}
            className="group px-10 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 font-bold text-lg rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg hover:shadow-gold-500/30 hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <Home className="w-5 h-5" />
            返回首页
          </button>
        </div>

        <div className={`mt-8 text-center text-cream-400 text-sm transition-all duration-700 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <p>预约确认短信已发送至您的手机，请注意查收</p>
          <p className="mt-2">感谢您的预约，期待您的光临！</p>
        </div>
      </div>
    </div>
  );
}
