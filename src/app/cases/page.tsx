"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import kb from "@/lib/kb";

export default function CasesPage() {
  const [search, setSearch] = useState("");
  const [filterSession, setFilterSession] = useState("all");

  const sessions = useMemo(() => [...new Set(kb.cases.map((c) => c.session))].sort((a, b) => a - b), []);

  const filtered = useMemo(() => {
    return kb.cases.filter((c) => {
      if (filterSession !== "all" && c.session !== Number(filterSession)) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.context.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, filterSession]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Case Studies</h1>
      <p className="text-sm text-muted-foreground mb-6">{kb.cases.length} companies and real-world decisions</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Input
          placeholder="Search companies..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="text-sm border rounded-md px-2 py-1 bg-background" value={filterSession}
          onChange={(e) => setFilterSession(e.target.value)}>
          <option value="all">All Sessions</option>
          {sessions.map((s) => (
            <option key={s} value={s}>Session {s}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{filtered.length} results</p>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((c, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <Badge variant="secondary" className="shrink-0 ml-2">S{c.session}</Badge>
              </div>
              {c.stage && <Badge variant="outline" className="mt-1 w-fit text-xs">{c.stage}</Badge>}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{c.context}</p>
              {c.key_decisions.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Key Decisions</h4>
                  <ul className="text-sm space-y-1">
                    {c.key_decisions.map((d, j) => (
                      <li key={j} className="flex gap-2"><span className="text-muted-foreground">-</span>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {c.key_takeaways.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Takeaways</h4>
                  <ul className="text-sm space-y-1">
                    {c.key_takeaways!.map((t, j) => (
                      <li key={j} className="flex gap-2"><span className="text-primary">-</span>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
