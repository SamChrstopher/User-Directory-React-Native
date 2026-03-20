import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

interface Post {
  id: number;
  title: string;
  userId: number;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [postsCache, setPostsCache] = useState<{ [key: string]: Post[] }>({});
  const [postLoading, setPostLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { width, height } = useWindowDimensions();

  const api = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
  });

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPosts = async (userId: string) => {
    try {
      setPostLoading(userId);
      const response = await api.get(`/posts?userId=${userId}`);
      setPostsCache((prev) => ({
        ...prev,
        [userId]: response.data,
      }));
    } catch (error) {
      console.log("Error: ", error);
    } finally {
      setPostLoading(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleExpand = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(userId);

    if (!postsCache[userId]) {
      fetchPosts(userId);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPostsCache({});
    fetchUsers();
  };

  const renderItem = useCallback(
    ({ item }: { item: User }) => {
      const firstLetter = item.name.charAt(0).toUpperCase();
      const expanded = expandedUserId === item.id;

      return (
        <Pressable
          onPress={() => toggleExpand(item.id)}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
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
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.company}>{item.company.name}</Text>
            </View>

            <Text style={styles.arrow}>{expanded ? "▲" : "▼"}</Text>
          </View>

          <View style={styles.platformBadge}>
            <Text style={styles.platformText}>
              {Platform.OS === "ios" ? "IOS" : "Android"}
            </Text>
          </View>

          {expanded && (
            <View style={styles.expandedArea}>
              {postLoading === item.id ? (
                <ActivityIndicator size="small" />
              ) : (
                postsCache[item.id]
                  ?.slice(0, 3)
                  .map((post) => <Text key={post.id}>{post.title}</Text>)
              )}
            </View>
          )}
        </Pressable>
      );
    },
    [expandedUserId, postsCache, postLoading, width],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <Pressable onPress={fetchUsers}>
          <Text style={styles.retry}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={filteredUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyboardDismissMode="on-drag"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text>No users found</Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Text style={styles.title}>User Directory</Text>
              <Text style={styles.userCount}>{users.length} Users Loaded</Text>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  placeholder="Search Users here..."
                  onChangeText={(text) => setSearch(text)}
                />
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Text>
                Platform: {Platform.OS} | {Math.round(width)}x
                {Math.round(height)}
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  center: {
    alignItems: "center",
    marginTop: 50,
  },

  retry: {
    marginTop: 10,
    color: "blue",
  },

  separator: {
    height: 6,
  },

  footer: {
    alignItems: "center",
    marginVertical: 20,
  },

  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  userCount: {
    marginTop: 4,
    color: "#666",
    fontSize: 14,
  },

  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },

  searchInput: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },

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

  cardPressed: {
    opacity: 0.7,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  userInfo: {
    flex: 1,
  },

  name: {
    fontWeight: "bold",
    fontSize: 16,
  },

  company: {
    color: "#666",
    marginTop: 2,
  },

  arrow: {
    fontSize: 18,
    color: "#999",
  },

  platformBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  platformText: {
    fontSize: 12,
    color: "#333",
  },

  expandedArea: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
