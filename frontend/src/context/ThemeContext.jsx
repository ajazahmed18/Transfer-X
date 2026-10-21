import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Ensure dark class is removed from html and body
    const root = document.documentElement;
    root.classList.remove('dark');
    document.body.classList.remove('dark');
    try {
      localStorage.setItem('peerdrop_theme', 'light');
    } catch (e) {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, setTheme: () => {}, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
