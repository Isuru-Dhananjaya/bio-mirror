const STORAGE_KEY = 'bio_mirror_history';

export const saveScanResult = (bpm, hrv, stress) => {
  const history = getHistory();
  const newEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateLabel: new Date().toLocaleDateString(),
    bpm,
    hrv,
    stress
  };
  
  history.push(newEntry);
  
  // Keep last 50 scans to save space
  if (history.length > 50) {
    history.shift();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newEntry;
};

export const getHistory = () => {
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
