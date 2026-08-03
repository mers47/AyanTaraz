import { UserRole } from '@prisma/client';

export interface User {
  id: string;
  phone: string;
  phoneVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: UserRole | string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
