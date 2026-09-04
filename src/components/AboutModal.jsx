import React from 'react';
import { X, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  
  const texts = {
    en: {
      title: "About Bio-Mirror",
      how: "How it Works (rPPG)",
      howDesc: "Bio-Mirror uses rPPG (Remote Photoplethysmography). Every time your heart beats, blood rushes to your face, causing microscopic changes in your skin color. Our AI detects these invisible color changes through your camera to calculate your Heart Rate, HRV, and Stress levels.",
      edge: "Edge AI Processing",
      edgeDesc: "The Digital Twin maps exactly 468 3D points on your face. We intentionally run this entirely on your device (Edge Computing) so it runs extremely fast without sending data to servers.",
      priv: "100% Private & Secure",
      privDesc: "Your camera feed never leaves your phone. All AI processing happens entirely inside your browser. We do not record or send video data to any server.",
      btn: "UNDERSTOOD"
    },
    si: {
      title: "Bio-Mirror පිළිබඳව",
      how: "ක්‍රියාත්මක වන ආකාරය (rPPG)",
      howDesc: "මෙහිදී භාවිතා කරන්නේ rPPG තාක්ෂණයයි. ඔබේ හදවත ගැහෙන සෑම විටම ඔබේ මුහුණට රුධිරය ගමන් කරයි, එමගින් සමේ වර්ණය ඉතා සියුම්ව වෙනස් වේ. අපගේ AI පද්ධතිය කැමරාව හරහා මෙම වර්ණ වෙනස්වීම් හඳුනාගෙන ඔබේ හෘද ස්පන්දනය, HRV සහ ආතති මට්ටම් නිවැරදිව ගණනය කරයි.",
      edge: "Edge AI තාක්ෂණය",
      edgeDesc: "AI පද්ධතිය මගින් ඔබේ මුහුණේ ලක්ෂ්‍ය 468ක් ත්‍රිමානව සිතියම් ගත කරයි. මෙය සම්පුර්ණයෙන්ම ඔබගේ දුරකථනය තුළදීම (Edge Computing) ක්‍රියාත්මක වන බැවින් ඉතා වේගවත් වේ.",
      priv: "100% පුද්ගලික සහ ආරක්ෂිතයි",
      privDesc: "ඔබගේ කැමරා දර්ශන කිසිදු විටෙක ඔබගේ දුරකථනයෙන් පිටතට යවන්නේ නැත. සියලුම AI ක්‍රියාවලි සිදුවන්නේ ඔබගේ බ්‍රව්සරය තුළම පමණි. කිසිදු වීඩියෝවක් සර්වර් වෙත යැවීමක් සිදු නොවේ.",
      btn: "තේරුම් ගත්තා"
    },
    ta: {
      title: "Bio-Mirror பற்றி",
      how: "எப்படி வேலை செய்கிறது (rPPG)",
      howDesc: "Bio-Mirror rPPG தொழில்நுட்பத்தைப் பயன்படுத்துகிறது. இதயம் துடிக்கும்போது முகத்தில் ஏற்படும் நுண்ணிய நிற மாற்றங்களை கேமரா மூலம் கண்டறிந்து, துல்லியமான இதய துடிப்பு, HRV மற்றும் மன அழுத்தத்தை அளவிடுகிறது.",
      edge: "Edge AI தொழில்நுட்பம்",
      edgeDesc: "டிஜிட்டல் ட்வின் முகத்தில் 468 3D புள்ளிகளை வரைபடமாக்குகிறது. இது முழுமையாக உங்கள் தொலைபேசியிலேயே இயங்குவதால் மிக வேகமாகச் செயல்படும்.",
      priv: "100% பாதுகாப்பானது",
      privDesc: "உங்கள் கேமரா காட்சிகள் தொலைபேசியை விட்டு வெளியே செல்லாது. எந்த வீடியோவும் இணையதளங்களுக்கு அனுப்பப்படாது.",
      btn: "புரிந்தது"
    }
  };
  
  const t = texts[lang] || texts['en'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-cyber-panel border border-cyber-border rounded-2xl w-full max-w-lg shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-cyber-border/50 flex justify-between items-center bg-black/50">
          <div className="flex items-center space-x-3">
            <Cpu className="text-cyber-cyan animate-pulse" size={24} />
            <h2 className="text-lg font-black tracking-widest text-white uppercase drop-shadow-[0_0_8px_#00f0ff]">
              {t.title}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-red-500/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[70vh] hide-scrollbar">
          
          <div className="space-y-2">
            <h3 className="text-cyber-purple font-bold text-xs tracking-widest uppercase flex items-center space-x-2">
              <Activity size={14} />
              <span>{t.how}</span>
            </h3>
            <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed font-mono">
              {t.howDesc}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-cyber-purple font-bold text-xs tracking-widest uppercase flex items-center space-x-2">
              <Cpu size={14} />
              <span>{t.edge}</span>
            </h3>
            <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed font-mono">
              {t.edgeDesc}
            </p>
          </div>

          <div className="bg-cyber-green/5 border border-cyber-green/30 p-4 rounded-xl space-y-2">
            <h3 className="text-cyber-green font-bold text-xs tracking-widest uppercase flex items-center space-x-2">
              <ShieldCheck size={14} />
              <span>{t.priv}</span>
            </h3>
            <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed font-mono">
              {t.privDesc}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyber-border/50 bg-black/30 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/50 rounded-lg text-xs font-bold tracking-widest hover:bg-cyber-cyan/30 transition-colors">
            {t.btn}
          </button>
        </div>
      </div>
    </div>
  );
}
