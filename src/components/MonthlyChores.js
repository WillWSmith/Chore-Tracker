import React, { useState, useEffect } from 'react';
import { db } from '../Firebase'
import { collection, getDocs } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const MonthlyChores = () => {
  const [chores, setChores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'monthlyChores'));
      const choresData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        // Ensure completedDate is either kept as a Firestore Timestamp or converted to a Date object
        completedDate: doc.data().completedDate ? new Date(doc.data().completedDate.toDate()) : null
      }));
      setChores(choresData);
    };

    fetchData();
  }, []);

  const updateChoreStatus = async (choreId) => {
    const chore = chores.find(c => c.id === choreId);
    const currentStatus = chore.completedBy;
    let nextStatus;
    let updateData = {};
  
    switch (currentStatus) {
      case 'null':
        nextStatus = 'Will';
        // Set completedBy to 'Will' and completionDate to now, as a Firestore Timestamp
        updateData = {
          completedBy: nextStatus,
          completedDate: Timestamp.fromDate(new Date()), // Convert JavaScript Date to Firestore Timestamp
        };
        break;
      case 'Will':
        nextStatus = 'Kristyn';
        // Set completedBy to 'Kristyn' without touching completedDate
        updateData = {
          completedBy: nextStatus,
          // completedDate remains unchanged, so we don't include it in updateData
        };
        break;
      case 'Kristyn':
        nextStatus = 'null';
        // Set completedBy to 'null' without clearing the completedDate
        updateData = {
          completedBy: nextStatus,
          // Optionally clear completedDate here if that's desired behavior
          // If keeping the date, just don't include it in updateData
        };
        break;
      default:
        nextStatus = 'null';
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
    }
  };

  const formatDate = (date) => {
    // Check if it's a Firestore Timestamp by checking for toDate method
    if (date && typeof date.toDate === 'function') {
      // It's a Firestore Timestamp, convert to JavaScript Date object
      return date.toDate().toLocaleDateString();
    } else if (date instanceof Date) {
      // It's already a JavaScript Date object
      return date.toLocaleDateString();
    }
    // Not a date we can format
    return '';
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