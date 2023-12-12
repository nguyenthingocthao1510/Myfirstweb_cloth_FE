import React, { createContext, useState } from 'react';

export const ThemeContext = createContext({
    theme: 'light'
  });

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light'); // Default theme is light

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
