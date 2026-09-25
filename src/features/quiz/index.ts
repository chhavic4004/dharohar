/**
 * Dharohar Quiz feature module.
 *
 * Integration: spread `quizRoutes` into the children of the site's main
 * layout route in App.tsx. Everything the quiz needs lives in this folder,
 * plus the shared API contract in /shared/quiz-contract.ts.
 */
import type { RouteObject } from "react-router";
import QuizLayout from "./QuizLayout";
import DailyChallenge from "./pages/DailyChallenge";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import QuizHome from "./pages/QuizHome";
import QuizPlay from "./pages/QuizPlay";
import QuizResults from "./pages/QuizResults";
import Rewards from "./pages/Rewards";

export const quizRoutes: RouteObject[] = [
  {
    path: "quiz",
    Component: QuizLayout,
    children: [
      { index: true, Component: QuizHome },
      { path: "play/:sessionId", Component: QuizPlay },
      { path: "results/:attemptId", Component: QuizResults },
      { path: "daily", Component: DailyChallenge },
      { path: "rewards", Component: Rewards },
      { path: "leaderboard", Component: Leaderboard },
      { path: "profile", Component: Profile },
    ],
  },
];

export { setAuthToken } from "./api/client";
export { quizApi } from "./api/quizApi";
