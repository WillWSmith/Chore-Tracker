import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3wHBA5XLlkcS9-CL1nQ5K_bBnM8fvJZw",
  authDomain: "chore-tracker-e62ba.firebaseapp.com",
  projectId: "chore-tracker-e62ba",
  storageBucket: "chore-tracker-e62ba.appspot.com",
  messagingSenderId: "628554618127",
  appId: "1:628554618127:web:1a2db6880b1dc986ef1a7a"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export { db };