export interface SessionSummary {
  session: number;
  topic: string;
  word_count: number;
  concepts: number;
  questions: number;
  cases: number;
  frameworks: number;
}

export interface Concept {
  name: string;
  definition: string;
  context: string;
  related_los: string[];
  session: number;
}

export interface Question {
  question: string;
  type: string;
  topic: string;
  expected_answer_elements: string[];
  follow_ups: string[];
  session: number;
}

export interface CaseStudy {
  name: string;
  context: string;
  stage: string;
  key_decisions: string[];
  key_takeaways: string[];
  session: number;
}

export interface Framework {
  name: string;
  description: string;
  application: string;
  session: number;
}

export interface Discussion {
  topic: string;
  summary: string;
  professor_verdict: string;
  session: number;
}

export interface Reading {
  title: string;
  how_used: string;
  session: number;
}

export interface CrossCourseConnection {
  course: string;
  concept: string;
  connection: string;
  session: number;
}

export interface LearningOutcome {
  code: string;
  desc: string;
}

export interface KnowledgeBase {
  course: string;
  professor: string;
  sessions_processed: number;
  total_word_count: number;
  session_summaries: SessionSummary[];
  concepts: Concept[];
  questions: Question[];
  cases: CaseStudy[];
  frameworks: Framework[];
  discussions: Discussion[];
  readings: Reading[];
  cross_course_connections: CrossCourseConnection[];
  learning_outcomes: LearningOutcome[];
}
