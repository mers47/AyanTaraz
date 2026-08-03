import { TaxAssistantResult } from '@prisma/client';

export interface AssistantSession {
  id: string;
  userId: string | null;
  currentQuestionId: string | null;
  answers: Record<string, string>;
  result: TaxAssistantResult | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssistantQuestion {
  id: string;
  question: string;
  description: string | null;
  options: {
    id: string;
    label: string;
    value: string;
  }[];
}

export interface AssistantResult {
  id: string;
  name: string;
  title: string;
  description: string;
  ruleIds: string[];
  action: string | null;
  severity: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
