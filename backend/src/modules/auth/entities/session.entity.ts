import { User } from '../../users/entities/user.entity';

export interface Session {
  id: string;
  userId: string;
  user?: User;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}
