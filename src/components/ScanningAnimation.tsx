import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScanningAnimationProps {
  ideaText: string;
  onComplete: () => void;
}

export function ScanningAnimation({ ideaText, onComplete }: ScanningAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const preview = ideaText.length > 60 ? ideaText.slice(0, 57) + "..." : ideaText;

  const statusMessages = [
    `Scanning Reddit for signals about "${preview}"`,
    "Analyzing 2,400+ posts and comments",
    "Applying Mom Test framework",
    "Scoring demand signals",
    "Building your validation report",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev >= statusMessages.length - 1 ? prev : prev + 1));
    }, 800);
    const timeout = setTimeout(onComplete, 4200);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [onComplete, statusMessages.length]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
      {/* Idea being validated */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-muted-foreground text-sm italic mb-8 max-w-md text-center px-4"
      >
        "{preview}"
      </motion.p>

      {/* Radar rings */}
      <div className="relative w-48 h-48 mb-12">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/30"
            animate={{ scale: [0.3, 2], opacity: [0.8, 0] }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: [0.215, 0.61, 0.355, 1] }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full gradient-primary animate-signal-pulse" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-secondary rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full gradient-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "linear" }}
        />
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-foreground text-lg font-medium">
          {statusMessages[messageIndex]}
          <LoadingDots />
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          {messageIndex + 1}/{statusMessages.length}
        </p>
      </div>
    </div>
  );
}

function LoadingDots() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block w-8 text-left">{".".repeat(dots)}</span>;
}
