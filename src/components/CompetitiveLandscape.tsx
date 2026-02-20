import { Users, Shield, Crown } from "lucide-react";

interface CompetitiveLandscapeProps {
  competitors: {
    direct: number;
    indirect: number;
    dominantPlayer: boolean;
    dominantPlayerName?: string;
    notes: string;
  };
}

export function CompetitiveLandscape({ competitors }: CompetitiveLandscapeProps) {
  return (
    <div className="glass-card p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-foreground">{competitors.direct}</p>
            <p className="text-sm text-muted-foreground">Direct competitors</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-foreground">{competitors.indirect}</p>
            <p className="text-sm text-muted-foreground">Indirect competitors</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-foreground">
              {competitors.dominantPlayer ? "Yes" : "No"}
            </p>
            <p className="text-sm text-muted-foreground">Dominant player</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-5 leading-relaxed">{competitors.notes}</p>
    </div>
  );
}
