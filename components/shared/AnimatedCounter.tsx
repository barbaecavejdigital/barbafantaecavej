import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  endValue: number;
  duration?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ endValue, duration = 1000 }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startValue = currentValue;
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      const nextValue = Math.floor(startValue + (endValue - startValue) * percentage);
      setCurrentValue(nextValue);

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [endValue]);

  return <span>{currentValue}</span>;
};

export default AnimatedCounter;