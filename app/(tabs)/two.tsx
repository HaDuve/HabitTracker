import { useCallback, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { ContributionGraph, PieChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MAX_CONTENT_WIDTH } from "@/constants/Layout";
import { Theme } from "@/constants/Theme";
import { useHabits } from "@/contexts/HabitsContext";
import { getCurrentWeekDates, getLastNDays } from "@/utils/date";
import { ChartConfig } from "react-native-chart-kit/dist/HelperTypes";

const screenWidth = Dimensions.get("window").width;
const ACTIVITY_MAP_NUM_DAYS = 365;
const ACTIVITY_MAP_SQUARE_SIZE = 12;
const ACTIVITY_MAP_GUTTER_SIZE = 2;
const ACTIVITY_MAP_CELL = ACTIVITY_MAP_SQUARE_SIZE + ACTIVITY_MAP_GUTTER_SIZE;
const ACTIVITY_MAP_GRID_HEIGHT =
  7 * ACTIVITY_MAP_CELL - ACTIVITY_MAP_GUTTER_SIZE;
// ContributionGraph internal layout (react-native-chart-kit)
const ACTIVITY_MAP_GRAPH_INTERNAL_TOP = 50;
const ACTIVITY_MAP_GRAPH_INTERNAL_LEFT = 32;
const ACTIVITY_MAP_CHART_HEIGHT =
  ACTIVITY_MAP_GRAPH_INTERNAL_TOP + ACTIVITY_MAP_GRID_HEIGHT;
const ACTIVITY_MAP_DAY_LABEL_COL_WIDTH = 34;
const ACTIVITY_SCROLL_PAD_LEFT = Theme.spacing * 0.75;
const ACTIVITY_SCROLL_PAD_RIGHT = 0;
const ACTIVITY_SCROLL_CONTENT_PAD_RIGHT = 0;

const chartConfig: ChartConfig = {
  backgroundColor: "transparent",
  backgroundGradientFrom: Theme.colors.card,
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: Theme.colors.card,
  backgroundGradientToOpacity: 1,
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
  const contentWidth = Math.min(screenWidth, MAX_CONTENT_WIDTH);
  const availableWidth = Math.max(1, contentWidth - Theme.spacing * 2);
  const [activityWrapWidth, setActivityWrapWidth] = useState<number | null>(
    null
  );

  const onActivityWrapLayout = useCallback((e: any) => {
    const w = e?.nativeEvent?.layout?.width;
    if (typeof w === "number" && Number.isFinite(w) && w > 0) {
      setActivityWrapWidth(w);
    }
  }, []);

  // Activity Map: aggregate all habits' dates -> count per day (entire last year)
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
  // Min width for 365 days: 52 full columns of 7 days
  const chartMinWidth = 52 * ACTIVITY_MAP_CELL - ACTIVITY_MAP_GUTTER_SIZE;
  const chartWidth = chartMinWidth + Theme.spacing * 4;
  // const chartWidth = Math.max(screenWidth - Theme.spacing * 2, chartMinWidth);
  const activityViewportWidth = activityWrapWidth ?? availableWidth;
  const activityGraphViewportWidth = Math.max(
    1,
    activityViewportWidth -
      (ACTIVITY_SCROLL_PAD_LEFT +
        ACTIVITY_SCROLL_PAD_RIGHT +
        ACTIVITY_MAP_DAY_LABEL_COL_WIDTH)
  );
  const activityScrollEnabled = chartWidth > activityGraphViewportWidth;
  const activityGraphWidth = activityScrollEnabled
    ? chartWidth
    : activityGraphViewportWidth;

  const activityMonthTicks = (() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - ACTIVITY_MAP_NUM_DAYS + 1); // inclusive
    startDate.setHours(0, 0, 0, 0);

    // Mirror ContributionGraph month label logic (Sunday-based weeks).
    const numEmptyDaysAtStart = startDate.getDay(); // 0..6
    const startDateWithEmptyDays = new Date(startDate);
    startDateWithEmptyDays.setDate(startDate.getDate() - numEmptyDaysAtStart);

    const numEmptyDaysAtEnd = 6 - endDate.getDay();
    const numDaysRoundedToWeek =
      ACTIVITY_MAP_NUM_DAYS + numEmptyDaysAtStart + numEmptyDaysAtEnd;
    const weekCount = Math.ceil(numDaysRoundedToWeek / 7);

    const ticks: Array<{ key: string; month: string; left: number }> = [];
    // don't render for last week (label would clip), same as lib
    for (
      let weekIndex = 0;
      weekIndex < Math.max(0, weekCount - 1);
      weekIndex++
    ) {
      const endOfWeek = new Date(startDateWithEmptyDays);
      endOfWeek.setDate(startDateWithEmptyDays.getDate() + (weekIndex + 1) * 7);

      const date = endOfWeek.getDate();
      if (date >= 1 && date <= 7) {
        ticks.push({
          key: `${endOfWeek.getFullYear()}-${endOfWeek.getMonth()}`,
          month: months[endOfWeek.getMonth()],
          left:
            ACTIVITY_MAP_GRAPH_INTERNAL_LEFT + weekIndex * ACTIVITY_MAP_CELL,
        });
      }
    }

    return ticks;
  })();

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
      contentContainerStyle={[styles.content, styles.centered]}
    >
      <Text style={styles.sectionTitle}>Activity Map</Text>
      <View style={styles.chartWrap} onLayout={onActivityWrapLayout}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={activityScrollEnabled}
          contentOffset={activityScrollEnabled ? undefined : { x: 0, y: 0 }}
          nestedScrollEnabled
          contentContainerStyle={[
            styles.activityScrollContent,
            !activityScrollEnabled && styles.activityScrollContentNoScroll,
          ]}
        >
          <View style={styles.activityScrollableBlock}>
            <View style={styles.activityMonthRow} pointerEvents="none">
              <View style={styles.activityMonthLeftSpacer} />
              <View
                style={[
                  styles.activityMonthRight,
                  { width: activityGraphWidth },
                ]}
              >
                {activityMonthTicks.map((t) => (
                  <Text
                    key={t.key}
                    style={[styles.activityTopLabel, { left: t.left }]}
                  >
                    {t.month}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.activityMainRow}>
              <View style={styles.activityLeftLabels} pointerEvents="none">
                <Text
                  style={[
                    styles.activitySideLabel,
                    { top: ACTIVITY_MAP_CELL * 1 },
                  ]}
                >
                  Mon
                </Text>
                <Text
                  style={[
                    styles.activitySideLabel,
                    { top: ACTIVITY_MAP_CELL * 3 },
                  ]}
                >
                  Wed
                </Text>
                <Text
                  style={[
                    styles.activitySideLabel,
                    { top: ACTIVITY_MAP_CELL * 5 },
                  ]}
                >
                  Fri
                </Text>
              </View>

              <View style={styles.activityGraphWrap}>
                <ContributionGraph
                  values={contributionData}
                  endDate={new Date()}
                  numDays={ACTIVITY_MAP_NUM_DAYS}
                  width={activityGraphWidth}
                  height={ACTIVITY_MAP_CHART_HEIGHT}
                  chartConfig={chartConfig}
                  squareSize={ACTIVITY_MAP_SQUARE_SIZE}
                  gutterSize={ACTIVITY_MAP_GUTTER_SIZE}
                  horizontal
                  showMonthLabels={false}
                  tooltipDataAttrs={() => ({})}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.activityLegend} pointerEvents="none">
          <Text style={styles.activityLegendText}>Less</Text>
          <View style={styles.activityLegendScale}>
            <View
              style={[
                styles.activityLegendSwatch,
                { backgroundColor: Theme.colors.heatmapEmpty },
              ]}
            />
            <View
              style={[
                styles.activityLegendSwatch,
                { backgroundColor: Theme.colors.heatmapLow },
              ]}
            />
            <View
              style={[
                styles.activityLegendSwatch,
                { backgroundColor: Theme.colors.heatmapHigh },
              ]}
            />
          </View>
          <Text style={styles.activityLegendText}>More</Text>
        </View>
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
          width={availableWidth}
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
    paddingBottom: 100,
  },
  centered: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    paddingHorizontal: Theme.spacing,
    paddingTop: Theme.spacing,
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
    paddingTop: 12, // move spacing to between border and labels
    paddingBottom: Theme.spacing * 1, // room for legend bubble
    paddingLeft: 4,
    position: "relative",
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  activityTopLabel: {
    ...Theme.typography.date,
    color: Theme.colors.textSecondary,
    position: "absolute",
    top: 2,
    zIndex: 3,
  },
  activityScrollContent: {
    paddingRight: ACTIVITY_SCROLL_CONTENT_PAD_RIGHT,
  },
  activityScrollContentNoScroll: {
    // Ensure web doesn't keep a residual horizontal scroll range.
    overflow: "hidden",
  },
  activityScrollableBlock: {
    paddingLeft: ACTIVITY_SCROLL_PAD_LEFT,
    paddingRight: ACTIVITY_SCROLL_PAD_RIGHT,
  },
  activityMonthRow: {
    flexDirection: "row",
    height: 20,
    marginBottom: 0,
    position: "relative",
    zIndex: 3,
  },
  activityMonthLeftSpacer: {
    width: ACTIVITY_MAP_DAY_LABEL_COL_WIDTH,
  },
  activityMonthRight: {
    position: "relative",
    flexGrow: 1,
  },
  activityMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  activityLeftLabels: {
    height: ACTIVITY_MAP_GRID_HEIGHT,
    width: ACTIVITY_MAP_DAY_LABEL_COL_WIDTH,
  },
  activitySideLabel: {
    position: "absolute",
    left: 0,
    ...Theme.typography.date,
    color: Theme.colors.textSecondary,
  },
  activityGraphWrap: {
    // Library draws squares starting at y=50; pull up to remove empty band.
    marginTop: -ACTIVITY_MAP_GRAPH_INTERNAL_TOP + 14,
    zIndex: 1,
  },
  activityLegend: {
    position: "absolute",
    right: Theme.spacing * 0.5,
    bottom: Theme.spacing * 0.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Theme.colors.card,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  activityLegendScale: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityLegendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  activityLegendText: {
    ...Theme.typography.date,
    color: Theme.colors.textSecondary,
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
