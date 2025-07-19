//use zustand for global state avoid props drilling
import { create } from "zustand";

//return global accessibel object
export const useThemeStore = create((set) => ({
  //create state here
  theme: localStorage.getItem("tomchat-theme") || "forest", //check to see if user has a set theme first
  setTheme: (theme) => {
    //update local storage when user set theme
    localStorage.setItem("tomchat-theme", theme);
    set({ theme });
  },
}));
