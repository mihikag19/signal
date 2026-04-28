import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScanningAnimationProps {
  ideaText: string;
  onComplete: () => void;
}

const steps = [
  "Scanning communities",
  "Extracting demand signals",
  "Scoring validation metrics",
  "Building report",
];

export function ScanningAnimation({ ideaText, onComplete }: ScanningAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const preview = ideaText.length > 80 ? ideaText.slice(0, 77) + "..." : ideaText;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev >= steps.length - 1 ? prev : prev + 1));
    }, 900);
    const timeout = setTimeout(onComplete, 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground text-sm text-center max-w-md mb-10"
      >
        "{preview}"
      </motion.p>

      {/* Simple progress bar */}
      <div className="w-48 h-px bg-border rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-foreground rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.8, ease: "easeInOut" }}
        />
      </div>

      {/* Current step */}
      <motion.p
        key={stepIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-foreground text-sm font-medium"
      >
        {steps[stepIndex]}
      </motion.p>
    </div>
  );
}
