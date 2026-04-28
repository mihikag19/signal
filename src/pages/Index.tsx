import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignalLogo } from "@/components/SignalLogo";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const exampleChips = [
  "AI patient intake automation",
  "Creator content repurposing tool",
  "Campus parking availability app",
];

const Index = () => {
  const navigate = useNavigate();
  const [ideaText, setIdeaText] = useState("");

  const handleValidate = useCallback(
    (idea: string) => {
      if (!idea.trim()) return;
      navigate(`/validate?idea=${encodeURIComponent(idea.trim())}`);
    },
    [navigate]
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto w-full">
        <SignalLogo size="sm" />
        <div className="flex items-center gap-5">
          <Link
            to="/compare"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Compare
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-semibold tracking-tight text-foreground text-center leading-tight"
          >
            Validate before you build.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="text-muted-foreground text-base mt-3 text-center max-w-md mx-auto"
          >
            Describe your startup idea. Get real demand signals, scoring, and a
            strategic validation report.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="mt-8"
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
                rows={3}
                placeholder="Describe your startup idea in 1–3 sentences..."
                className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground/60 rounded-lg px-4 py-3.5 text-base outline-none border border-border focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all duration-200 resize-none"
              />
              <button
                type="submit"
                disabled={!ideaText.trim()}
                className="w-full mt-2.5 btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Validate this idea
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-5"
          >
            {exampleChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleValidate(chip)}
                className="px-3.5 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 text-center text-xs text-muted-foreground/60"
          >
            Powered by real-time data from Reddit and Hacker News
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Index;
