import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Theme } from "@/constants/Theme";
import type { Habit } from "@/contexts/HabitsContext";
import { useHabits } from "@/contexts/HabitsContext";
import { getCurrentWeekDates } from "@/utils/date";

type HabitCardProps = {
  habit: Habit;
};

export function HabitCard({ habit }: HabitCardProps) {
  const { toggleDate } = useHabits();
  const weekDates = getCurrentWeekDates();
  const datesInWeek = habit.dates.filter((d) => weekDates.includes(d));
  const completionPct = Math.round((datesInWeek.length / 7) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.habitName} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text style={styles.percent}>{completionPct}%</Text>
      </View>
      <View style={styles.circlesRow}>
        {weekDates.map((dateStr, i) => {
          const isDone = habit.dates.includes(dateStr);
          return (
            <Pressable
              key={dateStr}
              style={({ pressed }) => [
                styles.circle,
                isDone ? styles.circleDone : styles.circleInactive,
                pressed && styles.circlePressed,
              ]}
              onPress={() => toggleDate(habit.id, dateStr)}
            >
              {isDone ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderRadius: Theme.radius.card,
    padding: Theme.spacing,
    ...Theme.shadow.card,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing,
  },
  habitName: {
    ...Theme.typography.habitName,
    color: Theme.colors.textPrimary,
    flex: 1,
    marginRight: Theme.spacing,
  },
  percent: {
    ...Theme.typography.mono,
    color: Theme.colors.textSecondary,
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  circleDone: {
    backgroundColor: Theme.colors.accent,
  },
  circleInactive: {
    backgroundColor: Theme.colors.inactive,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  circlePressed: {
    opacity: 0.8,
  },
  progressTrack: {
    height: 2,
    backgroundColor: Theme.colors.cardBorder,
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Theme.colors.success,
    borderRadius: 1,
  },
});
