import type { Meal, NutritionPlan, ProfileState, Subscription } from '@/types';

export type PaymentProvider = 'click' | 'payme' | 'uzum' | 'wallet';

/** GET /payments/methods — same shape as coffee-mobile-app */
export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  type: string;
  iconUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export type SubscriptionStatusCode = 'none' | 'active' | 'expired';

export type AccessCode = 'OK' | 'SUBSCRIPTION_REQUIRED' | 'SUBSCRIPTION_EXPIRED';

export interface ApiErrorBody {
  success?: boolean;
  statusCode?: number;
  message?: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  statusCode: number;
  messageCode: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.messageCode = message;
  }
}

export interface NutritionPlanOffer {
  planId: string;
  label: string;
  statusLabel: string;
  price: number;
  durationDays: number;
  isTrial: boolean;
  isActive?: boolean;
}

export interface SubscriptionStatusResponse {
  subscription: Subscription | null;
  active: (Subscription & { daysLeft: number }) | null;
  access: {
    allowed: boolean;
    code: AccessCode;
    daysLeft: number;
  };
  trialUsed: boolean;
}

export interface ProfileResponse extends ProfileState {
  subscriptionActive?: boolean;
  subscriptionStatus?: SubscriptionStatusCode;
  daysLeft?: number;
}

export interface MealsListResponse {
  items: Meal[];
}

export interface UploadPhotoResponse {
  url: string;
}

export interface FoodAnalysisResponse {
  isFood: boolean;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  description: string;
  source?: 'ai' | 'fallback';
}

export interface PurchaseResponse {
  purchaseId: string;
  paymentRef?: string;
  paymentStatus?: string;
  paymentUrl?: string;
  provider: PaymentProvider;
  subscription?: Subscription;
}

/** GET /nutrition/subscriptions/purchases/:purchaseId */
export interface PurchaseStatusResponse {
  purchaseId: string;
  planId?: string;
  amount?: number;
  status: string;
  paymentStatus?: string;
  provider?: PaymentProvider | string;
  paymentRef?: string | null;
  paymentUrl?: string | null;
  paidAt?: string | null;
  subscriptionActive?: boolean;
  subscription?: Subscription | null;
}

export type { Meal, NutritionPlan, ProfileState, Subscription };
