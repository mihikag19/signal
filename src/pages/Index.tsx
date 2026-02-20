import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SignalLogo } from "@/components/SignalLogo";
import { SearchBar, TrendingChips } from "@/components/SearchBar";
import { ScanningAnimation } from "@/components/ScanningAnimation";

const Index = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");

  const handleSearch = useCallback((query: string) => {
    setPendingQuery(query);
    setScanning(true);
  }, []);

  const handleScanComplete = useCallback(() => {
    navigate(`/discover?q=${encodeURIComponent(pendingQuery)}`);
  }, [navigate, pendingQuery]);

  if (scanning) {
    return <ScanningAnimation onComplete={handleScanComplete} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="flex justify-center mb-6 animate-fade-in-up">
          <SignalLogo size="lg" />
        </div>

        <p className="text-muted-foreground text-lg mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          Find the signal. Prove the demand.
        </p>

        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
          <TrendingChips onSelect={handleSearch} />
        </div>
      </div>
    </div>
  );
};

export default Index;
