import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Password hashing (scrypt) is deliberately slow; give busy machines room.
    testTimeout: 20000,
  },
});
