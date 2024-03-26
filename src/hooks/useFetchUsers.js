import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';

export const useFetchUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'userScores'));
      const usersData = querySnapshot.docs.map(doc => doc.id);
      setUsers(usersData);
    };

    fetchUsers();
  }, []);

  return users;
};