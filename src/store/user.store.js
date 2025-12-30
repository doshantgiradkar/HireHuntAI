import { create } from 'zustand';


export const useHeader = create((set) => ({
  title: "",
  setTitle: (s) => set({ title: s }),
}))
