import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Theme } from "@/constants/Theme";
import { useHabits } from "@/contexts/HabitsContext";

export default function AddHabitModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addHabit } = useHabits();
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed) {
      addHabit(trimmed);
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + Theme.spacing,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.sheet}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.closeBtn}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>New Habit</Text>
        <TextInput
          style={styles.input}
          placeholder="Habit name"
          placeholderTextColor={Theme.colors.textSecondary}
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.saveBtnPressed,
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>
      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderTopLeftRadius: Theme.radius.card,
    borderTopRightRadius: Theme.radius.card,
    padding: Theme.spacing,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(0,0,0,0.06)",
  },
  closeBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  closeBtnText: {
    fontSize: 18,
    color: Theme.colors.textPrimary,
    fontWeight: "600",
  },
  title: {
    ...Theme.typography.heading,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing,
    paddingRight: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: Theme.spacing,
    paddingVertical: 12,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing,
  },
  saveBtn: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Theme.radius.button,
    alignItems: "center",
  },
  saveBtnPressed: {
    opacity: 0.8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
