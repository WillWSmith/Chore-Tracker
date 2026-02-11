import React, { useState, useEffect, useContext } from 'react';
import { db } from '../Firebase';
import { collection, getDocs } from 'firebase/firestore';
import UserStylesContext from '../contexts/UserStylesContext';

const HiScores = ({ refreshTrigger }) => {
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const userStyles = useContext(UserStylesContext);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoresSnapshot = await getDocs(collection(db, 'userScores'));
        const newScores = {};
        scoresSnapshot.forEach((doc) => {
          newScores[doc.id] = doc.data();
        });
        setScores(newScores);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching scores: ", error);
        setLoading(false);
      }
    };

    fetchScores();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="scoreboard">
        <h2>High Scores</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="scoreboard">
      <h2>High Scores</h2>
      {Object.keys(scores).map(userName => (
        <div className="score" key={userName}>
          <h3 style={userStyles[userName]}>{userName}</h3>
          <div className="score-value">{scores[userName]?.lastWeekScores || 0}</div>
          <div className="score-indicator">Last Week</div>
          <div className="score-value">{scores[userName]?.allTimeHighScores || 0}</div>
          <div className="score-indicator">All Time</div>
        </div>
      ))}
    </div>
  );
};

export default HiScores;
