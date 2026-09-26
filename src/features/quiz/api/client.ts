/**
 * The quiz uses the site-wide client in src/lib/http.ts. Re-exported here so
 * existing quiz imports keep working.
 */
export { api, ApiRequestError, getGuestId, setAuthToken, setRequestLang } from "../../../lib/http";
