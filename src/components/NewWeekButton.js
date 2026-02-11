import React from 'react';

const NewWeekButton = ({ onNewWeek }) => {
  return (
    <button className="NewWeekButton" onClick={onNewWeek}>
      New Week
    </button>
  );
};

export default NewWeekButton;
