"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Shuffle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import kb from "@/lib/kb";
import { loadProgress, markConcept, type StudyProgress } from "@/lib/store";

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [filterLO, setFilterLO] = useState("all");
  const [filterSession, setFilterSession] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "review" | "new">("all");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const deck = useMemo(() => {
    let cards = [...kb.concepts];
    if (filterLO !== "all") cards = cards.filter((c) => c.related_los.includes(filterLO));
    if (filterSession !== "all") cards = cards.filter((c) => c.session === Number(filterSession));
    if (filterStatus === "review" && progress) {
      cards = cards.filter((c) => progress.reviewedConcepts[c.name] === "review");
    } else if (filterStatus === "new" && progress) {
      cards = cards.filter((c) => !progress.reviewedConcepts[c.name]);
    }

    // Spaced repetition: put "review" cards first, then new, then mastered
    if (progress && !shuffled) {
      cards.sort((a, b) => {
        const sa = progress.reviewedConcepts[a.name];
        const sb = progress.reviewedConcepts[b.name];
        const order = (s: string | undefined) => (s === "review" ? 0 : s === undefined ? 1 : 2);
        return order(sa) - order(sb);
      });
    }
    if (shuffled) {
      cards = fisherYatesShuffle(cards);
    }
    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLO, filterSession, filterStatus, progress, shuffled, shuffleKey]);

  const card = deck[idx];

  const handleMark = useCallback(
    (status: "got_it" | "review") => {
      if (!card) return;
      const p = markConcept(card.name, status);
      setProgress({ ...p });
      setFlipped(false);
      setIdx((i) => Math.min(i + 1, deck.length - 1));
    },
    [card, deck.length]
  );

  // Reset shuffle when filters change
  useEffect(() => {
    setShuffled(false);
  }, [filterLO, filterSession, filterStatus]);

  const handleShuffle = useCallback(() => {
    setShuffled(true);
    setShuffleKey((k) => k + 1);
    setIdx(0);
    setFlipped(false);
  }, []);

  const sessions = [...new Set(kb.concepts.map((c) => c.session))].sort((a, b) => a - b);
  const gotIt = progress ? Object.values(progress.reviewedConcepts).filter((v) => v === "got_it").length : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Flashcards</h1>
      <p className="text-sm text-muted-foreground mb-6">{deck.length} cards in deck — {gotIt} mastered overall</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          className="text-sm border rounded-md px-2 py-1 bg-background"
          value={filterLO}
          onChange={(e) => { setFilterLO(e.target.value); setIdx(0); setFlipped(false); }}
        >
          <option value="all">All LOs</option>
          {kb.learning_outcomes.map((lo) => (
            <option key={lo.code} value={lo.code}>
              {lo.code.replace("#b165-", "").replace("#", "")} — {lo.desc.slice(0, 40)}
            </option>
          ))}
        </select>
        <select
          className="text-sm border rounded-md px-2 py-1 bg-background"
          value={filterSession}
          onChange={(e) => { setFilterSession(e.target.value); setIdx(0); setFlipped(false); }}
        >
          <option value="all">All Sessions</option>
          {sessions.map((s) => (
            <option key={s} value={s}>Session {s}</option>
          ))}
        </select>
        <select
          className="text-sm border rounded-md px-2 py-1 bg-background"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as "all" | "review" | "new"); setIdx(0); setFlipped(false); }}
        >
          <option value="all">All Status</option>
          <option value="new">New Only</option>
          <option value="review">Review Again</option>
        </select>
        <Button variant="outline" size="sm" onClick={handleShuffle} className="gap-1.5">
          <Shuffle className="size-3.5" />
          Shuffle
        </Button>
      </div>

      {deck.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No cards match your filters.</CardContent></Card>
      ) : (
        <>
          <Progress value={((idx + 1) / deck.length) * 100} className="h-1.5 mb-4" />
          <p className="text-xs text-muted-foreground mb-2 text-right">{idx + 1} / {deck.length}</p>

          {/* Card */}
          <div
            className="cursor-pointer perspective-1000"
            onClick={() => setFlipped(!flipped)}
          >
            <Card className={`min-h-[280px] transition-all duration-300 ${flipped ? "bg-muted/50" : ""}`}>
              <CardContent className="pt-6 flex flex-col justify-center min-h-[280px]">
                {!flipped ? (
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Session {card.session}</Badge>
                    <h2 className="text-xl font-semibold">{card.name}</h2>
                    <p className="text-sm text-muted-foreground mt-4">Tap to reveal</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">{card.name}</h3>
                    <p className="text-sm leading-relaxed mb-4">{card.definition}</p>
                    {card.context && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        <span className="font-medium">Context:</span> {card.context}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {card.related_los.map((lo) => (
                        <Badge key={lo} variant="outline" className="text-xs">
                          {lo.replace("#b165-", "").replace("#", "")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setFlipped(false); setIdx(Math.max(0, idx - 1)); }}
              disabled={idx === 0}
            >
              Previous
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleMark("review")}
            >
              Review Again
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleMark("got_it")}
            >
              Got It
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setFlipped(false); setIdx(Math.min(deck.length - 1, idx + 1)); }}
              disabled={idx >= deck.length - 1}
            >
              Skip
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
