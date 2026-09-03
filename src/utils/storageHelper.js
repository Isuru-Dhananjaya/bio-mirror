import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

const STORAGE_KEY = 'bio_mirror_history';

export const saveScanResult = async (bpm, hrv, stress) => {
  const user = auth.currentUser;
  const newEntry = {
    date: new Date().toISOString(),
    timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateLabel: new Date().toLocaleDateString(),
    bpm,
    hrv,
    stress,
    createdAt: new Date().getTime() // Storing as timestamp number for easier ordering
  };

  if (user) {
    newEntry.uid = user.uid;
    try {
      await addDoc(collection(db, 'scans'), newEntry);
      console.log("Saved to Cloud Firestore");
    } catch (e) {
      console.error("Error saving to Firestore:", e);
    }
  } else {
    // Fallback to local storage if not logged in
    const history = getLocalHistory();
    history.push({ ...newEntry, id: Date.now().toString() });
    if (history.length > 50) history.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
  return newEntry;
};

export const getHistory = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      // Need a composite index for where + orderBy. We will just use where and sort locally to avoid requiring index creation by the user initially.
      const q = query(
        collection(db, 'scans'), 
        where("uid", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt ascending
      return docs.sort((a, b) => a.createdAt - b.createdAt);
    } catch (e) {
      console.error("Error getting history from Firestore:", e);
      return [];
    }
  } else {
    return getLocalHistory();
  }
};

const getLocalHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading history", e);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
