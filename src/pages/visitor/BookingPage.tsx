import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Users,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Star,
  ArrowLeft,
} from 'lucide-react';
import dayjs from 'dayjs';
import { exhibitionsApi, guidesApi, bookingsApi } from '@/services/api';
import { useBookingStore } from '@/store/bookingStore';
import type { Exhibition, TimeSlot, User as UserType, BookingCheckResponse } from '../../../shared/types';

export default function BookingPage() {
  const navigate = useNavigate();
  const {
    selectedExhibition,
    selectedDate,
    selectedTimeSlot,
    selectedGuide,
    selectExhibition,
    selectDate,
    selectTimeSlot,
    selectGuide,
  } = useBookingStore();

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [guides, setGuides] = useState<UserType[]>([]);
  const [conflict, setConflict] = useState<BookingCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [calendarDays, setCalendarDays] = useState<dayjs.Dayjs[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await exhibitionsApi.getList();
        if (response.success && response.data) {
          setExhibitions(response.data);
        }
      } catch (err) {
        console.error('获取展厅列表失败:', err);
      }
    };
    fetchExhibitions();

    const fetchGuides = async () => {
      try {
        const response = await guidesApi.getList();
        if (response.success && response.data) {
          setGuides(response.data);
        }
      } catch (err) {
        console.error('获取讲解人员列表失败:', err);
      }
    };
    fetchGuides();
  }, []);

  useEffect(() => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDay = startOfMonth.day();
    const days: dayjs.Dayjs[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(startOfMonth.subtract(startDay - i, 'day'));
    }

    let day = startOfMonth;
    while (day.isBefore(endOfMonth) || day.isSame(endOfMonth, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(endOfMonth.add(i, 'day'));
    }

    setCalendarDays(days);
  }, [currentMonth]);

  useEffect(() => {
    if (selectedExhibition && selectedDate) {
      const fetchTimeSlots = async () => {
        try {
          const response = await exhibitionsApi.getTimeslots(selectedExhibition.id, selectedDate);
          if (response.success && response.data) {
            setTimeSlots(response.data);
          }
        } catch (err) {
          console.error('获取时段列表失败:', err);
        }
      };
      fetchTimeSlots();
    }
  }, [selectedExhibition, selectedDate]);

  useEffect(() => {
    const checkConflict = async () => {
      if (selectedExhibition && selectedDate && selectedTimeSlot) {
        setLoading(true);
        try {
          const response = await bookingsApi.checkConflict({
            exhibitionId: selectedExhibition.id,
            guideId: selectedGuide?.id,
            date: selectedDate,
            startTime: selectedTimeSlot.startTime,
            endTime: selectedTimeSlot.endTime,
          });
          if (response.success && response.data) {
            setConflict(response.data as BookingCheckResponse);
          }
        } catch (err) {
          console.error('检查时段冲突失败:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setConflict(null);
      }
    };
    checkConflict();
  }, [selectedExhibition, selectedDate, selectedTimeSlot, selectedGuide]);

  const handleDateSelect = (day: dayjs.Dayjs) => {
    if (day.isBefore(dayjs(), 'day')) return;
    selectDate(day.format('YYYY-MM-DD'));
    selectTimeSlot(null);
  };

  const canProceed =
    selectedExhibition &&
    selectedDate &&
    selectedTimeSlot &&
    !loading &&
    (!conflict || conflict.available);

  const handleNext = () => {
    if (canProceed) {
      navigate('/visitor/booking/confirm');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 animate-fade-in">
      <div className="bg-primary-800 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/visitor')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gold-400">
              展厅预约
            </h1>
            <p className="text-cream-300 text-sm mt-1">
              选择展厅、日期和时段，开启您的博物馆之旅
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold-500" />
                选择展厅
              </h2>
              <div className="space-y-3">
                {exhibitions.map((exhibition) => (
                  <div
                    key={exhibition.id}
                    onClick={() => {
                      selectExhibition(exhibition);
                      selectTimeSlot(null);
                    }}
                    className={`group cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedExhibition?.id === exhibition.id
                        ? 'border-gold-500 bg-gold-50 shadow-md'
                        : 'border-cream-200 hover:border-gold-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          exhibition.coverImage ||
                          `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
                            `museum exhibition ${exhibition.name}`
                          )}&image_size=square`
                        }
                        alt={exhibition.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-primary-800 group-hover:text-gold-600 transition-colors">
                          {exhibition.name}
                        </h3>
                        <p className="text-sm text-cream-600 mt-1">
                          {exhibition.location}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-cream-500">
                          <Users className="w-3 h-3" />
                          <span>容纳 {exhibition.capacity} 人</span>
                        </div>
                      </div>
                      {selectedExhibition?.id === exhibition.id && (
                        <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-500" />
                选择日期
              </h2>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h3 className="text-lg font-semibold text-primary-800">
                  {currentMonth.format('YYYY年MM月')}
                </h3>
                <button
                  onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-cream-500 py-2"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => {
                  const isPast = day.isBefore(dayjs(), 'day');
                  const isSelected = selectedDate === day.format('YYYY-MM-DD');
                  const isCurrentMonth = day.isSame(currentMonth, 'month');
                  const isToday = day.isSame(dayjs(), 'day');

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day)}
                      disabled={isPast || !isCurrentMonth}
                      className={`py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        !isCurrentMonth
                          ? 'text-cream-300'
                          : isPast
                          ? 'text-cream-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg'
                          : isToday
                          ? 'bg-gold-100 text-gold-700 hover:bg-gold-200'
                          : 'hover:bg-cream-100 text-primary-700'
                      }`}
                    >
                      {day.date()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-500" />
                选择时段
              </h2>
              {selectedExhibition && selectedDate ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot?.id === slot.id;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => slot.isAvailable && selectTimeSlot(slot)}
                        disabled={!slot.isAvailable}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                          !slot.isAvailable
                            ? 'bg-cream-200 text-cream-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg'
                            : 'bg-cream-50 text-primary-700 hover:bg-gold-100 hover:text-gold-700 border border-cream-200'
                        }`}
                      >
                        {slot.startTime}
                        <div className="text-xs mt-1 opacity-75">
                          {slot.isAvailable ? '可预约' : '已约满'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-cream-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>请先选择展厅和日期</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gold-500" />
                选择讲解人员
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guides.map((guide) => {
                  const isSelected = selectedGuide?.id === guide.id;

                  return (
                    <div
                      key={guide.id}
                      onClick={() => selectGuide(isSelected ? null : guide)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-gold-500 bg-gold-50 shadow-md'
                          : 'border-cream-200 hover:border-gold-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              guide.avatar ||
                              `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
                                `professional chinese museum guide portrait`
                              )}&image_size=square`
                            }
                            alt={guide.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-primary-800">{guide.name}</h3>
                            <div className="flex items-center gap-1 text-gold-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm">{guide.rating || '4.9'}</span>
                            </div>
                          </div>
                          <p className="text-sm text-cream-600 mt-1 line-clamp-1">
                            {guide.bio || '资深讲解员，专业知识丰富'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-cream-500 mt-4 text-center">
                可选，无需讲解可跳过此项
              </p>
            </div>

            {conflict && !conflict.available && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-700">时段冲突</h3>
                  <ul className="mt-1 text-sm text-red-600 space-y-1">
                    {conflict.conflicts.map((c, i) => (
                      <li key={i}>• {c.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
              <div>
                <h3 className="font-bold text-primary-800">已选择</h3>
                <div className="text-sm text-cream-600 mt-1 space-y-1">
                  {selectedExhibition && (
                    <p>展厅：{selectedExhibition.name}</p>
                  )}
                  {selectedDate && (
                    <p>日期：{dayjs(selectedDate).format('YYYY年MM月DD日')}</p>
                  )}
                  {selectedTimeSlot && (
                    <p>时段：{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
                  )}
                  {selectedGuide && (
                    <p>讲解：{selectedGuide.name}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
                  canProceed
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 hover:from-gold-400 hover:to-gold-500 shadow-lg hover:shadow-gold-500/30 hover:scale-105'
                    : 'bg-cream-300 text-cream-500 cursor-not-allowed'
                }`}
              >
                下一步
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
