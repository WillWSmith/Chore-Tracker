import React, { useState, useEffect, useContext } from 'react';
import { db } from '../Firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import UserStylesContext from '../contexts/UserStylesContext';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DailyChores = ({ users }) => {
  const [chores, setChores] = useState([]);
  const userStyles = useContext(UserStylesContext);

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
    if (!chore || !chore.days || !chore.days[day]) return;
    
    const currentStatus = chore.days[day].completedBy || 'null';
    const currentUserIndex = currentStatus === 'null' ? -1 : users.indexOf(currentStatus);
    const nextUserIndex = (currentUserIndex + 1) % (users.length + 1);
    const nextUser = nextUserIndex < users.length ? users[nextUserIndex] : 'null';
  
    try {
      const choreRef = doc(db, 'dailyChores', choreId);
      await updateDoc(choreRef, {
        [`days.${day}.completedBy`]: nextUser,
      });
      await fetchData();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const getStyleForUser = (userName) => {
    return userName && userName !== 'null' ? userStyles[userName] || {} : {};
  };

  // Don't render if users haven't loaded yet
  if (!users || users.length === 0) {
    return <div><h2>Daily Chores</h2><p>Loading...</p></div>;
  }

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
          {chores.map(chore => {
            if (!chore.days) return null;
            return (
              <tr key={chore.id}>
                <td className="chore-name">{chore.name}</td>
                {daysOfWeek.map(day => {
                  const dayData = chore.days[day];
                  if (!dayData) return <td key={day}></td>;
                  
                  const completedBy = dayData.completedBy;
                  const userInitial = completedBy && completedBy !== 'null' && users.includes(completedBy) 
                    ? completedBy.charAt(0) 
                    : '';
                  
                  return (
                    <td 
                      style={getStyleForUser(completedBy)} 
                      className="chore-cell"
                      key={day}
                      onClick={() => updateChoreStatus(chore.id, day)}
                    >
                      <span className="cell-initial">{userInitial}</span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DailyChores;
