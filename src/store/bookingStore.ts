import { create } from 'zustand';
import type {
  Exhibition,
  TimeSlot,
  User,
  Booking,
  BookingCheckResponse,
} from '../../shared/types';
import { bookingsApi } from '../services/api';

interface VisitorInfo {
  name: string;
  phone: string;
  count: number;
}

interface BookingState {
  selectedExhibition: Exhibition | null;
  selectedDate: string | null;
  selectedTimeSlot: TimeSlot | null;
  selectedGuide: User | null;
  visitorInfo: VisitorInfo;
  createdBooking: Booking | null;
  selectExhibition: (exhibition: Exhibition | null) => void;
  selectDate: (date: string | null) => void;
  selectTimeSlot: (timeSlot: TimeSlot | null) => void;
  selectGuide: (guide: User | null) => void;
  setVisitorInfo: (info: Partial<VisitorInfo>) => void;
  resetBooking: () => void;
  submitBooking: () => Promise<{ success: boolean; message?: string; data?: Booking }>;
}

const initialVisitorInfo: VisitorInfo = {
  name: '',
  phone: '',
  count: 1,
};

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedExhibition: null,
  selectedDate: null,
  selectedTimeSlot: null,
  selectedGuide: null,
  visitorInfo: initialVisitorInfo,
  createdBooking: null,

  selectExhibition: (exhibition) => {
    set({
      selectedExhibition: exhibition,
      selectedDate: null,
      selectedTimeSlot: null,
    });
  },

  selectDate: (date) => {
    set({
      selectedDate: date,
      selectedTimeSlot: null,
    });
  },

  selectTimeSlot: (timeSlot) => {
    set({ selectedTimeSlot: timeSlot });
  },

  selectGuide: (guide) => {
    set({ selectedGuide: guide });
  },

  setVisitorInfo: (info) => {
    set((state) => ({
      visitorInfo: { ...state.visitorInfo, ...info },
    }));
  },

  resetBooking: () => {
    set({
      selectedExhibition: null,
      selectedDate: null,
      selectedTimeSlot: null,
      selectedGuide: null,
      visitorInfo: initialVisitorInfo,
      createdBooking: null,
    });
  },

  submitBooking: async () => {
    try {
      const {
        selectedExhibition,
        selectedDate,
        selectedTimeSlot,
        selectedGuide,
        visitorInfo,
      } = get();

      if (!selectedExhibition || !selectedDate || !selectedTimeSlot) {
        return {
          success: false,
          message: '请选择展览、日期和时间段',
        };
      }

      if (!visitorInfo.name || !visitorInfo.phone) {
        return {
          success: false,
          message: '请填写访客信息',
        };
      }

      const checkRequest = {
        exhibitionId: selectedExhibition.id,
        guideId: selectedGuide?.id,
        date: selectedDate,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
      };

      const checkResponse = await bookingsApi.checkConflict(checkRequest);

      if (!checkResponse.success || !checkResponse.data) {
        return {
          success: false,
          message: checkResponse.message || checkResponse.error || '预约冲突检测失败',
        };
      }

      const checkData = checkResponse.data as BookingCheckResponse;
      if (!checkData.available) {
        const conflictMessages = checkData.conflicts.map((c) => c.message).join('; ');
        return {
          success: false,
          message: `预约冲突: ${conflictMessages}`,
        };
      }

      const bookingRequest = {
        exhibitionId: selectedExhibition.id,
        guideId: selectedGuide?.id,
        visitorName: visitorInfo.name,
        visitorPhone: visitorInfo.phone,
        visitorCount: visitorInfo.count,
        date: selectedDate,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
      };

      const createResponse = await bookingsApi.create(bookingRequest);

      if (!createResponse.success || !createResponse.data) {
        return {
          success: false,
          message: createResponse.message || createResponse.error || '预约提交失败',
        };
      }

      set({ createdBooking: createResponse.data });

      return {
        success: true,
        message: '预约提交成功',
        data: createResponse.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '预约提交失败',
      };
    }
  },
}));
