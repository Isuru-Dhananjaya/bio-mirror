import React, { useState } from 'react';
import { UserCircle2, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function UserProfileModal({ isOpen, onComplete }) {
  const { saveProfile } = useAuth();
  const { lang } = useLanguage();
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');

  const texts = {
    en: {
      title: 'Personalize Your Scan',
      desc: 'To provide clinically accurate health insights, our AI needs your basic biological baseline.',
      ageLabel: 'Your Age',
      genderLabel: 'Biological Sex',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      btn: 'CONTINUE TO SCAN',
      err: 'Please enter a valid age.'
    },
    si: {
      title: 'තොරතුරු ලබා දෙන්න',
      desc: 'නිවැරදිම සෞඛ්‍ය වාර්තාවක් ලබා දීමට AI පද්ධතියට ඔබගේ වයස සහ ස්ත්‍රී/පුරුෂ භාවය අවශ්‍ය වේ.',
      ageLabel: 'ඔබගේ වයස',
      genderLabel: 'ස්ත්‍රී/පුරුෂ භාවය',
      male: 'පුරුෂ',
      female: 'ස්ත්‍රී',
      other: 'වෙනත්',
      btn: 'ස්කෑන් කිරීම අරඹන්න',
      err: 'කරුණාකර නිවැරදි වයසක් ඇතුලත් කරන්න.'
    },
    ta: {
      title: 'தனிப்பயனாக்கு',
      desc: 'சரியான முடிவுகளைப் பெற உங்கள் வயது மற்றும் பாலினம் தேவை.',
      ageLabel: 'உங்கள் வயது',
      genderLabel: 'பாலினம்',
      male: 'ஆண்',
      female: 'பெண்',
      other: 'மற்றவை',
      btn: 'தொடரவும்',
      err: 'சரியான வயதை உள்ளிடவும்.'
    }
  };

  const t = texts[lang] || texts['en'];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 5 || ageNum > 120) {
      setError(t.err);
      return;
    }
    saveProfile(ageNum, gender);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-cyber-panel border border-cyber-cyan/30 rounded-2xl w-full max-w-sm shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden">
        
        <div className="p-6 text-center space-y-4 border-b border-cyber-cyan/10 bg-black/30">
          <div className="mx-auto w-16 h-16 bg-cyber-cyan/10 rounded-full flex items-center justify-center border border-cyber-cyan/30 shadow-[0_0_15px_#00f0ff_inset]">
            <UserCircle2 className="text-cyber-cyan" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_8px_#00f0ff]">{t.title}</h2>
            <p className="text-xs text-cyber-cyan/70 mt-2 font-mono leading-relaxed">{t.desc}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
              <Activity size={14} className="text-cyber-purple" />
              <span>{t.ageLabel}</span>
            </label>
            <input 
              type="number" 
              value={age}
              onChange={(e) => { setAge(e.target.value); setError(''); }}
              className="w-full bg-black/50 border border-cyber-border rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
              placeholder="e.g. 25"
            />
            {error && <p className="text-red-400 text-[10px] font-bold">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.genderLabel}</label>
            <div className="grid grid-cols-3 gap-2">
              {['male', 'female', 'other'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all border ${
                    gender === g 
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                      : 'bg-black/40 border-cyber-border text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {t[g]}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-cyber-cyan hover:bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]"
          >
            <span>{t.btn}</span>
            <ChevronRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
