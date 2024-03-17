import React, { useState, useEffect } from 'react';
import { db } from '../Firebase'
import { collection, getDocs } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

const WeeklyChores = () => {
  const [chores, setChores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'weeklyChores'));
        const choresData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setChores(choresData);
      } catch (error) {
        console.error("Error fetching data: ", error);
        // Handle the error appropriately in your UI
      }
    };

    fetchData();
  }, []);

  const updateChoreStatus = async (choreId) => {
    const chore = chores.find(c => c.id === choreId);
    const currentStatus = chore.completedBy;
    let nextStatus;

    switch (currentStatus) {
      case 'null':
        nextStatus = 'Will';
        break;
      case 'Will':
        nextStatus = 'Kristyn';
        break;
      case 'Kristyn':
        nextStatus = 'null';
        break;
      default:
        nextStatus = 'null';
        break;
    }

    try {
      // Update local state
      setChores(prevChores => prevChores.map(c =>
        c.id === choreId ? { ...c, completedBy: nextStatus } : c
      ));

      // Update database
      const choreRef = doc(db, 'weeklyChores', choreId);
      await updateDoc(choreRef, {
        completedBy: nextStatus,
      });
    } catch (error) {
      console.error("Error updating document: ", error);
      // Handle the error appropriately in your UI
    }
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
          {chores.map(chore => {
            let cellClass = 'chore-cell'; // Default cell class
            if (chore.completedBy === 'Will') {
              cellClass += ' chore-cell-will';
            } else if (chore.completedBy === 'Kristyn') {
              cellClass += ' chore-cell-kristyn';
            }
  
            return (
              <tr key={chore.id}>
                <td>{chore.name}</td>
                <td className={cellClass}
                    onClick={() => updateChoreStatus(chore.id)}>
                  <span className="cell-initial">
                    {chore.completedBy === 'Will' ? 'W' : chore.completedBy === 'Kristyn' ? 'K' : ''}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyChores;