import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useUserStore } from "../stores/useUserStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";

export default function Header() {
  const users = useUserStore((s) => s.users);
  const favorites = useUserStore((s) => s.favorites);

  const token = useAuthStore((s) => s.token);

  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useThemeStore((s) => s.theme);

  const isDark = theme === "dark";

  return (
    <View style={styles.container}>

      {/* title + auth indicator */}
      <Text style={[styles.title, isDark && styles.darkText]}>
        User Directory {token ? "🛡️" : ""}
      </Text>

      {/* user + favorite count */}
      <Text style={styles.count}>
        {users.length} users · {favorites.length} favorites
      </Text>

      {/* theme toggle */}
      <Pressable onPress={toggleTheme}>
        <Text>Toggle Theme</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold" },
  count: { color: "#666", marginTop: 4 },
  darkText: { color: "#fff" },
});