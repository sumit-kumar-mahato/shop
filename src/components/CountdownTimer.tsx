"use client";

import React, { useState, useEffect } from "react";

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 59,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset to 18 hours when it reaches zero for continuous visual effect
          return { hours: 18, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="bg-luxury-900 text-white font-mono font-bold text-xl sm:text-2xl w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center rounded shadow-sm border border-luxury-800">
          {formatNumber(timeLeft.hours)}
        </span>
        <span className="text-[10px] tracking-wider text-luxury-500 mt-1 uppercase font-bold">Hours</span>
      </div>
      <span className="text-luxury-900 font-bold text-2xl mt-3">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-luxury-900 text-white font-mono font-bold text-xl sm:text-2xl w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center rounded shadow-sm border border-luxury-800">
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className="text-[10px] tracking-wider text-luxury-500 mt-1 uppercase font-bold">Min</span>
      </div>
      <span className="text-luxury-900 font-bold text-2xl mt-3">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-luxury-900 text-white font-mono font-bold text-xl sm:text-2xl w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center rounded shadow-sm border border-luxury-800">
          {formatNumber(timeLeft.seconds)}
        </span>
        <span className="text-[10px] tracking-wider text-luxury-500 mt-1 uppercase font-bold">Sec</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
