import type {
  AnswerPayload,
  AnswerResult,
  CategoryId,
  CategorySummary,
  DailyAnswerResult,
  DailyChallenge,
  Difficulty,
  LeaderboardResponse,
  NextQuestionResponse,
  PlayerProfile,
  QuizCategoryParam,
  QuizResult,
  RedeemResponse,
  Redemption,
  Reward,
  SessionInfo,
} from "@shared/quiz-contract";
import { api } from "./client";

/** Every backend call the quiz feature makes. Nothing else in the UI calls fetch. */
export const quizApi = {
  categories: () => api<CategorySummary[]>("GET", "/quiz/categories"),

  startSession: (category: QuizCategoryParam, difficulty: Difficulty) =>
    api<SessionInfo>("POST", "/quiz/sessions", { category, difficulty }),
  currentQuestion: (sessionId: string) => api<NextQuestionResponse>("GET", `/quiz/sessions/${sessionId}/current`),
  answer: (sessionId: string, questionId: string, answer: AnswerPayload) =>
    api<AnswerResult>("POST", `/quiz/sessions/${sessionId}/answers`, { questionId, answer }),
  complete: (sessionId: string) => api<QuizResult>("POST", `/quiz/sessions/${sessionId}/complete`),
  attempt: (attemptId: string) => api<QuizResult>("GET", `/quiz/attempts/${attemptId}`),

  daily: () => api<DailyChallenge>("GET", "/quiz/daily"),
  answerDaily: (answer: AnswerPayload) => api<DailyAnswerResult>("POST", "/quiz/daily/answer", { answer }),

  profile: () => api<PlayerProfile>("GET", "/quiz/me"),
  rename: (displayName: string) => api<PlayerProfile>("PATCH", "/quiz/me", { displayName }),
  leaderboard: (scope: CategoryId | "overall" = "overall") =>
    api<LeaderboardResponse>("GET", `/quiz/leaderboard?scope=${scope}`),

  rewards: () => api<Reward[]>("GET", "/quiz/rewards"),
  redeem: (rewardId: string) => api<RedeemResponse>("POST", `/quiz/rewards/${rewardId}/redeem`),
  redemptions: () => api<Redemption[]>("GET", "/quiz/me/redemptions"),
};
