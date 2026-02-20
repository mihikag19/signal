import { useEffect, useState } from "react";

const statusMessages = [
  "Scanning Reddit communities",
  "Analyzing 2,400+ posts",
  "Extracting demand signals",
  "Scoring attention value",
  "Building your report",
];

export function ScanningAnimation({ onComplete }: { onComplete: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= statusMessages.length - 1) return prev;
        return prev + 1;
      });
    }, 800);

    const timeout = setTimeout(onComplete, 4000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
      {/* Radar rings */}
      <div className="relative w-48 h-48 mb-12">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/30"
            style={{
              animation: `pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full gradient-primary animate-signal-pulse" />
        </div>
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
