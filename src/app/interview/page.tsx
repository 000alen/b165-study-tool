"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import kb from "@/lib/kb";
import { loadProgress, addInterviewScore, type StudyProgress } from "@/lib/store";

interface InterviewQuestion {
  question: typeof kb.questions[number];
  origIdx: number;
}

function pickQuestions(progress: StudyProgress | null): InterviewQuestion[] {
  // Weight toward weak areas - group by LO via session mapping
  const loSessions: Record<string, number[]> = {};
  for (const lo of kb.learning_outcomes) {
    const sessions = new Set(
      kb.concepts.filter((c) => c.related_los.includes(lo.code)).map((c) => c.session)
    );
    loSessions[lo.code] = [...sessions];
  }

  // Score each LO (lower = weaker = higher priority)
  const loScores: Record<string, number> = {};
  for (const lo of kb.learning_outcomes) {
    const concepts = kb.concepts.filter((c) => c.related_los.includes(lo.code));
    if (!progress || concepts.length === 0) {
      loScores[lo.code] = 0;
      continue;
    }
    const gotIt = concepts.filter((c) => progress.reviewedConcepts[c.name] === "got_it").length;
    loScores[lo.code] = gotIt / concepts.length;
  }

  // Sort LOs by weakness (ascending score)
  const sortedLOs = [...kb.learning_outcomes].sort(
    (a, b) => (loScores[a.code] ?? 0) - (loScores[b.code] ?? 0)
  );

  const picked: InterviewQuestion[] = [];
  const usedSessions = new Set<number>();

  for (const lo of sortedLOs) {
    if (picked.length >= 4) break;
    const loSessionSet = new Set(loSessions[lo.code]);
    const candidates = kb.questions
      .map((q, i) => ({ question: q, origIdx: i }))
      .filter(
        (q) => loSessionSet.has(q.question.session) && !usedSessions.has(q.question.session)
      );
    if (candidates.length === 0) continue;
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    picked.push(choice);
    usedSessions.add(choice.question.session);
  }

  // Fill remaining from random if needed
  while (picked.length < 4) {
    const remaining = kb.questions
      .map((q, i) => ({ question: q, origIdx: i }))
      .filter((q) => !picked.some((p) => p.origIdx === q.origIdx));
    if (remaining.length === 0) break;
    picked.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return picked;
}

export default function InterviewPage() {
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [stage, setStage] = useState<"intro" | "active" | "done">("intro");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<("nailed" | "partial" | "missed")[]>([]);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const startInterview = useCallback(() => {
    const qs = pickQuestions(progress);
    setQuestions(qs);
    setQIdx(0);
    setScores([]);
    setAnswer("");
    setRevealed(false);
    setShowFollowUp(false);
    setTimeLeft(120);
    setStage("active");
  }, [progress]);

  // Timer
  useEffect(() => {
    if (stage !== "active" || revealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimeLeft(120);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, qIdx, revealed]);

  function handleGrade(grade: "nailed" | "partial" | "missed") {
    const newScores = [...scores, grade];
    setScores(newScores);
    if (qIdx + 1 >= questions.length) {
      // Done
      const score = newScores.filter((s) => s === "nailed").length;
      const p = addInterviewScore(score, questions.length);
      setProgress({ ...p });
      setStage("done");
    } else {
      setQIdx(qIdx + 1);
      setAnswer("");
      setRevealed(false);
      setShowFollowUp(false);
    }
  }

  const q = questions[qIdx]?.question;
  const totalScore = scores.filter((s) => s === "nailed").length;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Mock Interview</h1>
      <p className="text-sm text-muted-foreground mb-6">Folkinshteyn-style interview simulation</p>

      {stage === "intro" && (
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Ready for your interview?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              4 questions from different learning outcomes. 2 minutes suggested per question.
              {progress && Object.keys(progress.reviewedConcepts).length > 0 && (
                <> Questions are weighted toward your weak areas.</>
              )}
            </p>
            {progress && progress.interviewScores.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Previous scores:{" "}
                  {progress.interviewScores.slice(-5).map((s, i) => (
                    <Badge key={i} variant="outline" className="ml-1">
                      {s.score}/{s.total}
                    </Badge>
                  ))}
                </p>
              </div>
            )}
            <Button size="lg" onClick={startInterview}>Start Interview</Button>
          </CardContent>
        </Card>
      )}

      {stage === "active" && q && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    i < qIdx
                      ? scores[i] === "nailed" ? "bg-green-500 text-white" :
                        scores[i] === "partial" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                      : i === qIdx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            {!revealed && (
              <Badge variant={timeLeft < 30 ? "destructive" : "secondary"} className="font-mono">
                {mins}:{secs.toString().padStart(2, "0")}
              </Badge>
            )}
          </div>

          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex gap-2">
                <Badge variant="secondary">Session {q.session}</Badge>
                <Badge variant="outline">{q.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">{q.topic}</p>
              <h2 className="text-lg font-semibold">{q.question}</h2>
            </CardContent>
          </Card>

          {!revealed ? (
            <>
              <textarea
                className="w-full min-h-[120px] p-3 text-sm border rounded-md bg-background mb-4 resize-y"
                placeholder="Type your answer here (for your reference)..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <Button className="w-full" onClick={() => setRevealed(true)}>
                Reveal Expected Answer
              </Button>
            </>
          ) : (
            <>
              {answer && (
                <Card className="mb-4 border-primary/30">
                  <CardContent className="pt-4">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Your Answer</h3>
                    <p className="text-sm whitespace-pre-wrap">{answer}</p>
                  </CardContent>
                </Card>
              )}
              <Card className="mb-4 bg-muted/50">
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-3">Expected Answer Elements:</h3>
                  <ul className="space-y-2">
                    {q.expected_answer_elements.map((el, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-primary font-medium shrink-0">{i + 1}.</span>{el}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {q.follow_ups.length > 0 && (
                <div className="mb-4">
                  <Button variant="outline" size="sm" onClick={() => setShowFollowUp(!showFollowUp)}>
                    Follow-up Questions ({q.follow_ups.length})
                  </Button>
                  {showFollowUp && (
                    <Card className="mt-2">
                      <CardContent className="pt-4">
                        {q.follow_ups.map((fu, i) => (
                          <p key={i} className="text-sm mb-2 font-medium">{fu}</p>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => handleGrade("nailed")}>Nailed It</Button>
                <Button variant="secondary" className="flex-1" onClick={() => handleGrade("partial")}>Partial</Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleGrade("missed")}>Missed It</Button>
              </div>
            </>
          )}
        </>
      )}

      {stage === "done" && (
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{totalScore} / {questions.length}</h2>
            <p className="text-muted-foreground mb-4">Interview Complete</p>
            <div className="flex justify-center gap-4 mb-6">
              {scores.map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                    s === "nailed" ? "bg-green-500 text-white" :
                    s === "partial" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                  }`}>
                    Q{i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{s}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 text-left mb-6">
              {questions.map((q, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">Q{i + 1}:</span>{" "}
                  <span className="text-muted-foreground">{q.question.question.slice(0, 80)}...</span>
                </div>
              ))}
            </div>
            <Button onClick={startInterview}>Try Again</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
