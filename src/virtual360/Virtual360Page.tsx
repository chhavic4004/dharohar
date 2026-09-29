import { useMemo, useState } from "react";
import Monument360Card from "./components/Monument360Card";
import { localizeMonument, monuments360 } from "./monuments360";
import { usePageText } from "../i18n/page";
import { virtual360Text } from "../i18n/pages/virtual360";

const categories = [
  "All",
  "Temples",
  "Forts",
  "Palaces",
  "Monuments",
] as const;

type CategoryKey = "catAll" | "catTemples" | "catForts" | "catPalaces" | "catMonuments";
const categoryKey = (category: string): CategoryKey =>
  `cat${category}` as CategoryKey;

export default function Virtual360Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { t, lang, dir } = usePageText(virtual360Text);

  const filteredMonuments = useMemo(() => {
    const query = searchQuery.toLocaleLowerCase().trim();

    return monuments360
      .map((monument) => ({
        original: monument,
        localized: localizeMonument(monument, lang),
      }))
      .filter(({ original, localized }) => {
        // Match against both the localized and the English text.
        const haystack = [
          localized.name,
          localized.city,
          localized.state,
          t(categoryKey(original.category)),
          original.name,
          original.city,
          original.state,
          original.category,
        ];
        const matchesSearch =
          !query ||
          haystack.some((value) =>
            value.toLocaleLowerCase().includes(query),
          );

        const matchesCategory =
          activeCategory === "All" ||
          original.category === activeCategory;

        return matchesSearch && matchesCategory;
      })
      .map(({ localized }) => localized);
  }, [searchQuery, activeCategory, lang, t]);

  return (
    <main
      className="min-h-screen bg-parchment text-ink"
      lang={lang}
      dir={dir}
    >
      {/* Hero */}
      <section className="border-b border-maroon/10 px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-turmeric">
            {t("eyebrow")}
          </p>

          <h1 className="max-w-4xl font-serif text-5xl leading-tight text-maroon md:text-6xl">
            {t("heroTitle")}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            {t("heroBody")}
          </p>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {/* Search */}
          <div className="relative">
            <input
              type="search"
              aria-label={t("searchLabel")}
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-lg border border-maroon/20 bg-white px-5 py-4 text-ink outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10"
            />
          </div>

          {/* Categories */}
          <div
            className="mt-6 flex flex-wrap gap-3"
            role="group"
            aria-label={t("filtersLabel")}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-maroon bg-maroon text-white"
                      : "border-maroon/20 bg-white text-ink hover:border-maroon hover:text-maroon"
                  }`}
                >
                  {t(categoryKey(category))}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Monument Collection */}
      <section className="px-6 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-turmeric">
              {t("exploreEyebrow")}
            </p>

            <h2 className="mt-2 font-serif text-4xl text-maroon">
              {t("collectionTitle")}
            </h2>
          </div>

          {filteredMonuments.length > 0 ? (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredMonuments.map((monument) => (
                <Monument360Card
                  key={monument.id}
                  monument={monument}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-maroon/10 bg-white px-6 py-16 text-center">
              <h3 className="font-serif text-2xl text-maroon">
                {t("emptyTitle")}
              </h3>

              <p className="mt-2 text-ink/60">
                {t("emptyBody")}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
