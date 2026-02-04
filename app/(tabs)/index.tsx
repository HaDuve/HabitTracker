import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FAB } from "@/components/FAB";
import { HabitCard } from "@/components/HabitCard";
import { Theme } from "@/constants/Theme";
import { useHabits } from "@/contexts/HabitsContext";
import { formatDisplayDate, getTodayISODate } from "@/utils/date";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { habits } = useHabits();
  const todayLabel = formatDisplayDate(getTodayISODate());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.date}>{todayLabel}</Text>
        <Text style={styles.heading}>Your Habits</Text>
      </View>
      {habits.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No habits yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first habit</Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HabitCard habit={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: 80 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
      <FAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing,
    paddingTop: Theme.spacing,
    paddingBottom: Theme.spacing,
  },
  date: {
    ...Theme.typography.date,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  heading: {
    ...Theme.typography.heading,
    color: Theme.colors.textPrimary,
  },
  list: {
    paddingHorizontal: Theme.spacing,
  },
  separator: {
    height: Theme.spacing,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing,
  },
  emptyText: {
    ...Theme.typography.habitName,
    color: Theme.colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Theme.typography.date,
    color: Theme.colors.textSecondary,
  },
});
