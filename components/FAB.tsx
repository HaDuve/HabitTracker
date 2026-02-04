import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Theme } from "@/constants/Theme";

export function FAB() {
  return (
    <View style={styles.wrapper}>
      <Link href="/modal" asChild>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: Theme.spacing * 2,
    right: Theme.spacing * 2,
    width: 56,
    height: 56,
    borderRadius: Theme.radius.button,
    backgroundColor: Theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  fab: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  fabPressed: {
    opacity: 0.8,
  },
});
