import React, { useState } from 'react';
import './App.css';
import ChoreTracker from './components/ChoreTracker';
import DailyChores from './components/DailyChores';
import WeeklyChores from './components/WeeklyChores';
import MonthlyChores from './components/MonthlyChores';
import HiScores from './components/HiScores';
import NewWeekButton from './components/NewWeekButton';
import { db } from './Firebase';
import { collection, getDocs, updateDoc, doc, writeBatch, query, where, increment, getDoc } from 'firebase/firestore';

function App() {
  const [refreshScores, setRefreshScores] = useState(false);

  const handleScoresUpdated = () => {
    setRefreshScores(prev => !prev);
  };

  const calculateAndResetScores = async () => {
    let willScore = 0;
    let kristynScore = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    // Define references to the users' score documents
    const willUserRef = doc(db, 'userScores', 'Will');
    const kristynUserRef = doc(db, 'userScores', 'Kristyn');

    // Fetch current scores from the database
    const willUserDoc = await getDoc(willUserRef);
    const kristynUserDoc = await getDoc(kristynUserRef);
  
    // Assume the document structure contains fields lastWeekScores and allTimeHighScores
    const willCurrentHighScore = willUserDoc.exists() ? willUserDoc.data().allTimeHighScores : 0;
    const kristynCurrentHighScore = kristynUserDoc.exists() ? kristynUserDoc.data().allTimeHighScores : 0;
  
    // Compare and potentially update All-Time High Scores
    const newWillHighScore = Math.max(willScore, willCurrentHighScore);
    const newKristynHighScore = Math.max(kristynScore, kristynCurrentHighScore);
  
    const batch = writeBatch(db);
  
    // Update last week's scores and All-Time High Scores if last week's scores are higher
    batch.update(willUserRef, {
      lastWeekScores: willScore,
      allTimeHighScores: newWillHighScore
    });
    batch.update(kristynUserRef, {
      lastWeekScores: kristynScore,
      allTimeHighScores: newKristynHighScore
    });
  
    // Commit the batch update
    await batch.commit();
    handleScoresUpdated();
  };

  return (
    <div className="App">
      <header className="App-header">
        <ChoreTracker />
      </header>
      <div className="DailyChores">
        <DailyChores />
      </div>
      <div className="WeeklyChores">
        <WeeklyChores />
      </div>
      <div className="MonthlyChores">
        <MonthlyChores />
      </div>
      <NewWeekButton onNewWeek={calculateAndResetScores} />
      <div className="HiScores">
        <HiScores refreshTrigger={refreshScores} />
      </div>
    </div>
  );
}

export default App;
