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
        { paddingBottom: insets.bottom + Theme.spacing },
      ]}
    >
      <View style={styles.sheet}>
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
    backgroundColor: Theme.colors.background,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Theme.colors.card,
    borderTopLeftRadius: Theme.radius.card,
    borderTopRightRadius: Theme.radius.card,
    padding: Theme.spacing,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Theme.colors.cardBorder,
  },
  title: {
    ...Theme.typography.heading,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing,
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
