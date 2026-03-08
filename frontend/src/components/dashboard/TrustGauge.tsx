import { motion } from "framer-motion";

interface TrustGaugeProps {
  score: number;
  size?: number;
}

const TrustGauge = ({ score, size = 140 }: TrustGaugeProps) => {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half-circle
  const progress = (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2 + 5;

  const getLabel = (s: number) => {
    if (s >= 80) return "Low Risk";
    if (s >= 50) return "Medium";
    return "High Risk";
  };

  const getColor = (s: number) => {
    if (s >= 80) return "hsl(152 69% 40%)";
    if (s >= 50) return "hsl(38 92% 50%)";
    return "hsl(8 90% 60%)";
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="hsl(0 0% 0% / 0.06)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-foreground font-display font-bold"
          fontSize={size * 0.2}
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={size * 0.08}
        >
          {getLabel(score)}
        </text>
      </svg>
    </div>
  );
};

export default TrustGauge;
