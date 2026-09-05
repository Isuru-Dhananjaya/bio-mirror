import React from 'react';
import { AlertTriangle, VideoOff, Loader, CheckCircle, ScanFace, Activity, Sun, Focus, UserCheck, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CalibrationOverlay({ status, progress, errorMsg, onStart, onCancel }) {
  const { t } = useLanguage();
  
  if (status === 'READY') return null;

  if (status === 'IDLE') {
// ... IDLE block ... // (kept original rendering logic)
    return (
      <div className="absolute inset-0 z-40 bg-[#07090f]/80 flex flex-col items-center justify-center backdrop-blur-md">
        <div className="bg-cyber-panel/90 border border-cyber-cyan/30 p-8 rounded-2xl shadow-neon-cyan flex flex-col items-center max-w-sm w-full mx-4 backdrop-blur-lg">
          <Activity size={40} className="text-cyber-cyan drop-shadow-[0_0_10px_#00f0ff] mb-4 animate-pulse" />
          <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white drop-shadow-[0_0_5px_#00f0ff]">
            {t('systemStandby')}
          </h2>

          <div className="bg-black/50 border border-cyber-cyan/20 w-full rounded-xl p-4 mb-6 shadow-inner">
            <h3 className="text-[10px] text-cyber-cyan font-bold tracking-widest uppercase mb-3 text-center border-b border-cyber-cyan/20 pb-2">
              {t('instTitle')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-300">
                <Sun size={14} className="text-cyber-cyan shrink-0" />
                <span className="text-[10px] font-mono leading-tight">{t('inst1')}</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <Focus size={14} className="text-cyber-cyan shrink-0" />
                <span className="text-[10px] font-mono leading-tight">{t('inst2')}</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <UserCheck size={14} className="text-cyber-cyan shrink-0" />
                <span className="text-[10px] font-mono leading-tight">{t('inst3')}</span>
              </li>
            </ul>
          </div>

          <button onClick={onStart} className="btn-cyber w-full py-4 text-xs animate-pulse hover:animate-none group">
            <span className="group-hover:drop-shadow-[0_0_10px_#000]">{t('initScanner')}</span>
          </button>
        </div>
      </div>
    );
  }

  // AI Model Loading State
  if (status === 'INITIALIZING') {
    return (
      <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
        <div className="bg-[#0a0f18] border border-cyber-cyan/40 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.2)] flex flex-col items-center max-w-xs w-full mx-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-cyber-cyan animate-spin opacity-70"></div>
            <div className="absolute inset-0 rounded-full border-r-2 border-cyber-purple animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <ScanFace size={50} className="text-cyber-cyan p-2 drop-shadow-[0_0_15px_#00f0ff] animate-pulse" />
          </div>
          <h2 className="text-sm font-black tracking-widest uppercase mb-2 text-white drop-shadow-[0_0_5px_#00f0ff]">
            {t('loadingEngine')}
          </h2>
          <p className="text-cyber-cyan/70 font-mono text-center text-[10px] leading-relaxed px-2">
            Downloading Neural Networks...
          </p>
        </div>
      </div>
    );
  }

  // Unobtrusive Top HUD for Scanning and Calibrating
  if (status === 'SCANNING' || status === 'CALIBRATING') {
    return (
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-sm pointer-events-none">
        <div className="bg-cyber-panel/80 border border-cyber-cyan/40 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,240,255,0.2)] backdrop-blur-md flex flex-col items-center transition-all duration-500 pointer-events-auto">
          {status === 'CALIBRATING' ? (
            <div className="w-full mb-3">
              <div className="flex justify-between items-center w-full mb-2">
                 <div className="flex items-center space-x-2">
                    <Loader size={14} className="text-cyber-purple animate-spin" />
                    <span className="text-cyber-purple font-bold tracking-widest text-[9px] uppercase drop-shadow-[0_0_5px_#b800ff]">Calibrating Baseline...</span>
                 </div>
                 <span className="text-cyber-purple font-mono font-bold text-[10px]">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-cyber-purple/30">
                <div 
                  className="h-full bg-cyber-purple shadow-[0_0_8px_#b800ff] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="w-full mb-3">
              <div className="flex justify-between items-center w-full mb-2">
                <span className="text-cyber-cyan font-bold tracking-widest text-[10px] animate-pulse flex items-center gap-2 drop-shadow-[0_0_5px_#00f0ff]">
                  <ScanFace size={14} /> {t('extractingVitals')}
                </span>
                <span className="text-cyber-cyan font-mono font-bold text-[12px] drop-shadow-[0_0_5px_#00f0ff]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-cyber-cyan/20">
                <div 
                  className="h-full bg-cyber-cyan shadow-[0_0_8px_#00f0ff] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <button 
            onClick={onCancel} 
            className="flex items-center gap-2 px-3 py-1.5 border border-red-500/50 rounded-md text-[9px] font-bold text-red-500 hover:bg-red-500/20 hover:border-red-500 hover:shadow-[0_0_10px_rgba(255,0,0,0.4)] transition-all cursor-pointer tracking-widest uppercase"
          >
            <X size={12} /> {t('cancelScan')}
          </button>
        </div>
      </div>
    );
  }

  const isDeviceInUse = errorMsg && errorMsg.toLowerCase().includes('device in use');

  if (status === 'COMPLETED') {
    return (
      <div className="absolute inset-0 z-40 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="bg-cyber-panel/90 border border-cyber-green/50 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,255,65,0.2)] flex flex-col items-center max-w-xs w-full mx-4 backdrop-blur-lg">
          <CheckCircle size={50} className="text-cyber-green drop-shadow-[0_0_15px_#00ff41] mb-4" />
          <h2 className="text-lg font-black tracking-widest uppercase mb-2 text-white drop-shadow-[0_0_5px_#00ff41]">
            {t('scanComplete')}
          </h2>
          <p className="text-gray-300 font-mono text-center text-[10px] mb-6 leading-relaxed px-2">
            {t('vitalsRecorded')}
          </p>
          <button onClick={() => window.location.reload()} className="btn-cyber text-[10px] w-full py-3 bg-cyber-green/20 text-cyber-green border-cyber-green hover:bg-cyber-green/40 hover:shadow-[0_0_20px_#00ff41] pointer-events-auto">
            {t('startNewScan')}
          </button>
        </div>
      </div>
    );
  }

  const localTexts = {
    en: {
      reqTitle: "Camera Required",
      reqDesc: "Please click 'Allow' on your browser's camera permission prompt.",
      errTitle: "Camera Access Blocked",
      inUse: "Your webcam is used by another app (Zoom/Skype). Close it and refresh.",
      denied: "Please click the Lock (🔒) icon in the URL bar and allow camera access to continue.",
      reload: "RELOAD APP"
    },
    si: {
      reqTitle: "කැමරාව අවශ්‍යයි",
      reqDesc: "කරුණාකර තිරයේ දිස්වන පණිවිඩයෙන් කැමරාව සඳහා 'Allow' ලබා දෙන්න.",
      errTitle: "කැමරාව අවහිර වී ඇත",
      inUse: "වෙනත් ඇප් එකකින් (Zoom/Skype) කැමරාව භාවිත කරයි. එය වසා නැවත උත්සහ කරන්න.",
      denied: "URL තීරුවේ ඇති ඉබිකතුර (🔒) අයිකන් එක ඔබා කැමරාවට අවසර (Allow) ලබා දී Refresh කරන්න.",
      reload: "නැවත පටවන්න"
    },
    ta: {
      reqTitle: "கேமரா தேவை",
      reqDesc: "கேமரா அனுமதிக்க 'Allow' என்பதைக் கிளிக் செய்யவும்.",
      errTitle: "கேமரா முடக்கப்பட்டுள்ளது",
      inUse: "உங்கள் கேமரா வேறு செயலியால் (Zoom) பயன்படுத்தப்படுகிறது. அதை மூடிவிட்டு மீண்டும் முயற்சிக்கவும்.",
      denied: "URL பட்டியில் உள்ள Lock (🔒) ஐகானைக் கிளிக் செய்து கேமரா அணுகலை (Allow) வழங்கவும்.",
      reload: "மீண்டும் ஏற்றவும்"
    }
  };

  const { lang } = useLanguage();
  const lt = localTexts[lang] || localTexts['en'];

  // ERROR or REQUESTING_CAMERA
  return (
    <div className="absolute inset-0 z-40 bg-[#07090f]/95 flex flex-col items-center justify-center backdrop-blur-md">
      <div className="bg-[#0a0f18] border border-cyber-cyan/30 p-8 rounded-3xl shadow-neon-cyan flex flex-col items-center max-w-md w-full mx-4 pointer-events-auto">
        <div className="relative mb-4">
          <VideoOff size={50} className={`${status === 'ERROR' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]' : 'text-cyber-cyan opacity-50'}`} />
        </div>
        
        <h2 className={`text-lg font-black tracking-widest uppercase mb-3 text-center ${status === 'ERROR' ? 'text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]' : 'text-white drop-shadow-[0_0_5px_#00f0ff]'}`}>
          {status === 'REQUESTING_CAMERA' ? lt.reqTitle : lt.errTitle}
        </h2>
        
        {status === 'ERROR' && !isDeviceInUse && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 w-full flex items-center justify-center space-x-3">
             <div className="text-xl">🔒</div>
             <div className="text-red-400 font-bold text-xs uppercase animate-pulse">Unlock in URL bar</div>
          </div>
        )}

        <p className="text-gray-300 font-mono text-center text-xs mb-6 leading-relaxed px-2">
          {status === 'REQUESTING_CAMERA' ? lt.reqDesc : (isDeviceInUse ? lt.inUse : lt.denied)}
        </p>

        {status === 'ERROR' && (
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-red-500 text-white font-black tracking-widest rounded-xl hover:bg-red-400 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all text-xs uppercase">
            {lt.reload}
          </button>
        )}
      </div>
    </div>
  );
}
