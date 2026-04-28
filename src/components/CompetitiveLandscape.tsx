import { motion } from "framer-motion";

function densityColor(d: string) {
  if (d === "Low") return "score-green";
  if (d === "Medium") return "score-amber";
  return "score-red";
}

interface Props {
  competitors: {
    direct: number;
    indirect: number;
    dominantPlayer: boolean;
    density: "Low" | "Medium" | "High";
    interpretation: string;
    names: string[];
  };
}

export function CompetitiveLandscape({ competitors }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="surface-card p-5 space-y-4"
    >
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="text-foreground">
          <span className="text-muted-foreground">Direct:</span> {competitors.direct}
        </span>
        <span className="text-foreground">
          <span className="text-muted-foreground">Indirect:</span> {competitors.indirect}
        </span>
        <span className="text-foreground">
          <span className="text-muted-foreground">Dominant player:</span>{" "}
          {competitors.dominantPlayer ? "Yes" : "No"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Competitive density:</span>
        <span className={`text-sm font-medium ${densityColor(competitors.density)}`}>
          {competitors.density}
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{competitors.interpretation}</p>

      {competitors.names.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {competitors.names.map((name) => (
            <span
              key={name}
              className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
