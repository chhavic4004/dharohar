/**
 * Dharohar Quiz feature module.
 *
 * Integration: spread `quizRoutes` into the children of the site's main
 * layout route in App.tsx. Everything the quiz needs lives in this folder,
 * plus the shared API contract in /shared/quiz-contract.ts.
 *
 * Other features can also use:
 *   <HeritageQuizCard heritageId="phulkari" />   quiz card for any archive page
 *   quizApi.heritage(id) / quizApi.heritageMany(ids)
 *   window.dispatchEvent(new CustomEvent("dharohar:lang", { detail: "hi" }))   drive the quiz language
 */
import type { RouteObject } from "react-router";
import QuizLayout from "./QuizLayout";
import Admin from "./pages/Admin";
import Certificate from "./pages/Certificate";
import ChallengePage from "./pages/ChallengePage";
import DailyChallenge from "./pages/DailyChallenge";
import HeritageQuiz from "./pages/HeritageQuiz";
import Leaderboard from "./pages/Leaderboard";
import Offline from "./pages/Offline";
import Profile from "./pages/Profile";
import QuizHome from "./pages/QuizHome";
import QuizPlay from "./pages/QuizPlay";
import QuizResults from "./pages/QuizResults";
import Review from "./pages/Review";
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
      { path: "review", Component: Review },
      { path: "challenge/:code", Component: ChallengePage },
      { path: "heritage/:id", Component: HeritageQuiz },
      { path: "offline", Component: Offline },
      { path: "rewards", Component: Rewards },
      { path: "certificate", Component: Certificate },
      { path: "leaderboard", Component: Leaderboard },
      { path: "profile", Component: Profile },
      { path: "admin", Component: Admin },
    ],
  },
];

export { setAuthToken } from "./api/client";
export { quizApi } from "./api/quizApi";
export { default as HeritageQuizCard } from "./components/HeritageQuizCard";
export { I18nProvider, useI18n } from "./i18n";
