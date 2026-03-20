import React from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";

import { useUserStore } from "../stores/useUserStore";
import { usePostStore } from "../stores/usePostStore";
import { useUIStore } from "../stores/useUIStore";
import { useThemeStore } from "../stores/useThemeStore";
import { saveSecure } from "../services/secureStorage";

type Props = {
  userId: number;
};

const UserCard = ({ userId }: Props) => {
  const { width } = useWindowDimensions();

  // get user data from store
  const user = useUserStore((s) => s.users.find((u) => u.id === userId));
  const favorites = useUserStore((s) => s.favorites);
  const toggleFavorite = useUserStore((s) => s.toggleFavorite);
  const pinnedUserId = useUserStore((s) => s.pinnedUserId);
  const setPinnedUser = useUserStore((s) => s.setPinnedUser);

  // posts state
  const posts = usePostStore((s) => s.byUserId[userId]);
  const loading = usePostStore((s) => s.loadingForUser);
  const fetchPosts = usePostStore((s) => s.fetchPosts);

  // UI state
  const expandedUserId = useUIStore((s) => s.expandedUserId);
  const setExpandedUserId = useUIStore((s) => s.setExpandedUserId);

  // theme
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  if (!user) return null;

  const expanded = expandedUserId === userId;
  const isFav = favorites.includes(userId);
  const isPinned = pinnedUserId === userId;

  const firstLetter = user.name.charAt(0).toUpperCase();

  // expand or collapse card
  const onPress = () => {
    if (expanded) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);
    fetchPosts(userId);
  };

  // pin or unpin user 
  const onLongPress = async () => {
    const newValue = isPinned ? null : userId;
    setPinnedUser(newValue);

    if (newValue) {
      await saveSecure("pinned_user_id", String(newValue));
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        isDark && styles.darkCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardRow}>
        <View
          style={[
            styles.avatar,
            {
              width: width * 0.12,
              height: width * 0.12,
              borderRadius: (width * 0.12) / 2,
            },
          ]}
        >
          <Text style={[styles.avatarText, isDark && styles.darkText]}>
            {firstLetter}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.name, isDark && styles.darkText]}>
            {user.name}
          </Text>
          <Text style={[styles.company, isDark && styles.darkText]}>
            {user.company.name}
          </Text>
        </View>

        {/* pinned + favorite */}
        <Text>{isPinned ? "📍" : ""}</Text>
        <Text onPress={() => toggleFavorite(userId)}>
          {isFav ? "❤️" : "🤍"}
        </Text>

        <Text style={styles.arrow}>{expanded ? "▲" : "▼"}</Text>
      </View>

      {expanded && (
        <View style={styles.expandedArea}>
          {loading === userId ? (
            <ActivityIndicator size="small" />
          ) : (
            posts?.map((post) => (
              <Text key={post.id} style={isDark && styles.darkText}>
                {post.title}
              </Text>
            ))
          )}
        </View>
      )}
    </Pressable>
  );
};

export default React.memo(UserCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 12,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardPressed: { opacity: 0.7 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  userInfo: { flex: 1 },
  name: { fontWeight: "bold", fontSize: 16 },
  company: { color: "#666" },
  arrow: { marginLeft: 6 },
  expandedArea: { marginTop: 10 },
  darkCard: { backgroundColor: "#1e1e1e" },
  darkText: { color: "#fff" },
});
