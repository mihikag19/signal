import { motion } from "framer-motion";
import { Shield, Users } from "lucide-react";

function densityColor(d: string) {
  if (d === "Low") return "text-success";
  if (d === "Medium") return "text-warning";
  return "text-destructive";
}

function densityBg(d: string) {
  if (d === "Low") return "bg-success/10 border-success/20";
  if (d === "Medium") return "bg-warning/10 border-warning/20";
  return "bg-destructive/10 border-destructive/20";
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{competitors.direct} direct competitors</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{competitors.indirect} indirect competitors</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Dominant player: {competitors.dominantPlayer ? "Yes" : "No"}</span>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${densityBg(competitors.density)}`}>
        <span className={`font-semibold ${densityColor(competitors.density)}`}>
          Competitive Density: {competitors.density}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{competitors.interpretation}</p>

      {competitors.names.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {competitors.names.map((name) => (
            <span key={name} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
              {name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
