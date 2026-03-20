import axios from "axios";

// user type from API
export interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

// post type from API
export interface Post {
  id: number;
  title: string;
  userId: number;
}

// axios instance 
const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

// fetch all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get("/users"); 
    return response.data; 
  } catch (error) {
    console.log("Error: ", error);
    throw error; 
  }
};

// fetch posts for a specific user
export const getPostsForUser = async (userId: number): Promise<Post[]> => {
  try {
    const response = await api.get(`/posts?userId=${userId}`); // filter by userId
    return response.data;
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};