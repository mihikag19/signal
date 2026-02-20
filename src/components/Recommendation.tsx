export function Recommendation({ text }: { text: string }) {
  return (
    <div className="glass-card gradient-border-left p-6">
      <p className="text-foreground/90 text-base leading-relaxed">{text}</p>
    </div>
  );
}
