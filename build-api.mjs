import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

await build({
  entryPoints: ['api/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: 'api/index.js',
  packages: 'external',
  mainFields: ['module', 'main'],
  conditions: ['import', 'module', 'node'],
  resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  alias: {
    '@shared': resolve(__dirname, 'shared'),
  },
  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`,
  },
  minify: false,
  sourcemap: false,
  treeShaking: true,
  logLevel: 'info',
}).catch((e) => {
  console.error('Build failed:', e);
  process.exit(1);
});

console.log('✅ API bundled successfully');
