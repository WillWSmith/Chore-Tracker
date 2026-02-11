import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/free-solid-svg-icons';

/**
 * Theme toggle placeholder
 *
 * The application now uses a single unified dark theme, so there is no
 * need to switch between light and dark modes.  This component
 * displays a moon icon to hint at the dark‑themed design but does not
 * perform any toggling action.  The presence of a button keeps the
 * header layout consistent and allows for future enhancements.
 */
function ChoreTracker() {
  return (
    <button className="theme-toggle-btn" aria-label="Theme toggle" disabled>
      <FontAwesomeIcon icon={faMoon} size="2x" />
    </button>
  );
}

export default ChoreTracker;

