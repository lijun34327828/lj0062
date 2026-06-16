import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Users,
  Phone,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useBookingStore } from '@/store/bookingStore';

export default function BookingConfirmPage() {
  const navigate = useNavigate();
  const {
    selectedExhibition,
    selectedDate,
    selectedTimeSlot,
    selectedGuide,
    visitorInfo,
    setVisitorInfo,
    submitBooking,
  } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  if (!selectedExhibition || !selectedDate || !selectedTimeSlot) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gold-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-800 mb-2">预约信息不完整</h2>
          <p className="text-cream-600 mb-4">请先完成预约信息的选择</p>
          <button
            onClick={() => navigate('/visitor/booking')}
            className="px-6 py-2 bg-gold-500 text-primary-900 font-bold rounded-lg hover:bg-gold-400 transition-colors"
          >
            返回预约
          </button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!visitorInfo.name.trim()) {
      newErrors.name = '请输入访客姓名';
    }
    if (!visitorInfo.phone.trim()) {
      newErrors.phone = '请输入手机号码';
    } else if (!/^1[3-9]\d{9}$/.test(visitorInfo.phone)) {
      newErrors.phone = '请输入正确的手机号码';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await submitBooking();
      if (result.success) {
        navigate('/visitor/booking/success');
      } else {
        alert(result.message || '创建预约失败，请重试');
      }
    } catch (err) {
      console.error('创建预约失败:', err);
      alert(err instanceof Error ? err.message : '创建预约失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 animate-fade-in">
      <div className="bg-primary-800 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/visitor/booking')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gold-400">
              确认预约信息
            </h1>
            <p className="text-cream-300 text-sm mt-1">
              请仔细核对以下信息，确认无误后提交
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary-800 mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-gold-500" />
                预约详情
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-cream-200">
                  <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-cream-500">展厅</p>
                    <p className="font-semibold text-primary-800">{selectedExhibition.name}</p>
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
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            selectedGuide.avatar ||
                            `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20museum%20guide%20portrait&image_size=square`
                          }
                          alt={selectedGuide.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <p className="font-semibold text-primary-800">{selectedGuide.name}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <Users className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-cream-500">参观人数</p>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => setVisitorInfo({ count: Math.max(1, visitorInfo.count - 1) })}
                        className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-primary-800 font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="font-semibold text-primary-800 text-lg w-8 text-center">
                        {visitorInfo.count}
                      </span>
                      <button
                        onClick={() => setVisitorInfo({ count: Math.min(selectedExhibition.capacity, visitorInfo.count + 1) })}
                        className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-primary-800 font-bold transition-colors"
                      >
                        +
                      </button>
                      <span className="text-sm text-cream-500">
                        (最多 {selectedExhibition.capacity} 人)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gold-50 to-cream-50 rounded-xl shadow-lg p-6">
            <img
              src={
                selectedExhibition.coverImage ||
                `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
                  `museum exhibition ${selectedExhibition.name}`
                )}&image_size=landscape_4_3`
              }
              alt={selectedExhibition.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="font-bold text-primary-800 text-lg">{selectedExhibition.name}</h3>
            <p className="text-sm text-cream-600 mt-2">{selectedExhibition.location}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-primary-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-gold-500" />
            访客信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                访客姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={visitorInfo.name}
                onChange={(e) => setVisitorInfo({ name: e.target.value })}
                placeholder="请输入您的姓名"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-cream-200 focus:border-gold-500'
                } outline-none`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                手机号码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={visitorInfo.phone}
                  onChange={(e) => setVisitorInfo({ phone: e.target.value })}
                  placeholder="请输入手机号码"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.phone
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-cream-200 focus:border-gold-500'
                  } outline-none`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => navigate('/visitor/booking')}
            className="px-8 py-3 border-2 border-cream-300 text-primary-700 font-bold rounded-lg hover:bg-cream-100 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            返回修改
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 font-bold rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg hover:shadow-gold-500/30 hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                确认提交
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
