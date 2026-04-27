export type OrderStatus = 'washing' | 'drying' | 'ironing' | 'completed';

export interface LaundryOrder {
  id: string;
  receipt_number: string;
  customer_name: string;
  phone_number?: string;
  laundry_details?: string;
  laundry_type?: string;
  weight?: number;
  date_received: any; // Firestore Timestamp or Date string
  estimated_completion: any; // Firestore Timestamp or Date string
  status: OrderStatus;
  created_at: any;
  updated_at: any;
}

export const STATUS_FLOW: OrderStatus[] = ['washing', 'drying', 'ironing', 'completed'];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  washing: 'Dicuci (Washing)',
  drying: 'Pengeringan (Drying)',
  ironing: 'Setrika (Ironing)',
  completed: 'Selesai (Completed)',
};
