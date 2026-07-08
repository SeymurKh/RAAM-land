"use client";

import { useEffect, useState } from "react";
import { AnimatedDigit } from "@/components/AnimatedDigit";

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    return null;
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-semibold tabular-nums text-stone-100 sm:text-6xl lg:text-7xl">
        <AnimatedDigit value={value} />
      </span>
      <span className="mt-2 text-[0.65rem] uppercase tracking-[0.32em] text-stone-300/50">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    calculateTimeLeft(targetDate),
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      setTimeLeft(calculateTimeLeft(targetDate));
    };

    function start() {
      tick();
      interval = setInterval(tick, 1000);
    }

    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    function handleVisibility() {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    }

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="text-center">
        <p className="text-2xl font-semibold uppercase tracking-[0.16em] text-stone-100/80 sm:text-4xl">
          Stream starting soon...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 sm:gap-8">
      <TimeUnit value={timeLeft.days} label="Days" />
      <span className="mt-[-1.5rem] text-3xl font-light text-stone-300/30 sm:text-5xl">:</span>
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <span className="mt-[-1.5rem] text-3xl font-light text-stone-300/30 sm:text-5xl">:</span>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <span className="mt-[-1.5rem] text-3xl font-light text-stone-300/30 sm:text-5xl">:</span>
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
