import { Link } from "react-router-dom";

export function SignalLogo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const isSmall = size === "sm";

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        <div
          className={`rounded-full gradient-primary animate-signal-pulse ${
            isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5"
          }`}
        />
      </div>
      <span
        className={`font-bold tracking-tight text-foreground ${
          isSmall ? "text-lg" : "text-4xl"
        }`}
      >
        Signal
      </span>
    </Link>
  );
}
