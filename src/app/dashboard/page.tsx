"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import kb from "@/lib/kb";
import { loadProgress, type StudyProgress } from "@/lib/store";

const navCards = [
  { href: "/flashcards", title: "Flashcards", desc: "Review 313 concepts with spaced repetition", icon: "🗂" },
  { href: "/practice", title: "Practice Questions", desc: "173 professor-style questions", icon: "✍️" },
  { href: "/cases", title: "Case Studies", desc: "85 companies and real decisions", icon: "🏢" },
  { href: "/frameworks", title: "Frameworks", desc: "99 analytical frameworks", icon: "🔧" },
  { href: "/interview", title: "Mock Interview", desc: "Timed Folkinshteyn-style interview", icon: "🎤" },
  { href: "/sessions", title: "Session Browser", desc: "Browse all 23 sessions", icon: "📅" },
  { href: "/outcomes", title: "LO Map", desc: "7 learning outcomes + coverage", icon: "🗺" },
];

export default function Dashboard() {
  const [progress, setProgress] = useState<StudyProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const totalConcepts = kb.concepts.length;
  const totalQuestions = kb.questions.length;
  const gotItCount = progress ? Object.values(progress.reviewedConcepts).filter((v) => v === "got_it").length : 0;
  const nailedCount = progress ? Object.values(progress.attemptedQuestions).filter((v) => v === "nailed").length : 0;

  // LO breakdown
  const loStats = kb.learning_outcomes.map((lo) => {
    const concepts = kb.concepts.filter((c) => c.related_los.includes(lo.code));
    const reviewed = progress ? concepts.filter((c) => progress.reviewedConcepts[c.name]).length : 0;
    return { ...lo, total: concepts.length, reviewed };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">B165 Study Tool</h1>
        <p className="text-muted-foreground mt-1">Global Financial Strategy — Prof. Folkinshteyn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalConcepts}</div>
            <div className="text-sm text-muted-foreground">Concepts</div>
            {progress && (
              <Progress value={(gotItCount / totalConcepts) * 100} className="mt-2 h-1.5" />
            )}
            <div className="text-xs text-muted-foreground mt-1">{gotItCount} mastered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
            {progress && (
              <Progress value={(nailedCount / totalQuestions) * 100} className="mt-2 h-1.5" />
            )}
            <div className="text-xs text-muted-foreground mt-1">{nailedCount} nailed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{kb.cases.length}</div>
            <div className="text-sm text-muted-foreground">Case Studies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{kb.frameworks.length}</div>
            <div className="text-sm text-muted-foreground">Frameworks</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {navCards.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{c.icon}</span> {c.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* LO Progress */}
      <h2 className="text-xl font-semibold mb-4">Learning Outcome Coverage</h2>
      <div className="grid gap-3">
        {loStats.map((lo) => (
          <Link key={lo.code} href={`/outcomes?lo=${lo.code}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center gap-4">
                <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                  {lo.code.replace("#b165-", "").replace("#", "")}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{lo.desc}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={lo.total > 0 ? (lo.reviewed / lo.total) * 100 : 0} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground shrink-0">
                      {lo.reviewed}/{lo.total}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
