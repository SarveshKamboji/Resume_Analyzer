import { useEffect, useRef, useState } from 'react';

export default function ScoreGauge({ score = 0, size = 160 }) {
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef(null);

  const radius = (size / 2) - 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  const getColor = (s) => {
    if (s >= 70) return '#10B981';
    if (s >= 45) return '#F59E0B';
    return '#F43F5E';
  };

  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(Math.round(eased * score));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  const color = getColor(score);

  return (
    <div className="score-gauge-wrap">
      <div className="score-gauge" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          {/* Animated progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`,
              transition: 'stroke-dashoffset 0.05s linear',
            }}
          />
        </svg>
        <div className="score-gauge-value">
          <span className="score-number" style={{ color, WebkitTextFillColor: color }}>
            {displayed}%
          </span>
          <span className="score-label">Match</span>
        </div>
      </div>
    </div>
  );
}
