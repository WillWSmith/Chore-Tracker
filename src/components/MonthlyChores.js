import React, { useState, useEffect, useContext } from 'react';
import { db } from '../Firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import UserStylesContext from '../contexts/UserStylesContext';

const MonthlyChores = ({ users }) => {
  const [chores, setChores] = useState([]);
  const userStyles = useContext(UserStylesContext);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'monthlyChores'));
      const choresData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        completedDate: doc.data().completedDate ? new Date(doc.data().completedDate.toDate()) : null
      }));
      setChores(choresData);
    };

    fetchData();
  }, []);

  const updateChoreStatus = async (choreId) => {
    const chore = chores.find(c => c.id === choreId);
    const currentStatus = chore.completedBy || 'null';
    const currentUserIndex = currentStatus === 'null' ? -1 : users.indexOf(currentStatus);
    const nextUserIndex = (currentUserIndex + 1) % (users.length + 1);
    const nextUser = nextUserIndex < users.length ? users[nextUserIndex] : 'null';
    const updateData = {
      completedBy: nextUser,
      completedDate: nextUser !== 'null' ? Timestamp.fromDate(new Date()) : null,
    };

    try {
      setChores(prevChores => prevChores.map(c =>
        c.id === choreId ? { ...c, ...updateData } : c
      ));

      const choreRef = doc(db, 'monthlyChores', choreId);
      await updateDoc(choreRef, updateData);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return typeof date.toDate === 'function' ? date.toDate().toLocaleDateString() : date.toLocaleDateString();
  };

  const getStyleForUser = (userName) => {
    return userName && userName !== 'null' ? userStyles[userName] || {} : {};
  };

  const getInitials = (name) => {
    return name && name !== 'null' ? name.charAt(0) : '';
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
              <td className="chore-name">{chore.name}</td>
              <td style={getStyleForUser(chore.completedBy)}
                  onClick={() => updateChoreStatus(chore.id)}>
                <span className="cell-initial">
                  {getInitials(chore.completedBy)}
                </span>
              </td>
              <td className="centerDate">
                {chore.completedBy !== 'null' ? formatDate(chore.completedDate) : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyChores;