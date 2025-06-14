// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBazMdPZf2Izv10ej5WZD_ueF-n2AV7heM",
  authDomain: "taskdb-db8da.firebaseapp.com",
  projectId: "taskdb-db8da",
  storageBucket: "taskdb-db8da.firebasestorage.app",
  messagingSenderId: "916723840670",
  appId: "1:916723840670:web:7b69dea3c8b92a4404ad8f",
  measurementId: "G-BLH0KJNB0H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;