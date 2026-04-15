"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import kb from "@/lib/kb";
import { useAuth } from "@/lib/auth-context";

export default function ProfDashboard() {
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && role !== "professor") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, role, router]);

  if (role !== "professor") {
    return null;
  }

  const totalConcepts = kb.concepts.length;
  const totalQuestions = kb.questions.length;
  const totalCases = kb.cases.length;
  const totalFrameworks = kb.frameworks.length;

  // Session breakdown
  const sessionBreakdown = kb.session_summaries.map((s) => ({
    session: s.session,
    topic: s.topic,
    concepts: s.concepts,
    questions: s.questions,
    cases: s.cases,
    frameworks: s.frameworks,
  }));

  // LO content breakdown
  const loBreakdown = kb.learning_outcomes.map((lo) => {
    const concepts = kb.concepts.filter((c) => c.related_los.includes(lo.code));
    return { code: lo.code, desc: lo.desc, count: concepts.length };
  });

  // Question type distribution
  const questionTypes: Record<string, number> = {};
  kb.questions.forEach((q) => {
    questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
  });
  const typeEntries = Object.entries(questionTypes).sort((a, b) => b[1] - a[1]);
  const maxTypeCount = Math.max(...typeEntries.map(([, c]) => c));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Professor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Content analytics for B165 — Global Financial Strategy</p>
      </div>

      {/* Total stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalConcepts}</div>
            <div className="text-sm text-muted-foreground">Concepts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCases}</div>
            <div className="text-sm text-muted-foreground">Case Studies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalFrameworks}</div>
            <div className="text-sm text-muted-foreground">Frameworks</div>
          </CardContent>
        </Card>
      </div>

      {/* Session breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Content by Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium">#</th>
                  <th className="pb-2 pr-4 font-medium">Topic</th>
                  <th className="pb-2 pr-4 font-medium text-right">Concepts</th>
                  <th className="pb-2 pr-4 font-medium text-right">Questions</th>
                  <th className="pb-2 pr-4 font-medium text-right">Cases</th>
                  <th className="pb-2 font-medium text-right">Frameworks</th>
                </tr>
              </thead>
              <tbody>
                {sessionBreakdown.map((s) => (
                  <tr key={s.session} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-muted-foreground">{s.session}</td>
                    <td className="py-2 pr-4">{s.topic}</td>
                    <td className="py-2 pr-4 text-right">{s.concepts}</td>
                    <td className="py-2 pr-4 text-right">{s.questions}</td>
                    <td className="py-2 pr-4 text-right">{s.cases}</td>
                    <td className="py-2 text-right">{s.frameworks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* LO content breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Content by Learning Outcome</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loBreakdown
              .sort((a, b) => b.count - a.count)
              .map((lo) => (
                <div key={lo.code} className="flex items-center gap-3">
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs w-16 justify-center">
                    {lo.code.replace("#b165-", "").replace("#", "")}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(lo.count / Math.max(...loBreakdown.map((l) => l.count))) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground shrink-0">{lo.count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{lo.desc}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Question type distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Question Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {typeEntries.map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm w-28 shrink-0 capitalize">{type}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="h-6 rounded bg-primary/80 flex items-center justify-end pr-2"
                    style={{ width: `${(count / maxTypeCount) * 100}%`, minWidth: "2rem" }}
                  >
                    <span className="text-xs text-primary-foreground font-medium">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student analytics placeholder */}
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Student analytics require server-side tracking (coming soon)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
