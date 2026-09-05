import React, { useState } from 'react';
import { Activity, ShieldCheck, Camera, Volume2, VolumeX, LineChart as LineChartIcon, Globe, Info, User } from 'lucide-react';
import { toggleMute } from '../utils/audioHelper';
import InstallPrompt from './InstallPrompt';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Header({ fps, onOpenHistory }) {
  const [muted, setMuted] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const { currentUser, loginWithGoogle, logout } = useAuth();

  const handleMuteToggle = () => {
    const isNowMuted = toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <header className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-center p-3 md:p-4 border-b border-cyber-border bg-cyber-panel/80 backdrop-blur-md relative z-50 shadow-md">
      <div className="flex w-full md:w-auto justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="p-1.5 md:p-2 bg-cyber-cyan/10 rounded-xl border border-cyber-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Activity className="text-cyber-cyan animate-pulse" size={20} />
          </div>
          <div>
            <h1 className="text-base md:text-2xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_8px_#00f0ff]">{t('title')}</h1>
            <p className="text-[6px] md:text-[9px] text-cyber-cyan font-mono tracking-widest">{t('subtitle')}</p>
          </div>
        </div>
        
        <InstallPrompt />
      </div>
      
      <div className="flex flex-wrap w-full md:w-auto justify-center md:justify-end items-center gap-2 md:space-x-4 pb-1 md:pb-0">
        {/* Language Selection Box */}
        <div className="relative z-50">
          <div 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center space-x-1 bg-black border border-cyber-cyan/30 px-2 py-1.5 rounded-lg cursor-pointer hover:border-cyber-cyan transition-colors"
          >
            <Globe size={14} className="text-cyber-cyan" />
            <span className="text-[10px] font-bold text-white uppercase">{lang === 'si' ? 'සිං' : lang === 'ta' ? 'தமிழ்' : 'EN'}</span>
          </div>
          
          {langMenuOpen && (
            <div className="absolute top-full mt-1 left-0 bg-cyber-dark border border-cyber-cyan/30 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col w-20 animate-fade-in">
              <button onClick={() => { setLang('en'); setLangMenuOpen(false); }} className={`px-3 py-2 text-[10px] font-bold text-left hover:bg-cyber-cyan/20 ${lang === 'en' ? 'text-cyber-cyan' : 'text-gray-300'}`}>EN</button>
              <button onClick={() => { setLang('si'); setLangMenuOpen(false); }} className={`px-3 py-2 text-[10px] font-bold text-left hover:bg-cyber-cyan/20 ${lang === 'si' ? 'text-cyber-cyan' : 'text-gray-300'}`}>සිංහල</button>
              <button onClick={() => { setLang('ta'); setLangMenuOpen(false); }} className={`px-3 py-2 text-[10px] font-bold text-left hover:bg-cyber-cyan/20 ${lang === 'ta' ? 'text-cyber-cyan' : 'text-gray-300'}`}>தமிழ்</button>
            </div>
          )}
        </div>

        {/* Profile Button */}
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-profile'))} className="flex items-center space-x-1 text-white bg-cyber-dark px-2 py-1.5 rounded-full border border-cyber-cyan/30 hover:border-cyber-cyan hover:shadow-[0_0_10px_#00f0ff] transition-all">
          <User size={14} className="text-cyber-cyan" />
        </button>

        {/* About App Button */}
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-about'))} className="flex items-center space-x-1 text-white bg-cyber-dark px-2 py-1.5 rounded-full border border-cyber-purple/30 hover:border-cyber-purple hover:shadow-[0_0_10px_#b800ff] transition-all">
          <Info size={14} className="text-cyber-purple" />
          <span className="font-mono text-[9px] font-bold tracking-widest text-cyber-purple">INFO</span>
        </button>

        <button onClick={onOpenHistory} className="flex items-center space-x-2 text-white bg-cyber-dark px-3 py-1.5 rounded-full border border-cyber-cyan/30 hover:border-cyber-cyan hover:shadow-[0_0_10px_#00f0ff] transition-all">
          <LineChartIcon size={14} className="text-cyber-cyan" />
          <span className="font-mono text-[10px] font-bold tracking-widest hidden lg:inline">{t('history')}</span>
        </button>
        <button 
          onClick={handleMuteToggle} 
          className={`flex items-center space-x-2 transition-all duration-300 border px-4 py-1.5 rounded-full ${
            muted 
              ? 'text-gray-400 border-gray-600 bg-gray-800 hover:text-white' 
              : 'text-cyber-purple border-cyber-purple/50 bg-cyber-purple/10 hover:bg-cyber-purple/30 hover:shadow-[0_0_10px_#b800ff]'
          }`}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span className="text-[10px] font-bold tracking-wider hidden md:inline">
            {muted ? t('muted') : t('audio')}
          </span>
        </button>

        {/* 100% PRIVATE Badge with Custom Cyber Tooltip */}
        <div className="hidden lg:flex relative group items-center space-x-2 text-cyber-green bg-cyber-green/10 px-3 py-1.5 rounded-full border border-cyber-green/20 cursor-help">
          <ShieldCheck size={14} />
          <span className="font-mono text-[10px] font-bold">{t('privateBadge')}</span>
          
          <div className="absolute top-full right-0 mt-3 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-cyber-dark border border-cyber-green/50 p-2 rounded shadow-[0_0_15px_rgba(0,255,65,0.3)] text-[10px] text-cyber-green font-mono text-center relative">
              <div className="absolute -top-1.5 right-6 w-3 h-3 bg-cyber-dark border-t border-l border-cyber-green/50 rotate-45"></div>
              {t('privateTooltip')}
            </div>
          </div>
        </div>

        {/* Auth Section */}
        {!currentUser ? (
          <button onClick={loginWithGoogle} className="flex items-center space-x-2 text-white bg-blue-600/20 px-3 py-1.5 rounded-full border border-blue-500/50 hover:bg-blue-600/40 hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all">
            <span className="font-mono text-[10px] font-bold tracking-widest hidden lg:inline">LOGIN</span>
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">G</div>
          </button>
        ) : (
          <div className="flex items-center space-x-3 bg-cyber-panel border border-cyber-border rounded-full pr-1 pl-3 py-1">
            <span className="font-mono text-[9px] text-cyber-cyan truncate max-w-[80px] hidden md:inline">{currentUser.displayName?.split(' ')[0]}</span>
            <img src={currentUser.photoURL || 'https://via.placeholder.com/30'} alt="Avatar" className="w-5 h-5 rounded-full border border-cyber-cyan" />
            <button onClick={logout} className="text-gray-400 hover:text-red-400 p-1 rounded-full transition-colors text-[9px] font-mono">EXIT</button>
          </div>
        )}

        {/* FPS Badge with Custom Cyber Tooltip */}
        <div className="flex relative group items-center space-x-2 text-cyber-cyan font-mono bg-cyber-panel px-3 py-1.5 rounded-md border border-cyber-border cursor-help">
          <Camera size={14} />
          <span className="text-[10px]">{fps} FPS</span>

          <div className="absolute top-full right-0 mt-3 w-36 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-cyber-dark border border-cyber-cyan/50 p-2 rounded shadow-neon-cyan text-[10px] text-cyber-cyan font-mono text-center relative">
              <div className="absolute -top-1.5 right-6 w-3 h-3 bg-cyber-dark border-t border-l border-cyber-cyan/50 rotate-45"></div>
              {t('fpsTooltip')}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
