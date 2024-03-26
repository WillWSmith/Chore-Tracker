import React, { useState, useEffect, useContext } from 'react';
import { db } from '../Firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import UserStylesContext from '../contexts/UserStylesContext';

const WeeklyChores = ({ users }) => {
  const [chores, setChores] = useState([]);
  const userStyles = useContext(UserStylesContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'weeklyChores'));
        const choresData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setChores(choresData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const updateChoreStatus = async (choreId) => {
    const chore = chores.find(c => c.id === choreId);
    const currentStatus = chore.completedBy || 'null';
    const currentUserIndex = currentStatus === 'null' ? -1 : users.indexOf(currentStatus);
    const nextUserIndex = (currentUserIndex + 1) % (users.length + 1);
    const nextUser = nextUserIndex < users.length ? users[nextUserIndex] : 'null';

    try {
      // Update local state
      setChores(prevChores => prevChores.map(c =>
        c.id === choreId ? { ...c, completedBy: nextUser } : c
      ));

      // Update database
      const choreRef = doc(db, 'weeklyChores', choreId);
      await updateDoc(choreRef, {
        completedBy: nextUser,
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const getStyleForUser = (userName) => {
    return userName ? userStyles[userName] || {} : {};
  };

  const getUserInitial = (userName) => {
    return userName && userName !== 'null' ? userName.charAt(0) : '';
  };

  return (
    <div>
      <h2>Weekly Chores</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Completed By</th>
          </tr>
        </thead>
        <tbody>
          {chores.map(chore => (
            <tr key={chore.id}>
              <td className="chore-name">{chore.name}</td>
              <td
                style={getStyleForUser(chore.completedBy)}
                onClick={() => updateChoreStatus(chore.id)}
              >
                <span className="cell-initial">{getUserInitial(chore.completedBy)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyChores;