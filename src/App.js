import React, { useState } from 'react';
import './App.css';
import ChoreTracker from './components/ChoreTracker';
import DailyChores from './components/DailyChores';
import WeeklyChores from './components/WeeklyChores';
import MonthlyChores from './components/MonthlyChores';
import HiScores from './components/HiScores';
import NewWeekButton from './components/NewWeekButton';
import { db } from './Firebase';
import { collection, getDocs, updateDoc, doc, writeBatch, query, where, increment } from 'firebase/firestore';

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
  
    // Calculate scores for daily chores
    const dailyChoresSnapshot = await getDocs(collection(db, 'dailyChores'));
    dailyChoresSnapshot.forEach((doc) => {
      Object.values(doc.data().days).forEach(day => {
        if (day.completedBy === 'Will') willScore += 1;
        if (day.completedBy === 'Kristyn') kristynScore += 1;
      });
      // Reset daily chores
      updateDoc(doc.ref, { days: { Monday: { completedBy: 'null' }, Tuesday: { completedBy: 'null' }, Wednesday: { completedBy: 'null' }, Thursday: { completedBy: 'null' }, Friday: { completedBy: 'null' }, Saturday: { completedBy: 'null' }, Sunday: { completedBy: 'null' } } });
    });
  
    // Calculate scores for weekly chores
    const weeklyChoresSnapshot = await getDocs(collection(db, 'weeklyChores'));
    weeklyChoresSnapshot.forEach((doc) => {
      if (doc.data().completedBy === 'Will') willScore += 2;
      if (doc.data().completedBy === 'Kristyn') kristynScore += 2;
      // Reset weekly chores
      updateDoc(doc.ref, { completedBy: 'null' });
    });
  
    // Calculate scores for monthly chores
    const monthlyChoresQuery = query(collection(db, 'monthlyChores'), where('completedDate', '>=', oneWeekAgo));
    const monthlyChoresSnapshot = await getDocs(monthlyChoresQuery);
    monthlyChoresSnapshot.forEach((doc) => {
      if (doc.data().completedBy === 'Will') willScore += 3;
      if (doc.data().completedBy === 'Kristyn') kristynScore += 3;
      // Do not reset monthly chores
    });
  
  // Update user scores in the database
  const batch = writeBatch(db);

  const willUserRef = doc(db, 'userScores', 'Will');
  const kristynUserRef = doc(db, 'userScores', 'Kristyn');

  // Update scores for Will
  batch.update(willUserRef, {
    lastWeekScores: willScore,
    allTimeHighScores: increment(willScore)
  });

  // Update scores for Kristyn
  batch.update(kristynUserRef, {
    lastWeekScores: kristynScore,
    allTimeHighScores: increment(kristynScore)
  });

  // Commit the batch
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
