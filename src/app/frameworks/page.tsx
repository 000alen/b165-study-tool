"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import kb from "@/lib/kb";

export default function FrameworksPage() {
  const [search, setSearch] = useState("");
  const [filterSession, setFilterSession] = useState("all");

  const sessions = useMemo(() => [...new Set(kb.frameworks.map((f) => f.session))].sort((a, b) => a - b), []);

  const filtered = useMemo(() => {
    return kb.frameworks.filter((f) => {
      if (filterSession !== "all" && f.session !== Number(filterSession)) return false;
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) &&
          !f.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, filterSession]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Frameworks</h1>
      <p className="text-sm text-muted-foreground mb-6">{kb.frameworks.length} analytical frameworks from class</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Input
          placeholder="Search frameworks..."
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{f.name}</CardTitle>
                <Badge variant="secondary" className="shrink-0 ml-2">S{f.session}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{f.description}</p>
              {f.application && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Applied:</span> {f.application}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
