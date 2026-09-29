import { useEffect, useState } from "react";
import type { HeritageQuizInfo } from "@shared/quiz-contract";
import { quizApi } from "../quiz/api/quizApi";
import { FALLBACK_HERITAGE, tracked } from "./data";

export type HeritageSource = "loading" | "live" | "demo";

/** Live heritage registry (with HVS) from the quiz API; demo list if the API is down or empty. */
export function useAdminHeritage() {
  const [items, setItems] = useState<HeritageQuizInfo[]>(FALLBACK_HERITAGE);
  const [source, setSource] = useState<HeritageSource>("loading");

  useEffect(() => {
    let live = true;
    quizApi
      .allHeritage()
      .then((xs) => {
        if (!live) return;
        if (tracked(xs).length) {
          setItems(xs);
          setSource("live");
        } else setSource("demo");
      })
      .catch(() => live && setSource("demo"));
    return () => {
      live = false;
    };
  }, []);

  return { items, source };
}
