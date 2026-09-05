import React, { useState, useEffect } from 'react';
import { UserCircle2, ChevronRight, Activity, MoveVertical, Weight, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function UserProfileModal({ isOpen, onComplete }) {
  const { saveProfile } = useAuth();
  const { lang } = useLanguage();
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('170'); // cm
  const [weight, setWeight] = useState('65'); // kg
  const [error, setError] = useState('');

  const [bmi, setBmi] = useState(22.5);
  const [bmr, setBmr] = useState(1600);
  const [idealMin, setIdealMin] = useState(53);
  const [idealMax, setIdealMax] = useState(72);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bioMirrorProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.age) setAge(parsed.age.toString());
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.height) setHeight(parsed.height.toString());
        if (parsed.weight) setWeight(parsed.weight.toString());
      }
    } catch (e) {}
  }, []);

  // Live Calculations
  useEffect(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age, 10) || 25;

    if (h > 0 && w > 0) {
      const hMeters = h / 100;
      const calcBmi = w / (hMeters * hMeters);
      setBmi(calcBmi);
      
      setIdealMin(Math.round(18.5 * (hMeters * hMeters)));
      setIdealMax(Math.round(24.9 * (hMeters * hMeters)));

      // Mifflin-St Jeor Equation
      if (gender === 'male') {
        setBmr(Math.round(10 * w + 6.25 * h - 5 * a + 5));
      } else {
        setBmr(Math.round(10 * w + 6.25 * h - 5 * a - 161));
      }
    }
  }, [height, weight, age, gender]);

  const texts = {
    en: {
      title: 'Digital Body Profile',
      desc: 'Set your biological baseline to unlock hyper-accurate AI health insights.',
      ageLabel: 'Age',
      genderLabel: 'Biological Sex',
      heightLabel: 'Height (cm)',
      weightLabel: 'Weight (kg)',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      btn: 'INITIALIZE SCANNER',
      err: 'Please enter valid numbers.',
      bmiUnder: 'Underweight',
      bmiNormal: 'Optimal',
      bmiOver: 'Overweight',
      bmiObese: 'Obese',
      idealRange: 'Ideal Weight',
      bmrLabel: 'Daily Calories',
      kcal: 'kcal'
    },
    si: {
      title: 'ශරීර දත්ත පැතිකඩ',
      desc: 'වඩාත් නිවැරදි සෞඛ්‍ය විශ්ලේෂණයක් සඳහා ඔබගේ නිවැරදි දත්ත ලබා දෙන්න.',
      ageLabel: 'වයස',
      genderLabel: 'ස්ත්‍රී/පුරුෂ භාවය',
      heightLabel: 'උස (cm)',
      weightLabel: 'බර (kg)',
      male: 'පුරුෂ',
      female: 'ස්ත්‍රී',
      other: 'වෙනත්',
      btn: 'ස්කෑන් කිරීම අරඹන්න',
      err: 'කරුණාකර නිවැරදි අගයන් ඇතුලත් කරන්න.',
      bmiUnder: 'බර අඩුයි',
      bmiNormal: 'නිරෝගී',
      bmiOver: 'බර වැඩියි',
      bmiObese: 'තරබාරුයි',
      idealRange: 'නියමිත බර',
      bmrLabel: 'දිනකට අවශ්‍ය කැලරි',
      kcal: 'kcal'
    },
    ta: {
      title: 'உடல் தரவு',
      desc: 'துல்லியமான AI பகுப்பாய்விற்கு உங்கள் தரவை வழங்கவும்.',
      ageLabel: 'வயது',
      genderLabel: 'பாலினம்',
      heightLabel: 'உயரம் (cm)',
      weightLabel: 'எடை (kg)',
      male: 'ஆண்',
      female: 'பெண்',
      other: 'மற்றவை',
      btn: 'ஸ்கேனரைத் தொடங்கு',
      err: 'சரியான மதிப்புகளை உள்ளிடவும்.',
      bmiUnder: 'எடை குறைவு',
      bmiNormal: 'சாதாரண',
      bmiOver: 'அதிக எடை',
      bmiObese: 'உடல் பருமன்',
      idealRange: 'உகந்த எடை',
      bmrLabel: 'தினசரி கலோரிகள்',
      kcal: 'kcal'
    }
  };

  const t = texts[lang] || texts['en'];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    const hNum = parseFloat(height);
    const wNum = parseFloat(weight);
    
    if (!ageNum || ageNum < 5 || ageNum > 120 || !hNum || hNum < 50 || hNum > 250 || !wNum || wNum < 10 || wNum > 300) {
      setError(t.err);
      return;
    }
    saveProfile(ageNum, gender, hNum, wNum);
    onComplete();
  };

  // Determine BMI status and color
  let bmiColor = 'text-cyber-cyan';
  let bmiBg = 'bg-cyber-cyan';
  let bmiLabel = t.bmiNormal;
  let gaugePercent = 50; // default middle (healthy)

  if (bmi < 18.5) {
    bmiColor = 'text-yellow-400';
    bmiBg = 'bg-yellow-400';
    bmiLabel = t.bmiUnder;
    gaugePercent = Math.max(5, (bmi / 18.5) * 33);
  } else if (bmi < 25) {
    bmiColor = 'text-green-400';
    bmiBg = 'bg-green-400';
    bmiLabel = t.bmiNormal;
    gaugePercent = 33 + ((bmi - 18.5) / 6.5) * 33;
  } else if (bmi < 30) {
    bmiColor = 'text-orange-400';
    bmiBg = 'bg-orange-400';
    bmiLabel = t.bmiOver;
    gaugePercent = 66 + ((bmi - 25) / 5) * 16;
  } else {
    bmiColor = 'text-red-500';
    bmiBg = 'bg-red-500';
    bmiLabel = t.bmiObese;
    gaugePercent = Math.min(95, 82 + ((bmi - 30) / 10) * 18);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#07090f] border border-cyber-cyan/30 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 text-center space-y-3 bg-gradient-to-b from-cyber-cyan/10 to-transparent border-b border-cyber-cyan/20">
          <div className="mx-auto w-14 h-14 bg-[#0a0f18] rounded-full flex items-center justify-center border border-cyber-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <UserCircle2 className="text-cyber-cyan" size={28} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">{t.title}</h2>
            <p className="text-[10px] md:text-xs text-cyber-cyan/80 mt-1 font-mono leading-relaxed px-4">{t.desc}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          
          {/* Row 1: Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Activity size={12} className="text-cyber-purple" />
                <span>{t.ageLabel}</span>
              </label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => { setAge(e.target.value); setError(''); }}
                className="w-full bg-[#0a0f18] border border-gray-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{t.genderLabel}</label>
              <div className="grid grid-cols-2 gap-2 h-[46px]">
                {['male', 'female'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`text-[10px] md:text-xs font-black rounded-xl uppercase tracking-wider transition-all border ${
                      gender === g 
                        ? 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                        : 'bg-[#0a0f18] border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    {t[g]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Height and Weight with Sliders */}
          <div className="grid grid-cols-2 gap-4">
            {/* Height */}
            <div className="space-y-2 bg-[#0a0f18] border border-gray-800 p-3 rounded-2xl relative overflow-hidden group hover:border-cyber-cyan/50 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                  <MoveVertical size={12} className="text-blue-400" />
                  <span>{t.heightLabel}</span>
                </label>
                <span className="text-white font-black text-sm">{height}</span>
              </div>
              <input 
                type="range" min="50" max="250" value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full accent-blue-400 h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Weight */}
            <div className="space-y-2 bg-[#0a0f18] border border-gray-800 p-3 rounded-2xl relative overflow-hidden group hover:border-cyber-cyan/50 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                  <Weight size={12} className="text-orange-400" />
                  <span>{t.weightLabel}</span>
                </label>
                <span className="text-white font-black text-sm">{weight}</span>
              </div>
              <input 
                type="range" min="10" max="200" value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full accent-orange-400 h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Live BMI Metrics Dashboard */}
          <div className="bg-[#0a0f18] border border-gray-800 rounded-2xl p-4 space-y-4">
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-mono text-gray-500 tracking-widest uppercase mb-1">Body Mass Index</p>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-3xl font-black ${bmiColor}`}>{bmi.toFixed(1)}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${bmiColor} border-current opacity-80`}>
                    {bmiLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Cyber Gauge */}
            <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden flex">
              <div className="h-full w-[33%] bg-yellow-500/50"></div>
              <div className="h-full w-[33%] bg-green-500/50"></div>
              <div className="h-full w-[16%] bg-orange-500/50"></div>
              <div className="h-full w-[18%] bg-red-500/50"></div>
              
              {/* Animated Marker */}
              <div 
                className="absolute top-0 h-full w-1 bg-white shadow-[0_0_10px_white] transition-all duration-300 ease-out"
                style={{ left: `${gaugePercent}%`, transform: 'translateX(-50%)' }}
              />
            </div>

            {/* Extra Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800/50">
              <div>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">{t.idealRange}</p>
                <p className="text-white font-bold text-xs">{idealMin} - {idealMax} <span className="text-gray-500 text-[10px]">kg</span></p>
              </div>
              <div>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5 flex items-center"><Flame size={10} className="mr-1 text-red-400"/> {t.bmrLabel}</p>
                <p className="text-white font-bold text-xs">{bmr} <span className="text-gray-500 text-[10px]">{t.kcal}</span></p>
              </div>
            </div>
            
          </div>

          {error && <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

          <button 
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-cyber-cyan hover:bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          >
            <span>{t.btn}</span>
            <ChevronRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
