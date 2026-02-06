import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from "react-native";

import { Theme } from "@/constants/Theme";
import type { Habit } from "@/contexts/HabitsContext";
import { useHabits } from "@/contexts/HabitsContext";
import { getLastNDays } from "@/utils/date";

type HabitCardProps = {
  habit: Habit;
};

const WEEKDAY_SHORT_LOWER = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_ITEM_SIZE = 40;
const DAY_ITEM_GAP = 14;

function getDayLabel(dateStr: string, indexFromToday: number): string {
  if (indexFromToday === 0) return "today";
  const d = new Date(dateStr + "T12:00:00");
  return WEEKDAY_SHORT_LOWER[d.getDay()] ?? "";
}

export function HabitCard({ habit }: HabitCardProps) {
  const { toggleDate, removeHabit } = useHabits();
  const last7Dates = getLastNDays(7); // newest -> oldest (today first)
  const datesInRange = habit.dates.filter((d) => last7Dates.includes(d));
  const completionPct = Math.round((datesInRange.length / 7) * 100);
  const displayDates = [...last7Dates].reverse(); // oldest -> newest (today last/rightmost)
  const daysScrollRef = useRef<ScrollViewType | null>(null);
  const didAutoScrollRef = useRef(false);

  const handleLongPress = () => {
    Alert.alert("Delete habit?", `Remove "${habit.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeHabit(habit.id),
      },
    ]);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.85 }] },
      ]}
      onLongPress={handleLongPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.habitName} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text style={styles.percent}>{completionPct}%</Text>
      </View>
      <ScrollView
        ref={daysScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysScrollContent}
        onContentSizeChange={() => {
          // Start at "present": rightmost (today). Only once.
          if (didAutoScrollRef.current) return;
          didAutoScrollRef.current = true;
          daysScrollRef.current?.scrollToEnd({ animated: false });
        }}
      >
        <View>
          <View style={styles.circlesRow}>
            {displayDates.map((dateStr, idx) => {
              const isDone = habit.dates.includes(dateStr);
              const isToday = idx === displayDates.length - 1;
              const isLast = idx === displayDates.length - 1;
              return (
                <Pressable
                  key={dateStr}
                  style={({ pressed }) => [
                    styles.circle,
                    isDone ? styles.circleDone : styles.circleInactive,
                    isToday && styles.circleToday,
                    !isLast && styles.dayItemSpacing,
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
          <View style={styles.labelsRow}>
            {displayDates.map((dateStr, idx) => {
              const indexFromToday = displayDates.length - 1 - idx;
              const isToday = indexFromToday === 0;
              const isLast = idx === displayDates.length - 1;
              return (
                <Text
                  key={dateStr}
                  style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelToday,
                    !isLast && styles.dayItemSpacing,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  adjustsFontSizeToFit={isToday}
                  minimumFontScale={0.6}
                >
                  {getDayLabel(dateStr, indexFromToday)}
                </Text>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
      </View>
    </Pressable>
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
    marginBottom: 6,
  },
  circle: {
    width: DAY_ITEM_SIZE,
    height: DAY_ITEM_SIZE,
    borderRadius: DAY_ITEM_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleToday: {
    borderWidth: 2,
    borderColor: Theme.colors.success,
  },
  labelsRow: {
    flexDirection: "row",
    marginBottom: Theme.spacing,
  },
  daysScrollContent: {
    paddingRight: 2, // avoids last item clipping on iOS
  },
  dayItemSpacing: {
    marginRight: DAY_ITEM_GAP,
  },
  dayLabel: {
    width: DAY_ITEM_SIZE,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: Theme.colors.textSecondary,
  },
  dayLabelToday: {
    color: Theme.colors.textPrimary,
    fontWeight: "800",
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
