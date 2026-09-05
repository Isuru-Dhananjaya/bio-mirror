import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load local profile data initially
    const savedProfile = localStorage.getItem('bioMirrorProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If logged in, try to fetch profile from Firestore
      if (user) {
        try {
          const { db } = await import('../lib/firebase');
          const { doc, getDoc } = await import('firebase/firestore');
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            localStorage.setItem('bioMirrorProfile', JSON.stringify(data));
          }
        } catch (e) {
          console.error("Error fetching Firestore profile:", e);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const saveProfile = async (age, gender) => {
    const profile = { age, gender };
    setUserProfile(profile);
    localStorage.setItem('bioMirrorProfile', JSON.stringify(profile));

    // Save to Firestore if logged in
    if (auth.currentUser) {
      try {
        const { db } = await import('../lib/firebase');
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', auth.currentUser.uid), profile, { merge: true });
      } catch (e) {
        console.error("Error saving profile to Firestore:", e);
      }
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = { currentUser, userProfile, saveProfile, loginWithGoogle, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
