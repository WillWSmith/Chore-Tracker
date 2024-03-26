import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

function ChoreTracker() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  return (
    <button className="theme-toggle-btn" onClick={toggleTheme}>
{theme === 'light' ? (
    <FontAwesomeIcon icon={faSun} size="2x" />
) : (
    <FontAwesomeIcon icon={faMoon} size="2x" />
)}
</button>
  );
}

export default ChoreTracker;
