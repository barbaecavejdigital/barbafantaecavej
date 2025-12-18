export interface User {
  id: string;
  username: string;
  password?: string;
  firstName: string | null;
  lastName: string | null;
  points: number;
  isInitialLogin: boolean;
  role: 'customer' | 'admin';
  creationDate: string;
  completedHeatingActions?: string[];
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
}

export interface Action {
  id: string;
  name: string;
  points: number;
  description?: string;
  isEnabled: boolean;
}

export interface HeatingAction {
  id: string;
  name: string;
  description: string;
  points: number;
  slot: number; // 1-10
}

export interface PointTransaction {
  id: string;
  userId: string;
  date: string; // ISO string
  type: 'assignment' | 'redemption' | 'creation' | 'reversal';
  description: string;
  pointsChange: number;
  balanceAfter: number;
  isReversed?: boolean;
  reversalOf?: string; // ID of the transaction being reversed
}

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}