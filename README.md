# Dharohar: Heritage Quiz module

This repository is the Dharohar website (from the Figma Make prototype) with a fully working **Heritage Quiz**: frontend, backend and a verified question bank.

The quiz is built as a self-contained module, so teammates can merge it into the main site without touching their own pages.

## What the quiz does

- **5 categories** plus a *Mixed Bag* mode, and **2 difficulty levels**:
  - **Seeker**: no timer.
  - **Historian**: 30 seconds per question, with a speed bonus.
- **10 questions per quiz**, drawn from a bank of **241 questions** (21 per category per difficulty, plus 31 image, audio and map questions). Players are served questions they have not seen recently, so repeat plays feel new.
- **6 question types**: multiple choice, true or false, odd one out, put in order (chronology), match the pairs and **map pin** (drop a pin on India; correct if within the question's radius).
- **Image and audio questions** using freely licensed files from Wikimedia Commons, with credits shown under each one.
- **A full explanation after every answer**: title, explanation, a "Did you know?" fact and a link to the source (UNESCO, Britannica, the GI Registry, government sites).
- **Problem of the Day**: one new question daily at midnight IST, the same for everyone. It comes from a separate pool of 30 questions and has its own streak and streak rewards.
- **Game layer**:
  - XP and 7 levels.
  - Coins.
  - 15 badges.
  - Personal bests.
  - Overall and per-category leaderboards.
- **Results screen**:
  - Score ring and rating.
  - XP breakdown (base, speed, streak, perfect bonus) and coins earned.
  - Level progress and badges unlocked.
  - Accuracy by question type.
  - A full answer review with explanations.
- **Rewards store (prototype)**: spend coins on discount codes for museums, heritage walks, handloom, workshops and homestays. Partners are clearly marked as samples.
- **Printable certificate** unlocked by the "Heritage Supporter Certificate" reward (`/quiz/certificate`, print or save as PDF).

### Second batch of features

- **Archive links**: every question is linked to one or more traditions or sites in `heritage/registry.ts` (110 traditions and sites). After answering, players see "Explore in the archive", "View on map" and "Quiz on this". `/quiz/heritage/:id` runs a quiz about one entry; short lists are topped up with related questions from the same state.
- **Heritage Vulnerability Score (HVS)**: at-risk traditions show their score and band (Stable 0 to 33, Vulnerable 34 to 66, Critical 67 to 100) with a "Preserve a story" call to action. A **Save the Vulnerable** mode builds quizzes from those traditions. Current scores are samples (`isSample: true`) until the Vitality team connects real data.
- **Languages**: English and Hindi are complete (all 271 questions, explanations and UI). Punjabi and Urdu have UI text and fall back to English for question content until a translation service is configured (`TRANSLATE_URL`, for example IndicTrans2). Urdu switches the layout to right-to-left.
- **Read aloud** for questions and explanations with the browser's speech engine, or an AI4Bharat TTS endpoint via `VITE_TTS_URL`.
- **Map Challenge** mode: only map pin questions, with distance feedback and the correct spot drawn on the map.
- **Revise mistakes** (spaced repetition): each missed question comes back after 1, 3, 7, 14 and 30 days. Five correct reviews in a row and it is mastered (`/quiz/review`).
- **Challenge a friend**: from the results screen, create a 6 character code. Friends get the exact same questions in the same order and see a head to head comparison (`/quiz/challenge/:code`).
- **Offline packs**: download 10 questions, play with no internet, and results sync automatically when back online (5 XP per correct answer; coins are online only). A small service worker caches the app shell in production builds.
- **Admin analytics** (`/quiz/admin`, needs `ADMIN_KEY`): totals, accuracy by category and type, hardest and easiest questions, and "awareness gaps" (traditions people know least about).
- **Heritage quiz widget**: `<HeritageQuizCard heritageId="phulkari" />` can be dropped into any page. It is already on the Phulkari tradition page.

### Third batch: accounts, languages and the map

- **Accounts**: sign up and sign in with email and password, or with Google. Passwords are hashed with scrypt; logins use signed tokens (JWT, 30 days). Everything a player does (quizzes, Problem of the Day, rewards, offline packs, badges, streaks) is saved on the account and follows them to any device.
- **Guest progress is never lost**: when a guest signs up or signs in, their progress and history in that browser are moved into the account automatically.
- **Account page** (`/account`): name, password (or set one for Google accounts), "sign out of all devices", and the **full account history** with paging.
- **One language switch for the whole site**: the button at the top right (and in the mobile menu) now drives the header, footer, sign in, account, Heritage Map and every quiz screen. It is remembered across visits and tabs, sets `<html lang>`, and switches Urdu to right-to-left. Quiz UI text is complete in all four languages; question content is complete in English and Hindi.
- **Heritage Map integration**: the map shows a "Heritage quiz spots" layer with every tradition and site that has questions (98 across India), coloured by vulnerability. Popups link to "Quiz on this" and the archive. "View on map" links from quiz answers fly to the spot and open it.

## Quick start

You need Node.js 20 or newer.

```bash
# 1. Install
npm install
npm --prefix server install

# 2. Run the API and the website together
npm run dev:full
```

- Website: http://localhost:8443/quiz
- API: http://localhost:4000/api/health

You can also run them in two terminals with `npm run dev:api` and `npm run dev`.

No database setup is needed. By default the API saves data to `server/data/db.json`. To use MongoDB (local or Atlas), copy `server/.env.example` to `server/.env` and set `MONGODB_URI`.

### Checks

```bash
npm run typecheck                    # frontend types
npm --prefix server run typecheck    # backend types
npm run test:api                     # 39 API tests (quiz, daily, rewards, modes, review, challenges, Hindi, offline, admin, accounts, Google, guest merge, history)
npm --prefix server run check:bank   # validates every question: ids, answers, sources, map coordinates, Hindi coverage, no emojis
npm run build                        # production build of the website
```

## Project structure

```
shared/quiz-contract.ts        API types used by BOTH frontend and backend
src/lib/language.ts            site-wide language (useLang, setLang); used by header, quiz, map
src/lib/http.ts                shared API client: token, guest id, X-Lang (use it for any feature)
src/lib/toast.tsx              tiny site-wide toast
src/i18n/site.ts               header, footer, account and map text in en, hi, pa, ur
src/features/auth/             accounts: AuthProvider/useAuth, /login, /account, AccountMenu, Google button
src/features/quiz/             Frontend module (the only folder the quiz UI lives in)
  index.ts                     exports quizRoutes, quizApi, setAuthToken, HeritageQuizCard, I18nProvider, useI18n
  api/client.ts                fetch wrapper, guest id, auth token hook, X-Lang header
  api/quizApi.ts               every backend call
  constants.ts                 category visuals and ARCHIVE_LINKS (routes into the rest of the site)
  i18n/                        UI strings (en, hi, pa, ur) and the language provider
  offline/                     offline pack storage, background sync, service worker registration
  hooks/useSpeech.ts           read aloud
  components/                  QuestionView (all 6 types), MapPinInput, ExplanationCard,
                               HeritageQuizCard, QuizNav, UI kit
  pages/                       QuizHome, QuizPlay, QuizResults, DailyChallenge, Review,
                               ChallengePage, HeritageQuiz, Offline, Rewards, Certificate,
                               Leaderboard, Profile, Admin
public/quiz-sw.js              service worker for offline play
server/
  src/app.ts                   Express app (helmet, CORS, rate limit, JSON errors)
  src/middleware/requireUser.ts  identifies the player (bearer token or guest id)
  src/modules/auth/            accounts: register, login, Google, tokens, password hashing
  src/store/                   Store interface + FileStore + MongoStore
  src/modules/quiz/
    bank/                      question bank, one file per category + visual/map + daily pool
    bank/links.ts              question to heritage entry links
    heritage/registry.ts       traditions and sites (name, Hindi, state, location, sample HVS)
    heritage/adapter.ts        ArchiveAdapter: swap in the real archive and HVS data here
    i18n/                      Hindi content for every question + optional translation service
    review.ts                  spaced repetition schedule
    gamification.ts            points, levels, badges (all tuning numbers here)
    present.ts                 shuffling, grading, answer text
    quiz.service.ts            business logic
    quiz.routes.ts             HTTP routes + request validation (zod)
    rewards.catalog.ts         prototype reward catalog
  test/quiz.test.ts            API tests
```

## Integration guide for the team

**Frontend (whoever owns App.tsx).** The quiz adds one line to the router:

```tsx
import { quizRoutes } from "./features/quiz";
// inside the children of the main Layout route:
...quizRoutes,
```

That registers these pages:

- `/quiz`
- `/quiz/play/:sessionId`
- `/quiz/results/:attemptId`
- `/quiz/daily`
- `/quiz/review`
- `/quiz/challenge/:code`
- `/quiz/heritage/:id`
- `/quiz/offline`
- `/quiz/rewards`
- `/quiz/certificate`
- `/quiz/leaderboard`
- `/quiz/profile`
- `/quiz/admin`

The quiz uses the site's existing Tailwind theme colours (parchment, maroon, terracotta, turmeric, heritage) and `lucide-react` icons. It does not add any global styles apart from one fade-in keyframe in `index.css`.

**Archive, map and preserve pages.** Links from quiz answers are built in one place, `ARCHIVE_LINKS` in `src/features/quiz/constants.ts`. Today they point to `/explore/:id`, `/map?focus=:id&lat=..&lng=..` and `/preserve?tradition=:id`. Change them there if your routes differ. To show a quiz on any archive page:

```tsx
import { HeritageQuizCard } from "../features/quiz";
<HeritageQuizCard heritageId="hampi" />   // hides itself if the API is down or there are no questions
```

Heritage ids are listed in `server/src/modules/quiz/heritage/registry.ts`. `GET /api/quiz/heritage?ids=a,b` returns names, locations and HVS for many ids at once.

**Real archive and HVS data.** Call `setArchiveAdapter({ getLinks(ids) { ... } })` (in `heritage/adapter.ts`) once at startup to replace the sample registry values with data from the archive and Vitality modules. Nothing else changes.

**Language.** The header picker is the single control. In your own pages:

```tsx
import { useLang, setLang } from "../lib/language";   // "en" | "hi" | "pa" | "ur"
import { useSiteT } from "../i18n/site";               // add your strings to src/i18n/site.ts
const t = useSiteT();
<h1>{t("mapTitle")}</h1>
```

Code that cannot import it can still switch the language with `window.dispatchEvent(new CustomEvent("dharohar:lang", { detail: "hi" }))`.

**Heritage Map.** `<HeritageMapLayer />` (exported from `src/features/quiz`) can be dropped inside any react-leaflet `MapContainer`. It is already on `/map`, and it understands `?focus=<heritage id>&lat=..&lng=..`.

**Service worker.** `public/quiz-sw.js` only runs in production builds. If the team adds a site-wide PWA worker later, merge its rules and remove `registerQuizServiceWorker()` from `QuizLayout.tsx`.

**Backend (whoever owns the server).** Mount the router on your Express app:

```ts
import { QuizService } from "./modules/quiz/quiz.service";
import { quizRouter } from "./modules/quiz/quiz.routes";
app.use("/api/quiz", quizRouter(new QuizService(store)));
```

All MongoDB collections are prefixed with `quiz_`, so they never clash with other modules in the same database.

**Accounts (for every feature).** Login is site-wide, not quiz-only:

- Any page can read the user: `const { account, status } = useAuth()` from `src/features/auth` (`status` is `loading`, `guest` or `signedIn`).
- Any API call made with `api()` from `src/lib/http.ts` carries the login token automatically (or the guest id when signed out).
- On the server, protect a route with `requireUser`; `req.user.id` is `u:<accountId>` for signed-in users and `g:<uuid>` for guests.
- To move a feature's guest data into an account at sign in, add to the `onSignIn` hook in `server/src/app.ts` (the quiz does exactly this).
- Accounts live in the `accounts` collection (MongoDB) with unique indexes on email and Google id.

**Google sign-in setup.** In Google Cloud Console, create an OAuth client of type "Web application", add your site origin under "Authorized JavaScript origins", and put the client id in the server's `GOOGLE_CLIENT_ID`. The website reads it from `/api/auth/config`; until it is set, the Google button is hidden and email sign-in still works.

**Environment variables.**

| Where | Variable | Purpose |
|---|---|---|
| website | `VITE_API_URL` | API base in production, for example `https://your-api/api` |
| website | `VITE_TTS_URL` | optional AI4Bharat TTS endpoint for read aloud |
| server | `CORS_ORIGINS` | the website's origin |
| server | `MONGODB_URI`, `MONGODB_DB` | use MongoDB instead of the JSON file |
| server | `ADMIN_KEY` | enables `/api/quiz/admin/stats` and the admin page |
| server | `TRANSLATE_URL` | optional translation service for Punjabi and Urdu question content |
| server | `AUTH_SECRET` | signs login tokens; **required in production** (32+ random characters) |
| server | `AUTH_TOKEN_DAYS` | how long a login lasts (default 30) |
| server | `GOOGLE_CLIENT_ID` | enables "Continue with Google" |

## API

Account routes are under `/api/auth`:

| Method | Path | Purpose |
|---|---|---|
| GET | `/config` | Whether Google sign-in is on, password rules |
| POST | `/register` | `{ email, password, displayName }`; moves this browser's guest progress into the new account |
| POST | `/login` | `{ email, password }`; also merges guest progress |
| POST | `/google` | `{ credential }` from Google Identity Services |
| GET / PATCH | `/me` | Account details; change display name |
| POST | `/password` | Change or set password; signs out other devices |
| POST | `/logout-all` | Sign out of every device |

Quiz routes are under `/api/quiz` and need `X-Guest-Id: <uuid>` or `Authorization: Bearer <token>`. Send `X-Lang: hi` (or `?lang=hi`) for Hindi content.

| Method | Path | Purpose |
|---|---|---|
| GET | `/categories` | Categories with question counts |
| POST | `/sessions` | Start a quiz `{ mode?, category?, difficulty?, heritageId?, challengeCode? }`; modes: standard, map, vulnerable, heritage, review, challenge |
| GET | `/sessions/:id/current` | Current question (starts its timer; safe to call after a refresh) |
| POST | `/sessions/:id/answers` | Answer `{ questionId, answer }`; returns correctness, explanation, source, points |
| POST | `/sessions/:id/complete` | Final result, XP, coins, badges |
| GET | `/attempts/:id` | View a past result |
| GET / POST | `/daily`, `/daily/answer` | Problem of the Day |
| GET | `/heritage/:id`, `/heritage?ids=a,b` | Heritage entry info and quiz size |
| POST / GET | `/challenges`, `/challenges/:code` | Create a challenge from a result; view it |
| POST | `/offline/packs`, `/offline/packs/:id/submit` | Download an offline pack; sync its answers |
| GET | `/admin/stats` | Analytics (header `X-Admin-Key`) |
| GET / PATCH | `/me` | Profile, stats, badges; change display name |
| GET | `/leaderboard?scope=overall\|<category>` | Rankings |
| GET / POST | `/rewards`, `/rewards/:id/redeem` | Rewards store |
| GET | `/me/redemptions` | Redeemed codes |
| GET | `/me/history?before=&limit=` | Full account history (quizzes, daily, rewards, offline), newest first |
| GET | `/heritage` | Every heritage entry with questions (used by the map layer) |

**Anti-cheat:**

- Options are shuffled for each player, and only display positions are sent to the browser. The correct answer never leaves the server until the player has answered.
- Historian time limits are enforced on the server, with 3 seconds of grace.
- Each question can be answered once, in order.
- Coins are deducted atomically when a reward is redeemed.
- Offline packs include answers (they must work without a network), so they earn XP only, never coins, and each pack syncs once.

## Scoring

All numbers can be changed in `server/src/modules/quiz/gamification.ts`.

| | Seeker | Historian |
|---|---|---|
| Correct answer | 10 XP | 20 XP |
| Speed bonus | none | 1 XP per 3 seconds left (max 10) |
| Streak bonus | +5 XP per correct answer from the 3rd in a row | same |
| Perfect quiz | +50 XP | +100 XP |
| Coins | 1 coin per 10 XP | same |

Problem of the Day:

- **Correct answer**: 15 XP and 5 coins, plus a streak bonus of 1 coin per streak day (max 7).
- **Wrong answer**: 5 XP and 1 coin. It still keeps the streak alive.

## Adding or editing questions

1. Open the right file in `server/src/modules/quiz/bank/`.
2. Copy an existing question of the same type.
3. Give it a new, unique id (for example `arc-s-22`). Never reuse an old id.
4. Every question must have an explanation and a `source` with an https link to a trustworthy page. Prefer UNESCO, government sites (ASI, GI Registry, Sangeet Natak Akademi) or Britannica.
5. Run `npm --prefix server run check:bank`. It rejects:
   - duplicate ids
   - out-of-range answers
   - missing sources
   - emojis or long dashes

## Notes

- The rewards partners are placeholders. Replace `rewards.catalog.ts` with real offers, or load them from the database, once agreements exist.
- HVS scores in the registry are samples and are labelled as such in the UI.
- Two sources are Wikipedia pages with cited references (Khejarli, Rudrama Devi) because no official page covers those facts. Replace them if the team finds a government or UNESCO source.
- The file store suits development and demos. Use MongoDB for anything with more than one server instance.
