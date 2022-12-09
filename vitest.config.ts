import { vitestTypescriptAssertPlugin } from 'vite-plugin-vitest-typescript-assert';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vitestTypescriptAssertPlugin()],
  test: { coverage: { reporter: ['text', 'lcov'] } },
});
