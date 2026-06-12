import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
  dark:    false,
  bg:      '#faf9f7',
  card:    '#ffffff',
  text:    '#212529',
  muted:   '#6c757d',
  border:  '#e9ecef',
  input:   '#f8f9fa',
  subBg:   '#f8f9ff',
};

export const darkTheme = {
  dark:    true,
  bg:      '#0d1117',       // deep dark navy
  card:    '#161b22',       // slightly lighter card
  text:    '#e6edf3',       // soft white text
  muted:   '#7d8590',       // muted grey
  border:  '#30363d',       // dark border
  input:   '#21262d',       // input background
  subBg:   '#1c2128',       // section background
  accent:  '#238636',       // green accent (GitHub dark style)
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    AsyncStorage.getItem('appTheme').then(saved => {
      if (saved === 'dark') setTheme(darkTheme);
    });
  }, []);

  const toggleTheme = async () => {
    const next = theme.dark ? lightTheme : darkTheme;
    setTheme(next);
    await AsyncStorage.setItem('appTheme', next.dark ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}