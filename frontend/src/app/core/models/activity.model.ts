import type { User } from './user.model';
import type { Location } from './location.model';

export enum ActivityType {
  Public = 0,
  Private = 1,
}

export interface Activity {
  id: number;
  title: string;
  sport: string;
  dateTime: string;
  maxParticipants: number;
  type: ActivityType;
  description?: string | null;
  organizerId: number;
  locationId: number;
  participantCount: number;
  organizer?: User | null;
  location?: Location | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateActivityDto {
  title: string;
  sport: string;
  dateTime: Date;
  maxParticipants: number;
  type: ActivityType;
  locationId: number;
  description?: string;
}

export interface UpdateActivityDto {
  title?: string | null;
  sport?: string | null;
  dateTime?: Date | null;
  maxParticipants?: number | null;
  type?: ActivityType | null;
  locationId?: number | null;
  description?: string | null;
}

export interface ActivityFilter {
  sport?: string;
  type?: ActivityType;
  fromDate?: string;
  toDate?: string;
  locationId?: number;
}
