import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  pendingFees: number;
  todayAttendance: number;
  sportsDistribution: Array<{
    sport: string;
    count: number;
    percentage: number;
  }>;
  recentActivities: Array<{
    id: number;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools((set) => ({
    stats: null,
    loading: false,
    error: null,
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error })
  }))
);
