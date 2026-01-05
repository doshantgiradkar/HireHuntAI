"use client"

import { create } from "zustand";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export const useHeader = create((set) => ({
  title: "",
  setTitle: (s) => set({ title: s }),
}))

export const useUserStore = create((set) => ({
  user: {},

  fetchUser: async (user, isLoaded, isUserLoaded) => {
    try {
      set({ user: {user, isLoaded, isUserLoaded}  });
    } catch (err) {
      set({ error: err.message });
    }
  },

  clearUser: () => set({ user: null }),
}));

export default function UserLoader({ children }) {
  const fetchUser = useUserStore((s) => s.fetchUser);
  const { user, isLoaded, isUserLoaded } = useUser();

  useEffect(() => {
    fetchUser(user, isLoaded, isUserLoaded);
  }, []);

  return children;
}
