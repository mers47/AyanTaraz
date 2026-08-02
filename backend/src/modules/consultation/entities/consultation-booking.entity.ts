import { BookingStatus } from '@prisma/client';

export interface ConsultationService {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationSlot {
  id: string;
  availabilityId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  maxBookings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationBooking {
  id: string;
  slotId: string;
  serviceId: string;
  userId: string | null;
  phone: string;
  otpVerified: boolean;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
