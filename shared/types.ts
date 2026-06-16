export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'restorer' | 'security' | 'guide';
  avatar?: string;
  phone?: string;
  bio?: string;
  rating?: number;
}

export interface Exhibition {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  capacity: number;
  location: string;
  isActive: boolean;
}

export interface CollectionItem {
  id: number;
  name: string;
  category: string;
  description: string;
  era: string;
  image: string;
  exhibitionId: number;
  locationX: number;
  locationY: number;
  maintenanceCycle: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  visitCount: number;
  status: 'normal' | 'maintenance' | 'repair';
  assignedRestorerId?: number;
  assignedSecurityId?: number;
  assignedRestorer?: User;
  assignedSecurity?: User;
  exhibition?: Exhibition;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  conflictType?: 'exhibition' | 'guide';
}

export interface Booking {
  id: number;
  exhibitionId: number;
  guideId?: number;
  visitorName: string;
  visitorPhone: string;
  visitorCount: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  exhibition?: Exhibition;
  guide?: User;
}

export interface Schedule {
  id: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  type: 'restoration' | 'security';
  collectionId?: number;
  area?: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  user?: User;
  collection?: CollectionItem;
}

export interface MaintenanceAlert {
  id: number;
  collectionId: number;
  collectionName: string;
  nextMaintenanceDate: string;
  daysUntil: number;
  level: 'warning' | 'urgent' | 'overdue';
  acknowledged: boolean;
  collection?: CollectionItem;
}

export interface VisitFrequencyData {
  date: string;
  count: number;
  exhibitionId: number;
  exhibitionName: string;
}

export interface OpenRule {
  id: number;
  exhibitionId: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  exhibition?: Exhibition;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface BookingCheckRequest {
  exhibitionId: number;
  guideId?: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingCheckResponse {
  available: boolean;
  conflicts: {
    type: 'exhibition' | 'guide';
    message: string;
  }[];
}

export interface BookingCreateRequest {
  exhibitionId: number;
  guideId?: number;
  visitorName: string;
  visitorPhone: string;
  visitorCount: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CollectionCreateRequest {
  name: string;
  category: string;
  description: string;
  era: string;
  image?: string;
  exhibitionId: number;
  locationX: number;
  locationY: number;
  maintenanceCycle: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export interface CollectionUpdateRequest extends Partial<CollectionCreateRequest> {
  status?: 'normal' | 'maintenance' | 'repair';
  assignedRestorerId?: number | null;
  assignedSecurityId?: number | null;
}

export interface ScheduleCreateRequest {
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  type: 'restoration' | 'security';
  collectionId?: number;
  area?: string;
}

export interface AssignPersonnelRequest {
  collectionId: number;
  restorerId?: number;
  securityId?: number;
}

export interface UpdateOpenRuleRequest {
  id: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'restorer' | 'security' | 'guide';
  phone?: string;
  bio?: string;
}
