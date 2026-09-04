import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export const getHealthInsight = (bpm, hrv, stress, burnout, t, age, gender) => {
  if (!bpm || !hrv) return null;

  // Set baselines based on Age and Gender (simplified medical heuristics)
  let maxBpmThreshold = 100;
  let athleticBpmThreshold = 60;
  
  if (age) {
    const ageNum = parseInt(age, 10);
    if (ageNum > 50) {
      maxBpmThreshold = 90; // Lower threshold for older adults
      athleticBpmThreshold = 65;
    } else if (ageNum < 25) {
      maxBpmThreshold = 110; // Higher threshold for youth
      athleticBpmThreshold = 55;
    }
  }

  if (gender === 'female') {
    // Women typically have a slightly higher resting heart rate (approx 2-3 bpm higher)
    maxBpmThreshold += 3;
    athleticBpmThreshold += 3;
  }

  // CRITICAL WARNINGS (Overrides everything else)
  if (bpm > maxBpmThreshold || stress > 65 || burnout > 70) {
    return { 
      type: 'warning', 
      icon: AlertCircle, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/50', 
      title: t('highStressTitle'), 
      msg: t('highStressMsg'), 
      healable: true 
    };
  }
  
  // LOW RECOVERY / FATIGUE
  if (hrv < 25 || burnout > 50 || (bpm < (athleticBpmThreshold - 5) && hrv < 50)) {
    return { 
      type: 'warning', 
      icon: AlertCircle, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/50', 
      title: t('lowRecoveryTitle'), 
      msg: t('lowRecoveryMsg'), 
      healable: true 
    };
  }

  // ATHLETIC CONDITION (Strictly verified)
  if (bpm < athleticBpmThreshold && hrv > 60 && stress < 40 && burnout < 30) {
    return { 
      type: 'success', 
      icon: CheckCircle2, 
      color: 'text-cyber-green', 
      bg: 'bg-cyber-green/10', 
      border: 'border-cyber-green/50', 
      title: t('athleticTitle'), 
      msg: t('athleticMsg'), 
      healable: false 
    };
  }

  // OPTIMAL
  if (bpm >= athleticBpmThreshold && bpm <= (maxBpmThreshold - 10) && stress <= 50 && burnout <= 40) {
    return { 
      type: 'success', 
      icon: CheckCircle2, 
      color: 'text-cyber-cyan', 
      bg: 'bg-cyber-cyan/10', 
      border: 'border-cyber-cyan/50', 
      title: t('optimalTitle'), 
      msg: t('optimalMsg'), 
      healable: false 
    };
  }

  // MODERATE FALLBACK
  return { 
    type: 'info', 
    icon: Info, 
    color: 'text-cyber-purple', 
    bg: 'bg-cyber-purple/10', 
    border: 'border-cyber-purple/50', 
    title: t('moderateTitle'), 
    msg: t('moderateMsg'), 
    healable: false 
  };
};
