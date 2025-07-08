import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Student {
  id: number;
  studentId: string;
  name: string;
  phone: string;
  email?: string;
  sportId: number;
  batchId: number;
  skillLevel: string;
  isActive: boolean;
  profileImageUrl?: string;
  joiningDate: string;
}

interface StudentState {
  students: Student[];
  selectedStudent: Student | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    sportId?: number;
    batchId?: number;
    isActive?: boolean;
  };
  setStudents: (students: Student[]) => void;
  setSelectedStudent: (student: Student | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<StudentState['filters']>) => void;
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  removeStudent: (studentId: number) => void;
}

export const useStudentStore = create<StudentState>()(
  devtools((set, get) => ({
    students: [],
    selectedStudent: null,
    loading: false,
    error: null,
    filters: {
      search: '',
    },
    setStudents: (students) => set({ students }),
    setSelectedStudent: (selectedStudent) => set({ selectedStudent }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
    addStudent: (student) => set({ students: [student, ...get().students] }),
    updateStudent: (updatedStudent) => set({
      students: get().students.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      )
    }),
    removeStudent: (studentId) => set({
      students: get().students.filter(student => student.id !== studentId)
    })
  }))
);
