import type {
  AdminStats,
  AnswerPayload,
  AnswerResult,
  CategoryId,
  CategorySummary,
  ChallengeInfo,
  DailyAnswerResult,
  DailyChallenge,
  Difficulty,
  HistoryPage,
  HeritageQuizInfo,
  LeaderboardResponse,
  NextQuestionResponse,
  OfflinePack,
  OfflineSubmission,
  OfflineSyncResult,
  PlayerProfile,
  QuizCategoryParam,
  QuizResult,
  RedeemResponse,
  Redemption,
  Reward,
  SessionInfo,
  StartSessionRequest,
} from "@shared/quiz-contract";
import { api } from "./client";

/** Every backend call the quiz feature makes. Nothing else in the UI calls fetch. */
export const quizApi = {
  categories: () => api<CategorySummary[]>("GET", "/quiz/categories"),

  startSession: (req: StartSessionRequest) => api<SessionInfo>("POST", "/quiz/sessions", req),
  startStandard: (category: QuizCategoryParam, difficulty: Difficulty) =>
    api<SessionInfo>("POST", "/quiz/sessions", { mode: "standard", category, difficulty }),
  currentQuestion: (sessionId: string) => api<NextQuestionResponse>("GET", `/quiz/sessions/${sessionId}/current`),
  answer: (sessionId: string, questionId: string, answer: AnswerPayload) =>
    api<AnswerResult>("POST", `/quiz/sessions/${sessionId}/answers`, { questionId, answer }),
  complete: (sessionId: string) => api<QuizResult>("POST", `/quiz/sessions/${sessionId}/complete`),
  attempt: (attemptId: string) => api<QuizResult>("GET", `/quiz/attempts/${attemptId}`),

  heritage: (id: string) => api<HeritageQuizInfo>("GET", `/quiz/heritage/${encodeURIComponent(id)}`),
  heritageMany: (ids: string[]) => api<HeritageQuizInfo[]>("GET", `/quiz/heritage?ids=${ids.map(encodeURIComponent).join(",")}`),

  createChallenge: (attemptId: string) => api<ChallengeInfo>("POST", "/quiz/challenges", { attemptId }),
  challenge: (code: string) => api<ChallengeInfo>("GET", `/quiz/challenges/${encodeURIComponent(code)}`),

  daily: () => api<DailyChallenge>("GET", "/quiz/daily"),
  answerDaily: (answer: AnswerPayload) => api<DailyAnswerResult>("POST", "/quiz/daily/answer", { answer }),

  offlinePack: (category: QuizCategoryParam, difficulty: Difficulty) =>
    api<OfflinePack>("POST", "/quiz/offline/packs", { category, difficulty }),
  syncOfflinePack: (packId: string, submission: OfflineSubmission) =>
    api<OfflineSyncResult>("POST", `/quiz/offline/packs/${packId}/submit`, submission),

  profile: () => api<PlayerProfile>("GET", "/quiz/me"),
  rename: (displayName: string) => api<PlayerProfile>("PATCH", "/quiz/me", { displayName }),
  leaderboard: (scope: CategoryId | "overall" = "overall") =>
    api<LeaderboardResponse>("GET", `/quiz/leaderboard?scope=${scope}`),

  rewards: () => api<Reward[]>("GET", "/quiz/rewards"),
  redeem: (rewardId: string) => api<RedeemResponse>("POST", `/quiz/rewards/${rewardId}/redeem`),
  redemptions: () => api<Redemption[]>("GET", "/quiz/me/redemptions"),
  history: (before?: string, limit = 20) =>
    api<HistoryPage>("GET", `/quiz/me/history?limit=${limit}${before ? `&before=${encodeURIComponent(before)}` : ""}`),
  allHeritage: () => api<HeritageQuizInfo[]>("GET", "/quiz/heritage"),

  adminStats: (adminKey: string) => api<AdminStats>("GET", "/quiz/admin/stats", undefined, { "X-Admin-Key": adminKey }),
};
