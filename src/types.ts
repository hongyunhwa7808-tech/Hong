export type Currency = 'MNT' | 'KRW';
export type TransactionType = 'expense' | 'income';

export interface CategoryGroup {
  name: string;
  dotColor: string;
  textColor: string;
  items: string[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  amountMnt: number;
  amountKrw: number;
  categoryGroup: string;
  category: string;
  date: string; // YYYY-MM-DD
  place: string;
  memo: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  bank: string;
  currency: Currency;
  balance: number;
  icon: string;
  accountNumber?: string;
}

export interface BudgetGoal {
  groupName: string;
  monthlyMnt: number;
  description: string;
}

export interface AppSettings {
  mntToKrwRate: number; // e.g. 0.381 (1 MNT = 0.381 KRW)
  title: string;
  lastUpdated: string;
}
