import React, { useState, useEffect } from 'react';
import { db } from '../Firebase';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weeklyChores = [
  "Aria's Room", "Aria's Bed", "Daniel's Room", "Daniel's Bed", "Basement",
  "Our Bed", "Living Room", "Bathroom", "Kitchen", "Garbage", "Recycling",
  "Sweep Upstairs", "Sweep Downstairs", "Mop Upstairs", "Mop Basement",
  "Laundry Away", "Bathe Kids", "Mop Main Floor"
];
const monthlyChores = [
  "Litter", "Fridge", "Dust Upstairs", "Dust Downstairs", "Dust Main Floor",
  "Car", "Microwave", "Oven", "Inside Cabinets", "Outside Cabinets",
  "Daniel's Walls", "Aria's Walls", "Upstairs Hall Walls",
  "Living Room Walls", "Kitchen Walls", "Bathroom Walls", "Downstairs Hall Walls",
  "Basement Walls"
];

function ChoreTable() {
  const [completedDailyChores, setCompletedDailyChores] = useState({});
  const [completedWeeklyChores, setCompletedWeeklyChores] = useState({});
  const [completedMonthlyChores, setCompletedMonthlyChores] = useState({});
  const [lastWeeksScores, setLastWeeksScores] = useState({ Will: 0, Kristyn: 0 });
  const [allTimeHighScores, setAllTimeHighScores] = useState({ Will: 0, Kristyn: 0 });

  useEffect(() => {
    const fetchChores = async () => {
      try {
        // Fetch daily chores from Firestore
        const dailyChoresSnapshot = await db.collection('dailyChores').get();
        const dailyChoresData = {};
        dailyChoresSnapshot.forEach(doc => {
          dailyChoresData[doc.id] = doc.data();
        });
        setCompletedDailyChores(dailyChoresData);

        // Fetch weekly chores from Firestore
        const weeklyChoresSnapshot = await db.collection('weeklyChores').get();
        const weeklyChoresData = {};
        weeklyChoresSnapshot.forEach(doc => {
          weeklyChoresData[doc.id] = doc.data();
        });
        setCompletedWeeklyChores(weeklyChoresData);

        // Fetch monthly chores from Firestore
        const monthlyChoresSnapshot = await db.collection('monthlyChores').get();
        const monthlyChoresData = {};
        monthlyChoresSnapshot.forEach(doc => {
          monthlyChoresData[doc.id] = doc.data();
        });
        setCompletedMonthlyChores(monthlyChoresData);

        // Fetch last week's scores from Firestore
        const willLastWeeksScoresSnapshot = await db.collection('userScores').doc('Will').get();
        const willLastWeeksScoresData = willLastWeeksScoresSnapshot.data()?.lastWeekScores || 0;
        const kristynLastWeeksScoresSnapshot = await db.collection('userScores').doc('Kristyn').get();
        const kristynLastWeeksScoresData = kristynLastWeeksScoresSnapshot.data()?.lastWeekScores || 0;
        setLastWeeksScores({ Will: willLastWeeksScoresData, Kristyn: kristynLastWeeksScoresData });

        // Fetch all-time high scores from Firestore
        const willAllTimeHighScoresSnapshot = await db.collection('userScores').doc('Will').get();
        const willAllTimeHighScoresData = willAllTimeHighScoresSnapshot.data()?.allTimeHighScores || 0;
        const kristynAllTimeHighScoresSnapshot = await db.collection('userScores').doc('Kristyn').get();
        const kristynAllTimeHighScoresData = kristynAllTimeHighScoresSnapshot.data()?.allTimeHighScores || 0;
        setAllTimeHighScores({ Will: willAllTimeHighScoresData, Kristyn: kristynAllTimeHighScoresData });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchChores();
  }, []);

  const handleDailyChoreClick = (day, chore) => {
    setCompletedDailyChores(prevState => ({
      ...prevState,
      [day]: {
        ...prevState[day],
        [chore]: prevState[day]?.[chore] === 'Will' ? 'Kristyn' : (prevState[day]?.[chore] === 'Kristyn' ? null : 'Will'),
      },
    }));
  };

  const handleWeeklyChoreClick = (chore) => {
    setCompletedWeeklyChores(prevState => ({
      ...prevState,
      [chore]: prevState[chore] === 'Will' ? 'Kristyn' : (prevState[chore] === 'Kristyn' ? null : 'Will'),
    }));
  };

  const handleMonthlyChoreClick = (chore) => {
    setCompletedMonthlyChores(prevState => {
      const prevChore = prevState[chore] || {};
      const completedBy = prevChore.completedBy === 'Will' ? 'Kristyn' : (prevChore.completedBy === 'Kristyn' ? null : 'Will');
      const currentDate = new Date();
      const completedDate = completedBy ? currentDate.toISOString().split('T')[0] : null;

      return {
        ...prevState,
        [chore]: {
          completedBy,
          completedDate
        }
      };
    });
  };

  const calculateScores = () => {
    let willScore = 0;
    let kristynScore = 0;

    // Calculate scores for daily chores
    daysOfWeek.forEach(day => {
      Object.values(completedDailyChores[day] || {}).forEach(chore => {
        if (chore === 'Will') willScore++;
        if (chore === 'Kristyn') kristynScore++;
      });
    });

    // Calculate scores for weekly chores
    weeklyChores.forEach(chore => {
      if (completedWeeklyChores[chore] === 'Will') willScore += 2;
      if (completedWeeklyChores[chore] === 'Kristyn') kristynScore += 2;
    });

    // Calculate scores for monthly chores completed in the last week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    monthlyChores.forEach(chore => {
      const completedDate = new Date(completedMonthlyChores[chore]?.completedDate);
      if (completedMonthlyChores[chore]?.completedBy && completedDate > lastWeek) {
        if (completedMonthlyChores[chore].completedBy === 'Will') willScore += 3;
        if (completedMonthlyChores[chore].completedBy === 'Kristyn') kristynScore += 3;
      }
    });

    // Update last week's scores
    setLastWeeksScores({ Will: willScore, Kristyn: kristynScore });

    // Update all-time high scores
    setAllTimeHighScores(prevScores => ({
      Will: Math.max(willScore, prevScores.Will),
      Kristyn: Math.max(kristynScore, prevScores.Kristyn)
    }));
  };

  return (
    <div>
    <h2>Daily Chores</h2>
    {/* Table for daily chores */}
    <table>
      <thead>
        <tr>
          <th></th>
          {daysOfWeek.map(day => (
            <th key={day}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {['Dishes', 'Sweep', 'Garbage', 'Laundry', 'Feed Cats', 'Toys'].map(chore => (
          <tr key={chore}>
            <td>{chore}</td>
            {daysOfWeek.map(day => (
              <td
                key={`${day}-${chore}`}
                onClick={() => handleDailyChoreClick(day, chore)}
                style={{
                  backgroundColor: completedDailyChores[day]?.[chore] === 'Will' ? 'green' : (completedDailyChores[day]?.[chore] === 'Kristyn' ? 'pink' : 'white'),
                  cursor: 'pointer',
                  color: 'black',
                  textAlign: 'center',
                }}
              >
                {completedDailyChores[day]?.[chore] === 'Will' && 'W'}
                {completedDailyChores[day]?.[chore] === 'Kristyn' && 'K'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    
    <h2>Weekly Chores</h2>
    {/* Table for weekly chores */}
    <div className="weekly-chore-container">
    <table>
    <thead>
    <tr>
      <th></th>
      <th>Completed</th>
    </tr>
    </thead>
    <tbody>
    {/* First half of the weekly chores */}
    {weeklyChores.slice(0, Math.ceil(weeklyChores.length / 2)).map(chore => (
      <tr key={chore}>
        <td>{chore}</td>
        <td
          onClick={() => handleWeeklyChoreClick(chore)}
          style={{
            backgroundColor: completedWeeklyChores[chore] === 'Will' ? 'green' : (completedWeeklyChores[chore] === 'Kristyn' ? 'pink' : 'white'),
            cursor: 'pointer',
            color: 'black',
            textAlign: 'center',
          }}
        >
          {completedWeeklyChores[chore] === 'Will' && 'W'}
          {completedWeeklyChores[chore] === 'Kristyn' && 'K'}
        </td>
      </tr>
    ))}
    </tbody>
    </table>
    
    <table>
    <thead>
    <tr>
      <th></th>
      <th>Completed</th>
    </tr>
    </thead>
    <tbody>
    {/* Second half of the weekly chores */}
    {weeklyChores.slice(Math.ceil(weeklyChores.length / 2)).map(chore => (
      <tr key={chore}>
        <td>{chore}</td>
        <td
          onClick={() => handleWeeklyChoreClick(chore)}
          style={{
            backgroundColor: completedWeeklyChores[chore] === 'Will' ? 'green' : (completedWeeklyChores[chore] === 'Kristyn' ? 'pink' : 'white'),
            cursor: 'pointer',
            color: 'black',
            textAlign: 'center',
          }}
        >
          {completedWeeklyChores[chore] === 'Will' && 'W'}
          {completedWeeklyChores[chore] === 'Kristyn' && 'K'}
        </td>
      </tr>
    ))}
    </tbody>
    </table>
    </div>
    
    <h2>Monthly Chores</h2>
    {/* Table for monthly chores */}
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Completed By</th>
          <th>Completed Date</th>
        </tr>
      </thead>
      <tbody>
        {monthlyChores.map(chore => (
          <tr key={chore}>
            <td>{chore}</td>
            <td
              onClick={() => handleMonthlyChoreClick(chore)}
              style={{
                backgroundColor: completedMonthlyChores[chore]?.completedBy === 'Will' ? 'green' : (completedMonthlyChores[chore]?.completedBy === 'Kristyn' ? 'pink' : 'white'),
                cursor: 'pointer',
                color: 'black',
                textAlign: 'center',
              }}
            >
              {completedMonthlyChores[chore]?.completedBy === 'Will' && 'W'}
              {completedMonthlyChores[chore]?.completedBy === 'Kristyn' && 'K'}
            </td>
            <td>{completedMonthlyChores[chore]?.completedDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
    
    <button className="button" onClick={calculateScores}>New Week</button>
    {/* Display last week's scores */}
    <div className="high-scores">
    <h3>Last Week's Scores</h3>
    <div className="score-container">
    <div className="score">
    <h4>Will</h4>
    <p>{lastWeeksScores.Will}</p>
    </div>
    <div className="score">
    <h4>Kristyn</h4>
    <p>{lastWeeksScores.Kristyn}</p>
    </div>
    </div>
    <h3>All-time HiScores</h3>
    <div className="score-container">
    <div className="score">
    <h4>Will</h4>
    <p>{allTimeHighScores.Will}</p>
    </div>
    <div className="score">
    <h4>Kristyn</h4>
    <p>{allTimeHighScores.Kristyn}</p>
    </div>
    </div>
    </div>
    
    </div>
    );
}

export default ChoreTable;
