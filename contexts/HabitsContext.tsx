import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const STORAGE_KEY = "habits";

export type Habit = {
  id: string;
  name: string;
  dates: string[];
};

type State = { habits: Habit[] };

type Action =
  | { type: "SET_HABITS"; payload: Habit[] }
  | { type: "ADD_HABIT"; payload: { name: string } }
  | { type: "TOGGLE_DATE"; payload: { habitId: string; date: string } }
  | { type: "REMOVE_HABIT"; payload: { habitId: string } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_HABITS":
      return { habits: action.payload };
    case "ADD_HABIT": {
      const id = `habit-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      return {
        habits: [...state.habits, { id, name: action.payload.name, dates: [] }],
      };
    }
    case "TOGGLE_DATE": {
      const { habitId, date } = action.payload;
      return {
        habits: state.habits.map((h) => {
          if (h.id !== habitId) return h;
          const has = h.dates.includes(date);
          return {
            ...h,
            dates: has ? h.dates.filter((d) => d !== date) : [...h.dates, date],
          };
        }),
      };
    }
    case "REMOVE_HABIT":
      return {
        habits: state.habits.filter((h) => h.id !== action.payload.habitId),
      };
    default:
      return state;
  }
}

type ContextValue = {
  habits: Habit[];
  dispatch: React.Dispatch<Action>;
  addHabit: (name: string) => void;
  toggleDate: (habitId: string, date: string) => void;
  removeHabit: (habitId: string) => void;
};

const HabitsContext = createContext<ContextValue | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { habits: [] });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw) as Habit[];
          if (Array.isArray(parsed))
            dispatch({ type: "SET_HABITS", payload: parsed });
        }
      } catch (_) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.habits));
  }, [state.habits]);

  const addHabit = useCallback((name: string) => {
    dispatch({ type: "ADD_HABIT", payload: { name: name.trim() } });
  }, []);

  const toggleDate = useCallback((habitId: string, date: string) => {
    dispatch({ type: "TOGGLE_DATE", payload: { habitId, date } });
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    dispatch({ type: "REMOVE_HABIT", payload: { habitId } });
  }, []);

  const value: ContextValue = {
    habits: state.habits,
    dispatch,
    addHabit,
    toggleDate,
    removeHabit,
  };

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}

export function useHabits(): ContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}
