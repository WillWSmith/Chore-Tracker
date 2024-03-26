import React, { useState } from 'react';
import { useFetchUsers } from './hooks/useFetchUsers';
import './App.css';
import UserStylesContext from './contexts/UserStylesContext';
import ChoreTracker from './components/ChoreTracker';
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

  // ***** NOTE ***** //
  // The userStyles object below is used to set the background color of the cells in the DailyChores, WeeklyChores, and HiScores components. In the database the name of the id for userScores is the same as the name of the user. This is the only ID field in which you must use a specific name. All other ID fields can be auto-generated or whatever you'd like without issue. If you'd like to change the name of the id field in userScores, you must also update the userStyles object below to match the new name.
  // ***** NOTE ***** //

  const userStyles = {
    // Default styles; Match Document name for user in db to set cell colour
    // 'document name': { backgroundColor: 'color' }

    // Default Example:
    'Will': { backgroundColor: '#90ee90' },
    'Kristyn': { backgroundColor: '#ffb6c1' },
    'Kevin': { backgroundColor: '#87ceeb' }
  
  };

  const [refreshScores, setRefreshScores] = useState(false);

  const handleScoresUpdated = () => {
    setRefreshScores(prev => !prev);
  };

  const calculateAndResetScores = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    let scores = users.reduce((acc, user) => {
      acc[user] = 0; // Initialize score for each user
      return acc;
    }, {});
  
    const batch = writeBatch(db);
  
    // Reset daily chores and calculate scores
    const dailyChoresSnapshot = await getDocs(collection(db, 'dailyChores'));
    for (const doc of dailyChoresSnapshot.docs) {
      const docUpdate = {};
      Object.keys(doc.data().days).forEach(day => {
        docUpdate[`days.${day}.completedBy`] = 'null'; // Reset completion status
        const completedBy = doc.data().days[day]?.completedBy;
        if (completedBy && scores.hasOwnProperty(completedBy)) {
          scores[completedBy] += 1; // Increment score
        }
      });
      batch.update(doc.ref, docUpdate);
    }
  
    // Reset weekly chores and calculate scores
    const weeklyChoresSnapshot = await getDocs(collection(db, 'weeklyChores'));
    for (const doc of weeklyChoresSnapshot.docs) {
      const completedBy = doc.data().completedBy;
      if (completedBy && scores.hasOwnProperty(completedBy)) {
        scores[completedBy] += 2; // Assuming 2 points per weekly chore
      }
      batch.update(doc.ref, { completedBy: 'null' }); // Resetting after score calculation
    }
  
    // Calculate scores for monthly chores completed within the last week
    const monthlyChoresSnapshot = await getDocs(query(collection(db, 'monthlyChores'), where('completedDate', '>=', oneWeekAgo)));
    for (const doc of monthlyChoresSnapshot.docs) {
      const completedBy = doc.data().completedBy;
      if (completedBy && scores.hasOwnProperty(completedBy)) {
        scores[completedBy] += 3; // Assuming 3 points per monthly chore
      }
      // Note: We're not resetting monthly chores here as they do not reset weekly.
    }
  
    // Prepare updates for user scores in the database
    for (const user of Object.keys(scores)) {
      const userRef = doc(db, 'userScores', user);
      const userDoc = await getDoc(userRef);
      const lastWeekScores = scores[user];
      const allTimeHighScores = userDoc.exists() && userDoc.data().allTimeHighScores > lastWeekScores 
                                ? userDoc.data().allTimeHighScores 
                                : lastWeekScores;
  
      batch.update(userRef, { lastWeekScores, allTimeHighScores });
    }
  
    // Commit the batch after all updates
    try {
      await batch.commit(); // Waits for the batch commit to complete
      console.log('Batch commit successful, refreshing page...');
      window.location.reload(); // Refresh the page
  } catch (error) {
      console.error("Failed to commit batch or refresh page:", error);
  }
  };
  
  return (
  <UserStylesContext.Provider value={userStyles}>
    <div className="App">
    <header className="App-header">
      <h1>Chore Tracker</h1>
      <ChoreTracker />
    </header>
      <div className="DailyChores">
        <DailyChores users={users}/>
      </div>
      <div className="WeeklyChores">
        <WeeklyChores users={users}/>
      </div>
      <div className="MonthlyChores">
        <MonthlyChores users={users}/>
      </div>
      <NewWeekButton onNewWeek={calculateAndResetScores} />
      <div className="HiScores">
        <HiScores refreshTrigger={refreshScores} users={users}/>
      </div>
      <BackToTopButton />
    </div>
    </UserStylesContext.Provider>
  );
}

export default App;