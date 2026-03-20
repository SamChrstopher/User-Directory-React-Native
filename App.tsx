import React, { useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";

import { useUserStore } from "./src/stores/useUserStore";
import { useAuthStore } from "./src/stores/useAuthStore";
import { useUIStore } from "./src/stores/useUIStore";
import { getSecure } from "./src/services/secureStorage";
import { User } from "./src/services/api";

import UserCard from "./src/components/UserCard";
import Header from "./src/components/Header";
import SearchBar from "./src/components/SearchBar";

export default function App() {
  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);

  const favorites = useUserStore((s) => s.favorites);
  const pinnedUserId = useUserStore((s) => s.pinnedUserId);

  const search = useUIStore((s) => s.searchQuery);

  const initializeAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    fetchUsers();
    initializeAuth();

    // restore pinned user from SecureStore
    const loadPinned = async () => {
      const pinned = await getSecure("pinned_user_id");
      if (pinned) {
        useUserStore.getState().setPinnedUser(Number(pinned));
      }
    };

    loadPinned();
  }, []);

  // sorting 
  const sortedUsers = (() => {
    let list = [...users];

    if (pinnedUserId) {
      list = [
        ...list.filter((u) => u.id === pinnedUserId),
        ...list.filter((u) => u.id !== pinnedUserId),
      ];
    }

    const fav = list.filter((u) => favorites.includes(u.id));
    const rest = list.filter((u) => !favorites.includes(u.id));

    return [...fav, ...rest];
  })();

  // apply search on sorted list
  const finalUsers = sortedUsers.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = useCallback(
    ({ item }: { item: User }) => <UserCard userId={item.id} />,
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Header />
        <SearchBar />

        <FlatList
          data={finalUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}