"use client";

export interface StudyProgress {
  reviewedConcepts: Record<string, "got_it" | "review">;
  attemptedQuestions: Record<number, "nailed" | "partial" | "missed">;
  interviewScores: { date: string; score: number; total: number }[];
}

const STORAGE_KEY = "b165-study-progress";

function getDefault(): StudyProgress {
  return {
    reviewedConcepts: {},
    attemptedQuestions: {},
    interviewScores: [],
  };
}

export function loadProgress(): StudyProgress {
  if (typeof window === "undefined") return getDefault();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefault();
    return { ...getDefault(), ...JSON.parse(raw) };
  } catch {
    return getDefault();
  }
}

export function saveProgress(p: StudyProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function markConcept(name: string, status: "got_it" | "review") {
  const p = loadProgress();
  p.reviewedConcepts[name] = status;
  saveProgress(p);
  return p;
}

export function markQuestion(index: number, status: "nailed" | "partial" | "missed") {
  const p = loadProgress();
  p.attemptedQuestions[index] = status;
  saveProgress(p);
  return p;
}

export function addInterviewScore(score: number, total: number) {
  const p = loadProgress();
  p.interviewScores.push({ date: new Date().toISOString(), score, total });
  saveProgress(p);
  return p;
}
