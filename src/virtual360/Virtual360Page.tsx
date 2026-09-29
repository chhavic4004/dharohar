import { useMemo, useState } from "react";
import Monument360Card from "./components/Monument360Card";
import { monuments360 } from "./monuments360";

const categories = [
  "All",
  "Temples",
  "Forts",
  "Palaces",
  "Monuments",
];

export default function Virtual360Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredMonuments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return monuments360.filter((monument) => {
      const matchesSearch =
        !query ||
        monument.name.toLowerCase().includes(query) ||
        monument.city.toLowerCase().includes(query) ||
        monument.state.toLowerCase().includes(query) ||
        monument.category.toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === "All" ||
        monument.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <main className="min-h-screen bg-parchment text-ink">
      {/* Hero */}
      <section className="border-b border-maroon/10 px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-turmeric">
            Dharohar · Virtual Heritage
          </p>

          <h1 className="max-w-4xl font-serif text-5xl leading-tight text-maroon md:text-6xl">
            Virtual Heritage of India
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            Explore India's historic monuments through immersive
            360° experiences and discover the stories behind
            the places that shape our cultural heritage.
          </p>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search monuments..."
              className="w-full rounded-lg border border-maroon/20 bg-white px-5 py-4 text-ink outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10"
            />
          </div>

          {/* Categories */}
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-maroon bg-maroon text-white"
                      : "border-maroon/20 bg-white text-ink hover:border-maroon hover:text-maroon"
                  }`}
                >
                  {category}
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
              Explore
            </p>

            <h2 className="mt-2 font-serif text-4xl text-maroon">
              360° Monument Collection
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
                No monuments found
              </h3>

              <p className="mt-2 text-ink/60">
                Try another monument name, location, or category.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
