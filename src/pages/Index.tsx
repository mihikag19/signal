import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignalLogo } from "@/components/SignalLogo";
import { ScanningAnimation } from "@/components/ScanningAnimation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const exampleChips = [
  { emoji: "🏥", label: "AI patient intake automation" },
  { emoji: "🎨", label: "Creator content repurposing tool" },
  { emoji: "🔮", label: "This tool — Signal (meta)" },
];

const Index = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [pendingIdea, setPendingIdea] = useState("");
  const [ideaText, setIdeaText] = useState("");

  const handleValidate = useCallback((idea: string) => {
    if (!idea.trim()) return;
    setPendingIdea(idea.trim());
    setScanning(true);
  }, []);

  const handleScanComplete = useCallback(() => {
    navigate(`/validate?idea=${encodeURIComponent(pendingIdea)}`);
  }, [navigate, pendingIdea]);

  if (scanning) {
    return <ScanningAnimation ideaText={pendingIdea} onComplete={handleScanComplete} />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <SignalLogo size="lg" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-foreground text-xl font-semibold mb-2"
        >
          Validate before you build.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-muted-foreground text-sm mb-10 max-w-lg mx-auto"
        >
          Input your startup idea. Get real demand signals, quantitative scoring, and a strategic validation report in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleValidate(ideaText);
            }}
          >
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              rows={4}
              placeholder={'Describe your startup idea in 1-3 sentences...\ne.g., "An AI tool that scans online communities to find real demand signals for startup ideas, helping founders validate before they build and giving VCs proof of market demand."'}
              className="w-full bg-white/5 text-foreground placeholder:text-muted-foreground rounded-xl px-5 py-4 text-base outline-none border border-transparent focus:ring-2 focus:ring-primary transition-all duration-200 resize-none"
            />
            <button
              type="submit"
              disabled={!ideaText.trim()}
              className="w-full mt-3 gradient-button py-3.5 text-base font-semibold flex items-center justify-center gap-2 rounded-xl shimmer-button disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Validate This Idea
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-6"
        >
          {exampleChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleValidate(chip.label)}
              className="px-4 py-1.5 rounded-full text-sm border border-secondary bg-secondary/50 text-secondary-foreground hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 cursor-pointer"
            >
              {chip.emoji} {chip.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-sm text-muted-foreground"
        >
          Already validated ideas?{" "}
          <Link to="/compare" className="text-primary hover:underline">
            Compare them →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
