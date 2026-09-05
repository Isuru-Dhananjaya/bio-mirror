import React from 'react';
import { Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WrappedCard from './WrappedCard';
import VitalsCard from './VitalsCard';

export default function ResultSummary({ 
  status, finalBpm, finalHrv, finalStress, finalBurnout, finalConfidence, insight, setShowHealer 
}) {
  const { t } = useLanguage();
  
  return (
    <>
      {/* Accuracy Badge */}
      {status === 'COMPLETED' && finalConfidence !== null && (
        <div className="flex justify-end w-full animate-fade-in -mb-2 mt-[-10px] md:mt-0">
          <div className="bg-black border border-cyber-cyan/50 text-cyber-cyan px-3 py-1 rounded-full flex items-center space-x-2 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Activity size={12} className={finalConfidence > 80 ? 'text-green-400' : 'text-orange-400'} />
            <span className="text-[10px] font-mono font-bold tracking-wider">
              SCAN ACCURACY: {finalConfidence}%
            </span>
          </div>
        </div>
      )}

      <div className={`flex-row justify-between flex-wrap gap-4 ${status === 'COMPLETED' ? 'flex' : 'hidden md:flex'}`}>
        <VitalsCard 
          title={t('heartRate')} 
          value={status === 'COMPLETED' ? finalBpm : null} 
          unit="BPM" 
          status={status === 'COMPLETED' ? (finalBpm > 100 ? t('high') : finalBpm < 60 ? t('low') : t('normal')) : (status === 'IDLE' ? t('standby') : t('scanning'))} 
          color={status === 'COMPLETED' ? (finalBpm > 100 || finalBpm < 60 ? 'orange' : 'cyan') : 'cyan'} 
          range="60 - 100"
        />
        <VitalsCard 
          title={t('heartRateVar')} 
          value={status === 'COMPLETED' ? finalHrv : null} 
          unit="MS" 
          status={status === 'COMPLETED' ? (finalHrv < 20 ? t('low') : finalHrv > 100 ? t('unusual') : t('optimal')) : (status === 'IDLE' ? t('standby') : '--')} 
          color={status === 'COMPLETED' ? (finalHrv < 20 || finalHrv > 100 ? 'orange' : 'blue') : 'blue'} 
          range="20 - 100"
        />
        <VitalsCard 
          title={t('stressLevel')} 
          value={status === 'COMPLETED' ? finalStress : null} 
          unit="%" 
          status={status === 'COMPLETED' ? (finalStress > 60 ? t('high') : t('normal')) : (status === 'IDLE' ? t('standby') : t('analyzing'))} 
          color={status === 'COMPLETED' ? (finalStress > 60 ? 'orange' : 'green') : 'green'} 
          range="0 - 60"
        />
        <VitalsCard 
          title={t('burnoutIndex')} 
          value={status === 'COMPLETED' ? finalBurnout : null} 
          unit="%" 
          status={status === 'COMPLETED' ? (finalBurnout > 50 ? t('fatigueHigh') : t('fatigueNormal')) : (status === 'IDLE' ? t('standby') : '--')} 
          color={status === 'COMPLETED' ? (finalBurnout > 50 ? 'orange' : 'purple') : 'purple'} 
          range="0 - 50"
        />
      </div>
      
      {/* Dynamic Medical Insight Alert */}
      {status === 'COMPLETED' && insight && (
        <div className={`w-full p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in ${insight.bg} ${insight.border} shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
          <div className="flex items-start space-x-4">
            <div className="shrink-0 mt-1">
              <insight.icon size={24} className={insight.color} />
            </div>
            <div>
              <h4 className={`text-xs font-black tracking-widest uppercase mb-1 ${insight.color}`}>{insight.title}</h4>
              <p className="text-gray-300 text-[10px] md:text-xs font-mono leading-relaxed">{insight.msg}</p>
            </div>
          </div>
          
          {insight.healable && (
            <button 
              onClick={() => setShowHealer(true)}
              className="shrink-0 btn-cyber px-4 py-2 text-[10px] bg-orange-500/20 text-orange-500 border-orange-500 hover:bg-orange-500/40 hover:shadow-[0_0_15px_#ff8c00] flex items-center space-x-2"
            >
              <Activity size={14} />
              <span>{t('healingMode')}</span>
            </button>
          )}
        </div>
      )}

      {status === 'COMPLETED' && (
        <WrappedCard 
          bpm={finalBpm} 
          hrv={finalHrv} 
          stress={finalStress} 
          burnout={finalBurnout}
          confidence={finalConfidence}
        />
      )}
    </>
  );
}
