"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import kb from "@/lib/kb";
import { loadProgress, type StudyProgress } from "@/lib/store";

const habitsOfMind = [
  { code: "#breakitdown", desc: "Break it down — decompose complex problems" },
  { code: "#levelsofanalysis", desc: "Levels of analysis — micro to macro thinking" },
  { code: "#complexcausality", desc: "Complex causality — multiple factors, indirect effects" },
  { code: "#strategize", desc: "Strategize — think forward and plan" },
];

function OutcomesContent() {
  const searchParams = useSearchParams();
  const initialLO = searchParams.get("lo") || "";
  const [selectedLO, setSelectedLO] = useState(initialLO || kb.learning_outcomes[0]?.code || "");
  const [progress, setProgress] = useState<StudyProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    if (initialLO) setSelectedLO(initialLO);
  }, [initialLO]);

  const allOutcomes = [...kb.learning_outcomes, ...habitsOfMind];
  const current = allOutcomes.find((lo) => lo.code === selectedLO);

  const concepts = useMemo(
    () => kb.concepts.filter((c) => c.related_los.includes(selectedLO)),
    [selectedLO]
  );
  const questions = useMemo(() => {
    const sessionSet = new Set(concepts.map((c) => c.session));
    return kb.questions.filter((q) => sessionSet.has(q.session));
  }, [concepts]);
  const cases = useMemo(() => {
    const sessionSet = new Set(concepts.map((c) => c.session));
    return kb.cases.filter((c) => sessionSet.has(c.session));
  }, [concepts]);
  const frameworks = useMemo(() => {
    const sessionSet = new Set(concepts.map((c) => c.session));
    return kb.frameworks.filter((f) => sessionSet.has(f.session));
  }, [concepts]);

  const reviewed = progress ? concepts.filter((c) => progress.reviewedConcepts[c.name]).length : 0;
  const gotIt = progress ? concepts.filter((c) => progress.reviewedConcepts[c.name] === "got_it").length : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Learning Outcome Map</h1>
      <p className="text-sm text-muted-foreground mb-6">7 LOs + 4 Habits of Mind</p>

      {/* LO Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {kb.learning_outcomes.map((lo) => {
          const c = kb.concepts.filter((c) => c.related_los.includes(lo.code));
          const g = progress ? c.filter((c) => progress.reviewedConcepts[c.name] === "got_it").length : 0;
          return (
            <Card
              key={lo.code}
              className={`cursor-pointer transition-colors ${selectedLO === lo.code ? "border-primary" : "hover:border-primary/50"}`}
              onClick={() => setSelectedLO(lo.code)}
            >
              <CardContent className="py-4">
                <Badge variant={selectedLO === lo.code ? "default" : "secondary"} className="font-mono text-xs mb-2">
                  {lo.code.replace("#b165-", "")}
                </Badge>
                <p className="text-sm font-medium">{lo.desc}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={c.length > 0 ? (g / c.length) * 100 : 0} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{g}/{c.length}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Habits of Mind</h3>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {habitsOfMind.map((hc) => {
          const c = kb.concepts.filter((c) => c.related_los.includes(hc.code));
          return (
            <Card
              key={hc.code}
              className={`cursor-pointer transition-colors ${selectedLO === hc.code ? "border-primary" : "hover:border-primary/50"}`}
              onClick={() => setSelectedLO(hc.code)}
            >
              <CardContent className="py-3">
                <Badge variant={selectedLO === hc.code ? "default" : "outline"} className="text-xs mb-1">
                  {hc.code.replace("#", "")}
                </Badge>
                <p className="text-xs">{hc.desc}</p>
                <span className="text-xs text-muted-foreground">{c.length} concepts</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail view */}
      {current && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{current.desc}</CardTitle>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>{concepts.length} concepts</span>
              <span>{questions.length} questions</span>
              <span>{cases.length} cases</span>
              <span>{frameworks.length} frameworks</span>
            </div>
            {concepts.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Progress value={(gotIt / concepts.length) * 100} className="h-2 flex-1 max-w-xs" />
                <span className="text-sm text-muted-foreground">{gotIt}/{concepts.length} mastered</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="concepts">
              <TabsList>
                <TabsTrigger value="concepts">Concepts</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
                <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
              </TabsList>
              <TabsContent value="concepts" className="space-y-2 mt-4">
                {concepts.map((c, i) => (
                  <div key={i} className="text-sm border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <Badge variant="outline" className="text-xs">S{c.session}</Badge>
                      {progress?.reviewedConcepts[c.name] && (
                        <Badge variant={progress.reviewedConcepts[c.name] === "got_it" ? "default" : "destructive"} className="text-xs">
                          {progress.reviewedConcepts[c.name] === "got_it" ? "mastered" : "review"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">{c.definition.slice(0, 150)}{c.definition.length > 150 ? "..." : ""}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="questions" className="space-y-2 mt-4">
                {questions.map((q, i) => (
                  <div key={i} className="text-sm border-b pb-2">
                    <Badge variant="outline" className="text-xs mr-2">{q.type}</Badge>
                    <Badge variant="secondary" className="text-xs mr-2">S{q.session}</Badge>
                    {q.question}
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="cases" className="space-y-2 mt-4">
                {cases.map((c, i) => (
                  <div key={i} className="text-sm border-b pb-2">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant="outline" className="text-xs ml-2">S{c.session}</Badge>
                    <p className="text-muted-foreground text-xs mt-0.5">{c.context}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="frameworks" className="space-y-2 mt-4">
                {frameworks.map((f, i) => (
                  <div key={i} className="text-sm border-b pb-2">
                    <span className="font-medium">{f.name}</span>
                    <Badge variant="outline" className="text-xs ml-2">S{f.session}</Badge>
                    <p className="text-muted-foreground text-xs mt-0.5">{f.description.slice(0, 150)}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function OutcomesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8">Loading...</div>}>
      <OutcomesContent />
    </Suspense>
  );
}
