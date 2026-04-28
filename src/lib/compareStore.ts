import { create } from "zustand";
import type { ValidationReport } from "@/types";

interface CompareStore {
  ideas: ValidationReport[];
  addIdea: (idea: ValidationReport) => void;
  removeIdea: (title: string) => void;
  hasIdea: (title: string) => boolean;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  ideas: [],
  addIdea: (idea) => {
    if (get().ideas.length >= 3) return;
    if (get().ideas.some((i) => i.ideaTitle === idea.ideaTitle)) return;
    set((s) => ({ ideas: [...s.ideas, idea] }));
  },
  removeIdea: (title) => set((s) => ({ ideas: s.ideas.filter((i) => i.ideaTitle !== title) })),
  hasIdea: (title) => get().ideas.some((i) => i.ideaTitle === title),
}));
