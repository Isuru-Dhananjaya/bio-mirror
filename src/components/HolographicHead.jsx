export default function HolographicHead({ phase, cycleConfig = { inhale: 4, hold: 2, exhale: 6 } }) {
  // Use much softer, meditative colors
  const getColor = () => {
    if (phase === 'inhale') return '#38bdf8'; // Soft Sky Blue
    if (phase === 'exhale') return '#34d399'; // Soft Mint Green
    if (phase === 'ready') return '#2dd4bf'; // Soft Teal
    return '#a78bfa'; // Hold - Soft Lavender/Purple
  };

  const color = getColor();

  // 3D Wireframe Nodes (Softer layout)
  const nodes = [
    { x: 100, y: 30 }, // Head 0
    { x: 100, y: 55 }, // Neck 1
    { x: 75, y: 65 },  // L Shoulder 2
    { x: 125, y: 65 }, // R Shoulder 3
    { x: 60, y: 110 }, // L Elbow 4
    { x: 140, y: 110 },// R Elbow 5
    { x: 50, y: 155 }, // L Hand 6
    { x: 150, y: 155 },// R Hand 7
    { x: 100, y: 85 }, // Chest 8
    { x: 100, y: 125 },// Stomach 9
    { x: 100, y: 145 },// Pelvis 10
    { x: 85, y: 150 }, // L Hip 11
    { x: 115, y: 150 },// R Hip 12
    { x: 80, y: 210 }, // L Knee 13
    { x: 120, y: 210 },// R Knee 14
    { x: 75, y: 270 }, // L Foot 15
    { x: 125, y: 270 } // R Foot 16
  ];

  // Connections
  const links = [
    [0,1], [1,2], [1,3], [1,8], [2,4], [4,6], [3,5], [5,7],
    [2,8], [3,8], [8,9], [9,10], [10,11], [10,12], [2,11], [3,12], 
    [11,13], [13,15], [12,14], [14,16]
  ];

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
      
      {/* Healing Chamber: Soft Vertical Light Beams */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[180px] h-full border-x transition-colors duration-[3000ms]" style={{ borderColor: color, filter: `drop-shadow(0 0 15px ${color})` }}></div>
        <div className="absolute w-[220px] h-full border-x border-opacity-10 transition-colors duration-[3000ms]" style={{ borderColor: color, filter: `drop-shadow(0 0 20px ${color})` }}></div>
      </div>

      {/* Full Body Hologram SVG */}
      <svg viewBox="0 0 200 300" className="w-[180px] h-[350px] md:w-[220px] md:h-[400px] z-10 transition-transform duration-[3000ms]" style={{ transform: phase === 'inhale' ? 'scale(1.05)' : 'scale(1.0)' }}>
        <defs>
          <filter id="glowHolo">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Very Soft Glass Body Silhouette */}
          <linearGradient id="bodyGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="50%" stopColor={color} stopOpacity="0.05" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <g filter="url(#glowHolo)" className="transition-colors duration-[3000ms]">
          {/* Fleshy Body Shape - Smoother path */}
          <path 
            d="M 90,20 C 100,5 110,20 110,40 C 120,45 130,55 130,60 L 145,110 L 155,160 L 140,150 L 120,145 L 130,275 L 115,275 L 100,160 L 85,275 L 70,275 L 80,145 L 60,150 L 45,160 L 55,110 L 70,60 C 70,55 80,45 90,40 Z" 
            fill="url(#bodyGlass)" 
            stroke={color} 
            strokeWidth="0.5" 
            className="opacity-60"
            strokeLinejoin="round"
          />

          {/* Wireframe Links - Very subtle */}
          {links.map((link, i) => (
            <line 
              key={`link-${i}`} 
              x1={nodes[link[0]].x} 
              y1={nodes[link[0]].y} 
              x2={nodes[link[1]].x} 
              y2={nodes[link[1]].y} 
              stroke={color} 
              strokeWidth="1"
              className="opacity-30"
            />
          ))}

          {/* Wireframe Nodes - Soft and small */}
          {nodes.map((n, i) => (
            <circle 
              key={`node-${i}`} 
              cx={n.x} 
              cy={n.y} 
              r={i === 8 ? 5 : 2} 
              fill={i === 8 ? '#ffffff' : color} 
              className="opacity-80"
              style={{
                transformOrigin: `${n.x}px ${n.y}px`,
                animation: i === 8 && phase === 'hold' ? `softPulse ${cycleConfig.hold}s ease-in-out infinite alternate` : 'none'
              }}
            />
          ))}
        </g>
      </svg>
      
      {/* Horizontal Scanning Rings (3D Ellipses) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        
        {/* Ring 1 (Main Scanner) */}
        <div 
          className="absolute w-[240px] h-[40px] md:w-[280px] md:h-[60px] rounded-[100%] border-[2px] opacity-60"
          style={{ 
            borderColor: color, 
            boxShadow: `0 0 15px ${color}, inset 0 0 15px ${color}`,
            animation: phase === 'inhale' ? `scanUp ${cycleConfig.inhale}s ease-in-out forwards` : 
                       phase === 'exhale' ? `scanDown ${cycleConfig.exhale}s ease-in-out forwards` : 
                       `scanHold ${cycleConfig.hold}s ease-in-out forwards` // Hold state stays still and glows
          }}
        ></div>
      </div>

      <style>{`
        @keyframes scanUp {
          0% { transform: translateY(160px) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-130px) scale(1.05); opacity: 0.4; }
        }
        @keyframes scanDown {
          0% { transform: translateY(-130px) scale(1.05); opacity: 0.4; }
          80% { opacity: 0.8; }
          100% { transform: translateY(160px) scale(1); opacity: 0; }
        }
        @keyframes scanHold {
          0% { transform: translateY(-130px) scale(1.05); opacity: 0.4; }
          100% { transform: translateY(-130px) scale(1.1); opacity: 0.1; }
        }
        @keyframes softPulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 1; filter: drop-shadow(0 0 10px white); }
        }
      `}</style>
    </div>
  );
}
