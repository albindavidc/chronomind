import React from 'react';

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number; // Used for coordinate calculation only
  strokeWidth?: number;
  children?: React.ReactNode;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 280,
  strokeWidth = 12,
  children,
  color = "text-orange-500"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    // Max width restricts size on large screens, while w-full/h-full allows shrinking
    <div className="relative flex items-center justify-center w-full h-full max-w-[280px] max-h-[280px] aspect-square mx-auto">
      <svg
        className="transform -rotate-90 w-full h-full block"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-gray-800"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color} transition-all duration-500 ease-in-out`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default CircularProgress;