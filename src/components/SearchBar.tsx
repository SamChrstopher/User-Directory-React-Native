import React, { useState, useRef } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { useUIStore } from "../stores/useUIStore";
import { useThemeStore } from "../stores/useThemeStore";

export default function SearchBar() {
  const setSearch = useUIStore((s) => s.setSearchQuery);
  const theme = useThemeStore((s) => s.theme);

  const [value, setValue] = useState("");
  const timer = useRef<any>(null);

  const isDark = theme === "dark";

  // update input instantly, delay store update
  const onChange = (text: string) => {
    setValue(text);

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      setSearch(text);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, isDark && styles.darkInput]}
        value={value}
        placeholder="Search Users here..."
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 10 },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
  },
  darkInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
  },
});