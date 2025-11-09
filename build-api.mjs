import { build } from 'esbuild';
import { resolve } from 'path';
import { statSync } from 'fs';

await build({
  entryPoints: [resolve('api/index.ts')],     // ✅ still the same serverless entry
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: resolve('dist/index.js'),          // ✅ output to dist for Vercel
  external: [
    '@supabase/supabase-js',
    'multer',
    'express',
    'cookie-parser',
    'serverless-http',
  ],
  alias: {
    '@shared': resolve(process.cwd(), 'shared'),
  },
  banner: {
    js: `import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);`,
  },
}).catch((e) => {
  console.error('Build failed:', e.message);
  process.exit(1);
});

const stats = statSync('dist/index.js');       // ✅ updated to match output path
const kb = (stats.size / 1024).toFixed(1);
console.log(`✅ ${kb}kb`);

if (stats.size < 100000) {
  console.warn(`⚠️  Small bundle (${kb}kb) - verify server code is included`);
}
