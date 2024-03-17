import React, { useState, useEffect } from 'react';
import { db } from '../Firebase'
import { collection, getDocs } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';

const MonthlyChores = () => {
  const [chores, setChores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'monthlyChores'));
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
    let updateData = { completedBy: null }; // Default update object with only completedBy
  
    switch (currentStatus) {
      case 'null':
        nextStatus = 'Will';
        // Set completionDate to now only if marking the chore as completed
        updateData = {
          completedBy: nextStatus,
          completedDate: new Date(),
        };
        break;
      case 'Will':
        nextStatus = 'Kristyn';
        // Assume completionDate remains unchanged if toggling between Will and Kristyn
        updateData = {
          completedBy: nextStatus,
          // Do not update completedDate here if you want to preserve the original completion date
        };
        break;
      case 'Kristyn':
        nextStatus = 'null';
        // Do not clear the completion date when resetting to 'null'
        updateData = { completedBy: nextStatus };
        break;
      default:
        nextStatus = 'null';
        // Default case, handling unexpected statuses by resetting to 'null'
        updateData = { completedBy: nextStatus };
        break;
    }
  
    try {
      // Update local state
      setChores(prevChores => prevChores.map(c =>
        c.id === choreId ? { ...c, ...updateData } : c
      ));
  
      // Update database
      const choreRef = doc(db, 'monthlyChores', choreId);
      await updateDoc(choreRef, updateData);
    } catch (error) {
      console.error("Error updating document: ", error);
      // Handle the error appropriately in your UI
    }
  };  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  };

  return (
    <div>
      <h2>Monthly Chores</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Completed By</th>
            <th>Completed Date</th>
          </tr>
        </thead>
        <tbody>
          {chores.map(chore => (
            <tr key={chore.id}>
              <td>{chore.name}</td>
              <td className={`chore-cell ${
                chore.completedBy === 'Will' ? 'chore-cell-will' : 
                chore.completedBy === 'Kristyn' ? 'chore-cell-kristyn' : ''
              }`}
              onClick={() => updateChoreStatus(chore.id)}>
                <span className="cell-initial">
                  {chore.completedBy === 'Will' ? 'W' : chore.completedBy === 'Kristyn' ? 'K' : ''}
                </span>
              </td>
              <td>
                {/* Use the helper function to format date */}
                {chore.completedBy ? formatDate(chore.completedDate) : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyChores;