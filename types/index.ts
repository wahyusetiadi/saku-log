export interface User {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id?: string;
  category?: Category;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  is_planned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Planner {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category;
  month: number;
  year: number;
  budget_amount: number;
  notes?: string;
  created_at: string;
}

export interface MonthlyStats {
  total: number;
  transactionCount: number;
  byCategory: CategoryStat[];
  dailyTrend: DailyTrend[];
  comparedToLastMonth: number;
}

export interface CategoryStat {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  budget_amount?: number;
  budget_percentage?: number;
}

export interface DailyTrend {
  date: string;
  amount: number;
}

export interface PlannerWithStats extends Planner {
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      currency: string;
    };
  }
  interface User {
    id: string;
    name: string;
    username: string;
    currency: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    currency: string;
  }
}