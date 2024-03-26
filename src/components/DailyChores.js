import React, { useState, useEffect, useContext } from 'react';
import { db } from '../Firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import UserStylesContext from '../contexts/UserStylesContext';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DailyChores = ({ users }) => {
  const [chores, setChores] = useState([]);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'dailyChores'));
      const choresData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setChores(choresData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateChoreStatus = async (choreId, day) => {
    const chore = chores.find(c => c.id === choreId);
    const currentStatus = chore.days[day]?.completedBy || 'null';
    const currentUserIndex = currentStatus === 'null' ? -1 : users.indexOf(currentStatus);
    const nextUserIndex = (currentUserIndex + 1) % (users.length + 1);
    const nextUser = nextUserIndex < users.length ? users[nextUserIndex] : 'null';
  
    try {
      // Update database
      const choreRef = doc(db, 'dailyChores', choreId);
      await updateDoc(choreRef, {
        [`days.${day}.completedBy`]: nextUser,
      });
  
      // After successful update, refetch data to ensure UI is in sync
      await fetchData();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const userStyles = useContext(UserStylesContext);

  const getStyleForUser = (userName) => {
    return userName ? userStyles[userName] || {} : {};
  };

  return (
    <div>
      <h2>Daily Chores</h2>
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
  {chores.map(chore => (
    <tr key={chore.id}>
      <td className="chore-name">{chore.name}</td>
      {daysOfWeek.map(day => {
        const completedBy = chore.days[day]?.completedBy;
        let cellClass = 'chore-cell';
        // Find user in the users array and get the initial
        const userInitial = users.includes(completedBy) ? completedBy.charAt(0) : '';
        if (completedBy) {
          cellClass += ` chore-cell-${completedBy.toLowerCase()}`;
        }
        return (
          <td style={getStyleForUser(chore.days[day]?.completedBy)} className={cellClass}
              key={day}
              onClick={() => updateChoreStatus(chore.id, day)}
          >
            <span className="cell-initial">{userInitial}</span>
          </td>
        );
      })}
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
};

export default DailyChores;