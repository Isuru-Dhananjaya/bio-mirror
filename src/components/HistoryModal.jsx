import React from 'react';
import { X, TrendingUp, Activity, Trash2, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getHistory, clearHistory } from '../utils/storageHelper';
import { useLanguage } from '../context/LanguageContext';

export default function HistoryModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const data = getHistory();

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    
    const headers = ['Date', 'Time', 'Heart Rate (BPM)', 'Stress (%)', 'HRV (ms)'];
    const rows = data.map(item => [
      item.dateLabel || '',
      item.timeLabel || '',
      item.bpm ?? '',
      item.stress ?? '',
      item.hrv ?? ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bio_mirror_vitals_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if(window.confirm("Are you sure you want to delete all history? This cannot be undone.")) {
      clearHistory();
      onClose(); // Close and reopen or just close to refresh
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cyber-dark/95 border border-cyber-cyan/50 p-3 rounded-lg shadow-neon-cyan font-mono text-xs z-50">
          <p className="text-white mb-2 pb-1 border-b border-gray-700">{payload[0].payload.dateLabel} - {payload[0].payload.timeLabel}</p>
          <p className="text-cyber-cyan">{t('heartRate')}: {payload[0].payload.bpm} BPM</p>
          <p className="text-cyber-green">{t('stressLevel')}: {payload[0].payload.stress}%</p>
          <p className="text-cyber-purple">HRV: {payload[0].payload.hrv} ms</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cyber-panel border border-cyber-border rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.1)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-cyber-border bg-cyber-dark/50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-cyber-cyan" size={20} />
            <h2 className="text-lg font-black tracking-widest text-white uppercase drop-shadow-[0_0_5px_#00f0ff]">
              {t('vitalsHistory') || 'Vitals History'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 font-mono">
              <Activity size={48} className="mb-4 opacity-20" />
              <p>No vital scans recorded yet.</p>
              <p className="text-[10px] mt-2">Complete a scan to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Chart Section */}
              <div className="h-64 md:h-80 w-full bg-[#001100]/50 p-4 rounded-xl border border-cyber-border relative">
                <h3 className="text-cyber-green text-[10px] font-bold tracking-widest uppercase mb-4 absolute top-4 left-4 z-10">Stress & Heart Rate Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="timeLabel" stroke="#4b5563" fontSize={10} tickMargin={10} />
                    <YAxis stroke="#4b5563" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="bpm" name="BPM" stroke="#00f0ff" strokeWidth={2} dot={{ fill: '#00f0ff', r: 3 }} activeDot={{ r: 6, shadow: '0 0 10px #00f0ff' }} />
                    <Line type="monotone" dataKey="stress" name="Stress %" stroke="#00ff41" strokeWidth={2} dot={{ fill: '#00ff41', r: 3 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* List Section */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-gray-400 text-xs font-bold tracking-widest uppercase">Recent Scans</h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleExportCSV} 
                      className="text-cyber-cyan hover:text-white text-[10px] font-mono flex items-center space-x-1 border border-cyber-cyan/40 px-2.5 py-1 rounded bg-cyber-cyan/10 hover:bg-cyber-cyan/20 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                    >
                      <Download size={12} /> <span>{t('exportCsv')}</span>
                    </button>
                    <button onClick={handleClear} className="text-red-500 hover:text-red-400 text-[10px] font-mono flex items-center space-x-1 border border-red-500/30 px-2 py-1 rounded bg-red-500/10 transition-colors">
                      <Trash2 size={12} /> <span>CLEAR DATA</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.slice().reverse().map((entry) => (
                    <div key={entry.id} className="bg-cyber-dark/80 border border-cyber-border p-4 rounded-xl flex justify-between items-center hover:border-cyber-cyan/50 transition-colors">
                      <div>
                        <div className="text-white font-mono text-sm">{entry.dateLabel}</div>
                        <div className="text-gray-500 font-mono text-[10px]">{entry.timeLabel}</div>
                      </div>
                      <div className="flex space-x-4 text-right">
                        <div>
                          <div className="text-cyber-cyan font-bold font-mono">{entry.bpm}</div>
                          <div className="text-gray-600 text-[8px] tracking-widest">BPM</div>
                        </div>
                        <div>
                          <div className="text-cyber-green font-bold font-mono">{entry.stress}%</div>
                          <div className="text-gray-600 text-[8px] tracking-widest">STRESS</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
