import React, { useState, useEffect, useContext } from 'react';
import { db } from '../Firebase';
import { collection, getDocs } from 'firebase/firestore';
import UserStylesContext from '../contexts/UserStylesContext';

const HiScores = ({ refreshTrigger }) => {
  const [scores, setScores] = useState({});
  const userStyles = useContext(UserStylesContext);

  useEffect(() => {
    const fetchScores = async () => {
      const scoresSnapshot = await getDocs(collection(db, 'userScores'));
      const newScores = {};
      scoresSnapshot.forEach((doc) => {
        newScores[doc.id] = doc.data();
      });
      setScores(newScores);
    };

    fetchScores();
  }, [refreshTrigger]);

  return (
    <div className="scoreboard">
      <h2>High Scores</h2>
      {Object.keys(scores).map(userName => (
        <div className="score" key={userName}>
          <h3 style={userStyles[userName]}>{userName}</h3>
          <div className="score-value">{scores[userName].lastWeekScores}</div>
          <div className="score-indicator">Last Week</div>
          <div className="score-value">{scores[userName].allTimeHighScores}</div>
          <div className="score-indicator">All Time</div>
        </div>
      ))}
    </div>
  );
};

export default HiScores;

