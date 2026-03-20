import * as SecureStore from "expo-secure-store";

// save value in secure storage
export const saveSecure = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.log("Error saving:", error);
  }
};

// get value from secure storage
export const getSecure = async (key: string): Promise<string | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.log("Error getting:", error);
    return null;
  }
};

// remove value from secure storage
export const deleteSecure = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log("Error deleting:", error);
  }
};