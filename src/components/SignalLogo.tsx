import { Link } from "react-router-dom";

export function SignalLogo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const isSmall = size === "sm";

  return (
    <Link to="/" className="flex items-center gap-1.5 group">
      <div
        className={`rounded-full bg-foreground ${
          isSmall ? "w-1.5 h-1.5" : "w-2 h-2"
        }`}
      />
      <span
        className={`font-semibold tracking-tight text-foreground ${
          isSmall ? "text-base" : "text-2xl"
        }`}
      >
        Signal
      </span>
    </Link>
  );
}
