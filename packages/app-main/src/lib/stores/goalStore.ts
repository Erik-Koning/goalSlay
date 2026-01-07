import { create } from "zustand";

// Goal status constants (SQL Server doesn't support enums)
export const GOAL_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;

export type GoalStatus = (typeof GOAL_STATUS)[keyof typeof GOAL_STATUS];

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string | null;
  targetValue: number;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressLog {
  id: string;
  goalId: string;
  userId: string;
  value: number;
  previousValue?: number | null;
  note?: string | null;
  source: string;
  createdAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  // SMART fields
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: Date;
  // Progress
  status: GoalStatus;
  currentValue: number;
  targetValue: number;
  unit: string;
  // Categorization
  category?: string | null;
  priority: number;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  // Relations
  milestones?: Milestone[];
  progressLogs?: ProgressLog[];
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string; // ISO date string
  targetValue: number;
  unit?: string;
  category?: string;
  priority?: number;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string | null;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timeBound?: string;
  status?: GoalStatus;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  category?: string | null;
  priority?: number;
}

interface GoalFilter {
  status: GoalStatus | null;
  category: string | null;
}

interface GoalState {
  goals: Goal[];
  selectedGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
  filter: GoalFilter;

  // Actions
  fetchGoals: () => Promise<void>;
  fetchGoal: (id: string) => Promise<Goal | null>;
  createGoal: (data: CreateGoalInput) => Promise<Goal | null>;
  updateGoal: (id: string, data: UpdateGoalInput) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  logProgress: (goalId: string, value: number, note?: string) => Promise<boolean>;
  setSelectedGoal: (goal: Goal | null) => void;
  setFilter: (filter: Partial<GoalFilter>) => void;
  clearError: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  selectedGoal: null,
  isLoading: false,
  error: null,
  filter: { status: null, category: null },

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/goals");
      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }
      const goals = await response.json();
      set({ goals, isLoading: false });
    } catch (error) {
      console.error("Error fetching goals:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch goals",
        isLoading: false,
      });
    }
  },

  fetchGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/goals/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch goal");
      }
      const goal = await response.json();
      set({ selectedGoal: goal, isLoading: false });
      return goal;
    } catch (error) {
      console.error("Error fetching goal:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch goal",
        isLoading: false,
      });
      return null;
    }
  },

  createGoal: async (data: CreateGoalInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create goal");
      }
      const newGoal = await response.json();
      set((state) => ({
        goals: [newGoal, ...state.goals],
        isLoading: false,
      }));
      return newGoal;
    } catch (error) {
      console.error("Error creating goal:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to create goal",
        isLoading: false,
      });
      return null;
    }
  },

  updateGoal: async (id: string, data: UpdateGoalInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update goal");
      }
      const updatedGoal = await response.json();
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updatedGoal : g)),
        selectedGoal: state.selectedGoal?.id === id ? updatedGoal : state.selectedGoal,
        isLoading: false,
      }));
      return updatedGoal;
    } catch (error) {
      console.error("Error updating goal:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update goal",
        isLoading: false,
      });
      return null;
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        selectedGoal: state.selectedGoal?.id === id ? null : state.selectedGoal,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete goal",
        isLoading: false,
      });
      return false;
    }
  },

  logProgress: async (goalId: string, value: number, note?: string) => {
    set({ error: null });
    try {
      const response = await fetch(`/api/goals/${goalId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, note }),
      });
      if (!response.ok) {
        throw new Error("Failed to log progress");
      }
      const updatedGoal = await response.json();
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
        selectedGoal: state.selectedGoal?.id === goalId ? updatedGoal : state.selectedGoal,
      }));
      return true;
    } catch (error) {
      console.error("Error logging progress:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to log progress",
      });
      return false;
    }
  },

  setSelectedGoal: (goal) => set({ selectedGoal: goal }),

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  clearError: () => set({ error: null }),
}));

// Selector for filtered goals
export const useFilteredGoals = () => {
  const { goals, filter } = useGoalStore();

  return goals.filter((goal) => {
    if (filter.status && goal.status !== filter.status) return false;
    if (filter.category && goal.category !== filter.category) return false;
    return true;
  });
};

// Helper to calculate progress percentage
export const calculateProgress = (goal: Goal): number => {
  if (goal.targetValue === 0) return 0;
  return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
};

// Helper to get days remaining
export const getDaysRemaining = (goal: Goal): number => {
  const now = new Date();
  const target = new Date(goal.timeBound);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
