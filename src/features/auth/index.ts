/**
 * Dharohar accounts (email + password, Google).
 *
 * - Wrap the app in <AuthProvider> (Layout does this) and read login state with useAuth().
 * - Spread `authRoutes` into the main layout's children for /login and /account.
 * - API calls anywhere on the site use src/lib/http.ts, which sends the login token automatically.
 */
import type { RouteObject } from "react-router";
import AccountPage from "./pages/AccountPage";
import AuthPage from "./pages/AuthPage";

export const authRoutes: RouteObject[] = [
  { path: "login", Component: AuthPage },
  { path: "account", Component: AccountPage },
];

export { AuthProvider, useAuth } from "./AuthProvider";
export { default as AccountMenu } from "./components/AccountMenu";
export { authApi } from "./api";
