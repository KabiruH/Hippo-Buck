// constants.ts 

export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  HOUSEKEEPING: 'HOUSEKEEPING',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const RoomStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  CLEANING: 'CLEANING',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
} as const;

export type RoomStatus = typeof RoomStatus[keyof typeof RoomStatus];

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export const PaymentMethod = {
  CASH: 'CASH',
  MPESA: 'MPESA',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CHEQUE: 'CHEQUE',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIAL: 'PARTIAL',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const MaintenanceStatus = {
  REPORTED: 'REPORTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type MaintenanceStatus = typeof MaintenanceStatus[keyof typeof MaintenanceStatus];

// Validation helpers
export const isValidUserRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

export const isValidRoomStatus = (status: string): status is RoomStatus => {
  return Object.values(RoomStatus).includes(status as RoomStatus);
};

export const isValidBookingStatus = (status: string): status is BookingStatus => {
  return Object.values(BookingStatus).includes(status as BookingStatus);
};

export const isValidPaymentMethod = (method: string): method is PaymentMethod => {
  return Object.values(PaymentMethod).includes(method as PaymentMethod);
};

export const isValidPaymentStatus = (status: string): status is PaymentStatus => {
  return Object.values(PaymentStatus).includes(status as PaymentStatus);
};

export const isValidMaintenanceStatus = (status: string): status is MaintenanceStatus => {
  return Object.values(MaintenanceStatus).includes(status as MaintenanceStatus);
};