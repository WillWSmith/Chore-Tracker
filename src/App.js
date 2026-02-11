import React, { useState } from 'react';
import { useFetchUsers } from './hooks/useFetchUsers';
import './App.css';
import UserStylesContext from './contexts/UserStylesContext';
import DailyChores from './components/DailyChores';
import WeeklyChores from './components/WeeklyChores';
import MonthlyChores from './components/MonthlyChores';
import HiScores from './components/HiScores';
import NewWeekButton from './components/NewWeekButton';
import BackToTopButton from './components/BackToTopButton';
import { db } from './Firebase';
import { collection, getDocs, doc, writeBatch, query, where, getDoc } from 'firebase/firestore';

function App() {
  const users = useFetchUsers();
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('userTheme') || 'will';
  });

  const userStyles = {
    'Will': { backgroundColor: '#90ee90' },
    'Kristyn': { backgroundColor: '#ffb6c1' },
    'Kevin': { backgroundColor: '#87ceeb' }
  };

  const [refreshScores, setRefreshScores] = useState(false);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'will' ? 'kristyn' : 'will';
    setCurrentTheme(newTheme);
    localStorage.setItem('userTheme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  React.useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const calculateAndResetScores = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    let scores = users.reduce((acc, user) => {
      acc[user] = 0;
      return acc;
    }, {});
  
    const batch = writeBatch(db);
  
    const dailyChoresSnapshot = await getDocs(collection(db, 'dailyChores'));
    for (const doc of dailyChoresSnapshot.docs) {
      const docUpdate = {};
      Object.keys(doc.data().days).forEach(day => {
        docUpdate[`days.${day}.completedBy`] = 'null';
        const completedBy = doc.data().days[day]?.completedBy;
        if (completedBy && scores.hasOwnProperty(completedBy)) {
          scores[completedBy] += 1;
        }
      });
      batch.update(doc.ref, docUpdate);
    }
  
    const weeklyChoresSnapshot = await getDocs(collection(db, 'weeklyChores'));
    for (const doc of weeklyChoresSnapshot.docs) {
      const completedBy = doc.data().completedBy;
      if (completedBy && scores.hasOwnProperty(completedBy)) {
        scores[completedBy] += 2;
      }
      batch.update(doc.ref, { completedBy: 'null' });
    }
  
    const monthlyChoresSnapshot = await getDocs(query(collection(db, 'monthlyChores'), where('completedDate', '>=', oneWeekAgo)));
    for (const doc of monthlyChoresSnapshot.docs) {
      const completedBy = doc.data().completedBy;
      if (completedBy && scores.hasOwnProperty(completedBy)) {
        scores[completedBy] += 3;
      }
    }
  
    for (const user of Object.keys(scores)) {
      const userRef = doc(db, 'userScores', user);
      const userDoc = await getDoc(userRef);
      const lastWeekScores = scores[user];
      const allTimeHighScores = userDoc.exists() && userDoc.data().allTimeHighScores > lastWeekScores 
                                ? userDoc.data().allTimeHighScores 
                                : lastWeekScores;
  
      batch.update(userRef, { lastWeekScores, allTimeHighScores });
    }
  
    try {
      await batch.commit();
      setRefreshScores(prev => !prev);
      console.log('Batch commit successful, refreshing page...');
      window.location.reload();
    } catch (error) {
      console.error("Failed to commit batch or refresh page:", error);
    }
  };
  
  return (
    <UserStylesContext.Provider value={userStyles}>
      <div className="App">
        <header className="App-header">
          <h1>Chore Tracker</h1>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {currentTheme === 'will' ? 'W' : 'K'}
          </button>
        </header>
        
        <div className="DailyChores">
          <DailyChores users={users} />
        </div>
        
        <div className="WeeklyChores">
          <WeeklyChores users={users} />
        </div>
        
        <div className="MonthlyChores">
          <MonthlyChores users={users} />
        </div>
        
        <NewWeekButton onNewWeek={calculateAndResetScores} />
        
        <div className="HiScores">
          <HiScores refreshTrigger={refreshScores} users={users} />
        </div>
        
        <BackToTopButton />
      </div>
    </UserStylesContext.Provider>
  );
}

export default App;
