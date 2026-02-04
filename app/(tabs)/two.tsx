import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { ContributionGraph, PieChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Theme } from "@/constants/Theme";
import { useHabits } from "@/contexts/HabitsContext";
import { getCurrentWeekDates, getLastNDays } from "@/utils/date";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundColor: "transparent",
  color: (opacity: number) => {
    if (opacity <= 0.2) return Theme.colors.heatmapEmpty;
    if (opacity <= 0.55) return Theme.colors.heatmapLow;
    return Theme.colors.heatmapHigh;
  },
  labelColor: () => Theme.colors.textSecondary,
};

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { habits } = useHabits();

  // Activity Map: aggregate all habits' dates -> count per day (entire last year)
  const ACTIVITY_MAP_NUM_DAYS = 365;
  const lastYearDates = getLastNDays(ACTIVITY_MAP_NUM_DAYS);
  const countByDate: Record<string, number> = {};
  lastYearDates.forEach((d) => (countByDate[d] = 0));
  habits.forEach((h) => {
    h.dates.forEach((d) => {
      if (d in countByDate) countByDate[d]++;
    });
  });
  const contributionData = lastYearDates
    .map((date) => ({ date, count: countByDate[date] ?? 0 }))
    .reverse();
  // Min width for 365 days: 52 full columns of 7 days, squareSize 12 + gutter 2
  const chartMinWidth = 52 * (12 + 2) - 2;
  const chartWidth = Math.max(screenWidth - Theme.spacing * 2, chartMinWidth);

  // Weekly Focus: current week completion across all habits
  const weekDates = getCurrentWeekDates();
  const totalSlots = habits.length * 7;
  let completedSlots = 0;
  habits.forEach((h) => {
    weekDates.forEach((d) => {
      if (h.dates.includes(d)) completedSlots++;
    });
  });
  const remainingSlots = Math.max(0, totalSlots - completedSlots);
  const completionPct =
    totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  const pieData = [
    { name: "Done", population: completedSlots, color: Theme.colors.success },
    {
      name: "Remaining",
      population: remainingSlots,
      color: Theme.colors.remaining,
    },
  ].filter((s) => s.population > 0);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sectionTitle}>Activity Map</Text>
      <View style={styles.chartWrap}>
        <ContributionGraph
          values={contributionData}
          endDate={new Date()}
          numDays={ACTIVITY_MAP_NUM_DAYS}
          width={chartWidth}
          height={160}
          chartConfig={chartConfig}
          squareSize={12}
          gutterSize={2}
          horizontal
          tooltipDataAttrs={() => ({})}
        />
      </View>

      <Text style={styles.sectionTitle}>Weekly Focus</Text>
      <View style={styles.pieWrap}>
        <PieChart
          data={
            pieData.length
              ? pieData
              : [
                  {
                    name: "Empty",
                    population: 1,
                    color: Theme.colors.remaining,
                  },
                ]
          }
          width={screenWidth - Theme.spacing * 2}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          center={[10, 0]}
          hasLegend={false}
        />
        <View style={styles.pieCenter} pointerEvents="none">
          <Text style={styles.pieCenterText}>
            {pieData.length ? `${completionPct}%` : "—"}
          </Text>
        </View>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: Theme.colors.success },
            ]}
          />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendDot,
              {
                backgroundColor: Theme.colors.remaining,
                borderWidth: 1,
                borderColor: Theme.colors.cardBorder,
              },
            ]}
          />
          <Text style={styles.legendText}>Remaining</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...Theme.typography.habitName,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing,
  },
  chartWrap: {
    marginBottom: Theme.spacing * 2,
    borderRadius: Theme.radius.card,
    overflow: "hidden",
    paddingBottom: Theme.spacing,
  },
  pieWrap: {
    position: "relative",
    marginBottom: Theme.spacing,
  },
  pieCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  pieCenterText: {
    ...Theme.typography.heading,
    color: Theme.colors.textPrimary,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Theme.spacing * 2,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...Theme.typography.date,
    color: Theme.colors.textSecondary,
  },
});
