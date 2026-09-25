import { Crown, Flame, Landmark, Music, Shuffle, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { CategoryId, QuestionType, QuizCategoryParam } from "@shared/quiz-contract";

export interface CategoryMeta {
  id: QuizCategoryParam;
  label: string;
  hindi: string;
  icon: LucideIcon;
  image: string;
  color: string;
}

/** Visual metadata for each category (images and colours from the Figma design). */
export const CATEGORY_META: Record<QuizCategoryParam, CategoryMeta> = {
  rhythms: {
    id: "rhythms",
    label: "Rhythms & Ragas",
    hindi: "राग और ताल",
    icon: Music,
    image: "https://images.unsplash.com/photo-1568219656418-15c329312bf1?w=600&h=400&fit=crop&auto=format",
    color: "#7A1F35",
  },
  architecture: {
    id: "architecture",
    label: "Architectural Marvels",
    hindi: "स्थापत्य चमत्कार",
    icon: Landmark,
    image: "https://images.unsplash.com/photo-1698055689340-291dac6a7062?w=600&h=400&fit=crop&auto=format",
    color: "#C9622E",
  },
  culinary: {
    id: "culinary",
    label: "Culinary Roots",
    hindi: "पाककला की जड़ें",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1546702005-7f8e5aeab4a6?w=600&h=400&fit=crop&auto=format",
    color: "#C68A1D",
  },
  traditions: {
    id: "traditions",
    label: "Living Traditions & Lore",
    hindi: "परम्परा और लोककथा",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1756370256926-e48ca54c5efe?w=600&h=400&fit=crop&auto=format",
    color: "#3E6B4F",
  },
  rulers: {
    id: "rulers",
    label: "Rulers & Empires",
    hindi: "राजा और साम्राज्य",
    icon: Crown,
    image: "https://images.unsplash.com/photo-1698055589154-a5e83f9006d1?w=600&h=400&fit=crop&auto=format",
    color: "#4A3728",
  },
  mixed: {
    id: "mixed",
    label: "Mixed Bag",
    hindi: "मिश्रित",
    icon: Shuffle,
    image: "",
    color: "#241B1D",
  },
};

export const CATEGORY_IDS: CategoryId[] = ["rhythms", "architecture", "culinary", "traditions", "rulers"];

export const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "Multiple choice",
  true_false: "True or false",
  odd_one_out: "Odd one out",
  chronology: "Put in order",
  match: "Match the pairs",
};

export const TYPE_HINTS: Record<QuestionType, string> = {
  mcq: "Choose one answer.",
  true_false: "Decide whether the statement is true.",
  odd_one_out: "Find the one that does not belong.",
  chronology: "Arrange the items from earliest to latest, then submit.",
  match: "Pick the matching item for each row, then submit.",
};
