import React, { useState, useEffect } from 'react';
import { db } from '../Firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import NewWeekButton from './NewWeekButton';

const HiScores = () => {
  // Initial state structure corrected
  const [scores, setScores] = useState({
    Will: { lastWeekScores: 0, allTimeHighScores: 0 },
    Kristyn: { lastWeekScores: 0, allTimeHighScores: 0 }
  });

  useEffect(() => {
    // Fetch the all-time high scores and last week's scores from the database
    const fetchScores = async () => {
      const willDocRef = doc(db, 'userScores', 'Will');
      const kristynDocRef = doc(db, 'userScores', 'Kristyn');

      const willDoc = await getDoc(willDocRef);
      const kristynDoc = await getDoc(kristynDocRef);

      if (willDoc.exists()) {
        setScores((prevScores) => ({
          ...prevScores,
          Will: willDoc.data(),
        }));
      }
      if (kristynDoc.exists()) {
        setScores((prevScores) => ({
          ...prevScores,
          Kristyn: kristynDoc.data(),
        }));
      }
    };

    fetchScores();
  }, []);

  return (
    <div className="scoreboard">
      <h2>High Scores</h2>
      <div className="score">
        <h3>Will</h3>
        <div className="score-value">{scores.Will.lastWeekScores}</div>
        <div className="score-indicator">Last Week</div>
        <div className="score-value">{scores.Will.allTimeHighScores}</div>
        <div className="score-indicator">All Time</div>
      </div>
      <div className="score">
        <h3>Kristyn</h3>
        <div className="score-value">{scores.Kristyn.lastWeekScores}</div>
        <div className="score-indicator">Last Week</div>
        <div className="score-value">{scores.Kristyn.allTimeHighScores}</div>
        <div className="score-indicator">All Time</div>
      </div>
    </div>
  );
  
};

export default HiScores;
