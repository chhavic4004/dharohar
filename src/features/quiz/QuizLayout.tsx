import { Outlet, useLocation } from "react-router";
import { QuizNav } from "./components/QuizNav";

/** Wraps every quiz page. The section nav is hidden while a quiz is in progress so players can focus. */
export default function QuizLayout() {
  const { pathname } = useLocation();
  const playing = pathname.startsWith("/quiz/play/");
  return (
    <div className="flex-1 bg-parchment">
      {!playing && <QuizNav />}
      <Outlet />
    </div>
  );
}
