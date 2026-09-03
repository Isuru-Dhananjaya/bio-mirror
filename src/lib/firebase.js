import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjzHuyTNZTkd33kFMXKp8og4J8Lhecc5M",
  authDomain: "bio-mirror-48b31.firebaseapp.com",
  projectId: "bio-mirror-48b31",
  storageBucket: "bio-mirror-48b31.firebasestorage.app",
  messagingSenderId: "482801827843",
  appId: "1:482801827843:web:ce762ae409c19c65b90e36",
  measurementId: "G-VWV7GKXYM7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
