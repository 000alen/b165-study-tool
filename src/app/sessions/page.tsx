"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import kb from "@/lib/kb";

export default function SessionsPage() {
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Session Browser</h1>
      <p className="text-sm text-muted-foreground mb-6">{kb.session_summaries.length} sessions</p>

      <div className="space-y-3">
        {kb.session_summaries.map((s) => {
          const expanded = expandedSession === s.session;
          const concepts = kb.concepts.filter((c) => c.session === s.session);
          const questions = kb.questions.filter((q) => q.session === s.session);
          const cases = kb.cases.filter((c) => c.session === s.session);
          const frameworks = kb.frameworks.filter((f) => f.session === s.session);
          const discussions = kb.discussions.filter((d) => d.session === s.session);

          return (
            <Card key={s.session}>
              <CardHeader
                className="cursor-pointer pb-2"
                onClick={() => setExpandedSession(expanded ? null : s.session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono">S{s.session}</Badge>
                    <CardTitle className="text-sm">{s.topic}</CardTitle>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {s.concepts > 0 && <Badge variant="outline" className="text-xs">{s.concepts}C</Badge>}
                    {s.questions > 0 && <Badge variant="outline" className="text-xs">{s.questions}Q</Badge>}
                    {s.cases > 0 && <Badge variant="outline" className="text-xs">{s.cases}Ca</Badge>}
                    {s.frameworks > 0 && <Badge variant="outline" className="text-xs">{s.frameworks}F</Badge>}
                  </div>
                </div>
              </CardHeader>

              {expanded && (
                <CardContent className="pt-0">
                  {concepts.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Concepts ({concepts.length})</h3>
                      <div className="space-y-2">
                        {concepts.map((c, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{c.name}</span>
                            <span className="text-muted-foreground"> — {c.definition.slice(0, 120)}{c.definition.length > 120 ? "..." : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {questions.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Questions ({questions.length})</h3>
                      <div className="space-y-2">
                        {questions.map((q, i) => (
                          <div key={i} className="text-sm">
                            <Badge variant="outline" className="text-xs mr-2">{q.type}</Badge>
                            {q.question}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cases.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Cases ({cases.length})</h3>
                      <div className="space-y-2">
                        {cases.map((c, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{c.name}</span>
                            {c.stage && <Badge variant="outline" className="text-xs ml-2">{c.stage}</Badge>}
                            <p className="text-muted-foreground text-xs mt-0.5">{c.context}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {frameworks.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Frameworks ({frameworks.length})</h3>
                      <div className="space-y-1">
                        {frameworks.map((f, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{f.name}</span>
                            <span className="text-muted-foreground"> — {f.description.slice(0, 100)}{f.description.length > 100 ? "..." : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {discussions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Discussions ({discussions.length})</h3>
                      <div className="space-y-2">
                        {discussions.map((d, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{d.topic}</span>
                            <p className="text-muted-foreground text-xs mt-0.5">{d.professor_verdict}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
