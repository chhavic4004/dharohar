/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the DHAROHAR chatbot backend, e.g. http://localhost:3001 */
  readonly VITE_CHAT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
