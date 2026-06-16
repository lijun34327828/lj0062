import type {
  ApiResponse,
  User,
  Exhibition,
  CollectionItem,
  TimeSlot,
  Booking,
  Schedule,
  MaintenanceAlert,
  VisitFrequencyData,
  OpenRule,
  LoginRequest,
  LoginResponse,
  BookingCheckRequest,
  BookingCheckResponse,
  BookingCreateRequest,
  CollectionCreateRequest,
  CollectionUpdateRequest,
  ScheduleCreateRequest,
  AssignPersonnelRequest,
  UpdateOpenRuleRequest,
  UserCreateRequest,
} from '../../shared/types';

const BASE_URL = '/api';

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '请求失败',
    };
  }
};

export const authApi = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const exhibitionsApi = {
  getList: (): Promise<ApiResponse<Exhibition[]>> =>
    request<Exhibition[]>('/exhibitions'),
  getDetail: (id: number): Promise<ApiResponse<Exhibition>> =>
    request<Exhibition>(`/exhibitions/${id}`),
  getTimeslots: (id: number, date: string): Promise<ApiResponse<TimeSlot[]>> =>
    request<TimeSlot[]>(`/exhibitions/${id}/timeslots?date=${date}`),
};

export const guidesApi = {
  getList: (): Promise<ApiResponse<User[]>> =>
    request<User[]>('/guides'),
  getTimeslots: (id: number, date: string): Promise<ApiResponse<TimeSlot[]>> =>
    request<TimeSlot[]>(`/guides/${id}/timeslots?date=${date}`),
};

export const bookingsApi = {
  checkConflict: (data: BookingCheckRequest): Promise<ApiResponse<BookingCheckResponse>> =>
    request<BookingCheckResponse>('/bookings/check', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  create: (data: BookingCreateRequest): Promise<ApiResponse<Booking>> =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getList: (): Promise<ApiResponse<Booking[]>> =>
    request<Booking[]>('/bookings'),
};

export const collectionsApi = {
  getList: (): Promise<ApiResponse<CollectionItem[]>> =>
    request<CollectionItem[]>('/collections'),
  getDetail: (id: number): Promise<ApiResponse<CollectionItem>> =>
    request<CollectionItem>(`/collections/${id}`),
  create: (data: CollectionCreateRequest): Promise<ApiResponse<CollectionItem>> =>
    request<CollectionItem>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CollectionUpdateRequest): Promise<ApiResponse<CollectionItem>> =>
    request<CollectionItem>(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: number): Promise<ApiResponse<void>> =>
    request<void>(`/collections/${id}`, {
      method: 'DELETE',
    }),
  getMaintenanceAlerts: (): Promise<ApiResponse<MaintenanceAlert[]>> =>
    request<MaintenanceAlert[]>('/collections/maintenance-alerts'),
};

export const schedulesApi = {
  getList: (): Promise<ApiResponse<Schedule[]>> =>
    request<Schedule[]>('/schedules'),
  create: (data: ScheduleCreateRequest): Promise<ApiResponse<Schedule>> =>
    request<Schedule>('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ScheduleCreateRequest>): Promise<ApiResponse<Schedule>> =>
    request<Schedule>(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  assignPersonnel: (data: AssignPersonnelRequest): Promise<ApiResponse<void>> =>
    request<void>('/schedules/assign-personnel', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const statisticsApi = {
  getVisitFrequency: (): Promise<ApiResponse<VisitFrequencyData[]>> =>
    request<VisitFrequencyData[]>('/statistics/visit-frequency'),
  getExhibitionUsage: (): Promise<ApiResponse<{ exhibitionId: number; exhibitionName: string; visitCount: number }[]>> =>
    request<{ exhibitionId: number; exhibitionName: string; visitCount: number }[]>('/statistics/exhibition-usage'),
  getWorkload: (): Promise<ApiResponse<{ userId: number; userName: string; role: string; taskCount: number }[]>> =>
    request<{ userId: number; userName: string; role: string; taskCount: number }[]>('/statistics/workload'),
};

export const settingsApi = {
  getRules: (): Promise<ApiResponse<OpenRule[]>> =>
    request<OpenRule[]>('/settings/rules'),
  updateRules: (data: UpdateOpenRuleRequest): Promise<ApiResponse<OpenRule>> =>
    request<OpenRule>('/settings/rules', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const usersApi = {
  getList: (): Promise<ApiResponse<User[]>> =>
    request<User[]>('/users'),
  create: (data: UserCreateRequest): Promise<ApiResponse<User>> =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<UserCreateRequest>): Promise<ApiResponse<User>> =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: number): Promise<ApiResponse<void>> =>
    request<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

export const tasksApi = {
  getMyTasks: (): Promise<ApiResponse<Schedule[]>> =>
    request<Schedule[]>('/tasks/my'),
  completeTask: (id: number): Promise<ApiResponse<Schedule>> =>
    request<Schedule>(`/tasks/${id}/complete`, {
      method: 'POST',
    }),
};
