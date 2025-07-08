import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Payment {
  id: number;
  studentId: number;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  status: string;
  paymentDate?: string;
  monthYear?: string;
  receiptNumber?: string;
}

interface PaymentState {
  payments: Payment[];
  selectedPayment: Payment | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    studentId?: number;
    monthYear?: string;
    search?: string;
  };
  setPayments: (payments: Payment[]) => void;
  setSelectedPayment: (payment: Payment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<PaymentState['filters']>) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (payment: Payment) => void;
  removePayment: (paymentId: number) => void;
}

export const usePaymentStore = create<PaymentState>()(
  devtools((set, get) => ({
    payments: [],
    selectedPayment: null,
    loading: false,
    error: null,
    filters: {},
    setPayments: (payments) => set({ payments }),
    setSelectedPayment: (selectedPayment) => set({ selectedPayment }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
    addPayment: (payment) => set({ payments: [payment, ...get().payments] }),
    updatePayment: (updatedPayment) => set({
      payments: get().payments.map(payment => 
        payment.id === updatedPayment.id ? updatedPayment : payment
      )
    }),
    removePayment: (paymentId) => set({
      payments: get().payments.filter(payment => payment.id !== paymentId)
    })
  }))
);
