"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Shuffle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import kb from "@/lib/kb";
import { loadProgress, markQuestion, type StudyProgress } from "@/lib/store";

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticePage() {
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [filterLO, setFilterLO] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSession, setFilterSession] = useState("all");
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const questionTypes = useMemo(() => [...new Set(kb.questions.map((q) => q.type))].sort(), []);
  const sessions = useMemo(() => [...new Set(kb.questions.map((q) => q.session))].sort((a, b) => a - b), []);

  // Map question to original index for tracking
  const filteredQuestions = useMemo(() => {
    let result = kb.questions
      .map((q, i) => ({ ...q, origIdx: i }))
      .filter((q) => {
        if (filterType !== "all" && q.type !== filterType) return false;
        if (filterSession !== "all" && q.session !== Number(filterSession)) return false;
        if (filterLO !== "all") {
          const sessionConcepts = kb.concepts.filter(
            (c) => c.session === q.session && c.related_los.includes(filterLO)
          );
          if (sessionConcepts.length === 0) return false;
        }
        return true;
      });
    if (shuffled) {
      result = fisherYatesShuffle(result);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLO, filterType, filterSession, shuffled, shuffleKey]);

  // Reset shuffle when filters change
  useEffect(() => {
    setShuffled(false);
  }, [filterLO, filterType, filterSession]);

  const handleShuffle = useCallback(() => {
    setShuffled(true);
    setShuffleKey((k) => k + 1);
    setIdx(0);
    setRevealed(false);
    setShowFollowUp(false);
  }, []);

  const q = filteredQuestions[idx];
  const nailed = progress ? Object.values(progress.attemptedQuestions).filter((v) => v === "nailed").length : 0;

  function handleGrade(status: "nailed" | "partial" | "missed") {
    if (!q) return;
    const p = markQuestion(q.origIdx, status);
    setProgress({ ...p });
    setRevealed(false);
    setShowFollowUp(false);
    setIdx((i) => Math.min(i + 1, filteredQuestions.length - 1));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Practice Questions</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {filteredQuestions.length} questions — {nailed} nailed overall
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <select className="text-sm border rounded-md px-2 py-1 bg-background" value={filterLO}
          onChange={(e) => { setFilterLO(e.target.value); setIdx(0); setRevealed(false); }}>
          <option value="all">All LOs</option>
          {kb.learning_outcomes.map((lo) => (
            <option key={lo.code} value={lo.code}>
              {lo.code.replace("#b165-", "").replace("#", "")}
            </option>
          ))}
        </select>
        <select className="text-sm border rounded-md px-2 py-1 bg-background" value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setIdx(0); setRevealed(false); }}>
          <option value="all">All Types</option>
          {questionTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className="text-sm border rounded-md px-2 py-1 bg-background" value={filterSession}
          onChange={(e) => { setFilterSession(e.target.value); setIdx(0); setRevealed(false); }}>
          <option value="all">All Sessions</option>
          {sessions.map((s) => (
            <option key={s} value={s}>Session {s}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={handleShuffle} className="gap-1.5">
          <Shuffle className="size-3.5" />
          Shuffle
        </Button>
      </div>

      {filteredQuestions.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No questions match filters.</CardContent></Card>
      ) : (
        <>
          <Progress value={((idx + 1) / filteredQuestions.length) * 100} className="h-1.5 mb-4" />
          <p className="text-xs text-muted-foreground mb-2 text-right">{idx + 1} / {filteredQuestions.length}</p>

          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">Session {q.session}</Badge>
                <Badge variant="outline">{q.type}</Badge>
                {progress?.attemptedQuestions[q.origIdx] && (
                  <Badge variant={progress.attemptedQuestions[q.origIdx] === "nailed" ? "default" : "destructive"}>
                    {progress.attemptedQuestions[q.origIdx]}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{q.topic}</p>
              <h2 className="text-lg font-semibold leading-relaxed">{q.question}</h2>
            </CardContent>
          </Card>

          {!revealed ? (
            <Button className="w-full" onClick={() => setRevealed(true)}>
              Reveal Answer
            </Button>
          ) : (
            <>
              <Card className="mb-4 bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-sm mb-3">Expected Answer Elements:</h3>
                  <ul className="space-y-2">
                    {q.expected_answer_elements.map((el, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                        {el}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {q.follow_ups.length > 0 && (
                <div className="mb-4">
                  <Button variant="outline" size="sm" onClick={() => setShowFollowUp(!showFollowUp)}>
                    {showFollowUp ? "Hide" : "Show"} Follow-ups ({q.follow_ups.length})
                  </Button>
                  {showFollowUp && (
                    <Card className="mt-2">
                      <CardContent className="pt-4">
                        {q.follow_ups.map((fu, i) => (
                          <p key={i} className="text-sm mb-2">{fu}</p>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => handleGrade("nailed")}>
                  Nailed It
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => handleGrade("partial")}>
                  Partial
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleGrade("missed")}>
                  Missed It
                </Button>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1"
              onClick={() => { setRevealed(false); setShowFollowUp(false); setIdx(Math.max(0, idx - 1)); }}
              disabled={idx === 0}>
              Previous
            </Button>
            <Button variant="outline" className="flex-1"
              onClick={() => { setRevealed(false); setShowFollowUp(false); setIdx(Math.min(filteredQuestions.length - 1, idx + 1)); }}
              disabled={idx >= filteredQuestions.length - 1}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
