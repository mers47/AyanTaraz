import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  phone: string;
  role: string;
}

export interface AuthenticatedRequest extends Omit<Request, 'ip'> {
  user?: AuthenticatedUser;
  ip?: string;
}
