import { User, Exhibition, CollectionItem, Booking, Schedule, MaintenanceAlert, OpenRule } from '../../shared/types.js';

export const mapToUser = (row: Record<string, unknown>): User => ({
  id: row.id as number,
  username: row.username as string,
  name: row.name as string,
  role: row.role as User['role'],
  avatar: row.avatar as string | undefined,
  phone: row.phone as string | undefined,
  bio: row.bio as string | undefined,
  rating: row.rating as number | undefined,
});

export const mapToExhibition = (row: Record<string, unknown>): Exhibition => ({
  id: row.id as number,
  name: row.name as string,
  description: row.description as string,
  coverImage: row.cover_image as string,
  capacity: row.capacity as number,
  location: row.location as string,
  isActive: !!row.is_active,
});

export const mapToCollectionItem = (row: Record<string, unknown>): CollectionItem => ({
  id: row.id as number,
  name: row.name as string,
  category: row.category as string,
  description: row.description as string,
  era: row.era as string,
  image: row.image as string,
  exhibitionId: row.exhibition_id as number,
  locationX: row.location_x as number,
  locationY: row.location_y as number,
  maintenanceCycle: row.maintenance_cycle as number,
  lastMaintenanceDate: row.last_maintenance_date as string,
  nextMaintenanceDate: row.next_maintenance_date as string,
  visitCount: row.visit_count as number,
  status: row.status as CollectionItem['status'],
  assignedRestorerId: row.assigned_restorer_id as number | undefined,
  assignedSecurityId: row.assigned_security_id as number | undefined,
});

export const mapToBooking = (row: Record<string, unknown>): Booking => ({
  id: row.id as number,
  exhibitionId: row.exhibition_id as number,
  guideId: row.guide_id as number | undefined,
  visitorName: row.visitor_name as string,
  visitorPhone: row.visitor_phone as string,
  visitorCount: row.visitor_count as number,
  date: row.date as string,
  startTime: row.start_time as string,
  endTime: row.end_time as string,
  status: row.status as Booking['status'],
  createdAt: row.created_at as string,
});

export const mapToSchedule = (row: Record<string, unknown>): Schedule => ({
  id: row.id as number,
  userId: row.user_id as number,
  date: row.date as string,
  startTime: row.start_time as string,
  endTime: row.end_time as string,
  type: row.type as Schedule['type'],
  collectionId: row.collection_id as number | undefined,
  area: row.area as string | undefined,
  status: row.status as Schedule['status'],
});

export const mapToMaintenanceAlert = (row: Record<string, unknown>): MaintenanceAlert => ({
  id: row.id as number,
  collectionId: row.collection_id as number,
  collectionName: row.collection_name as string,
  nextMaintenanceDate: row.next_maintenance_date as string,
  daysUntil: row.days_until as number,
  level: row.level as MaintenanceAlert['level'],
  acknowledged: !!row.acknowledged,
});

export const mapToOpenRule = (row: Record<string, unknown>): OpenRule => ({
  id: row.id as number,
  exhibitionId: row.exhibition_id as number,
  dayOfWeek: row.day_of_week as number,
  openTime: row.open_time as string,
  closeTime: row.close_time as string,
  isClosed: !!row.is_closed,
});
