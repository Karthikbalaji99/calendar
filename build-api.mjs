import { build } from 'esbuild';
import { resolve } from 'path';
import { statSync } from 'fs';

await build({
  entryPoints: ['api/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'api/index.js',
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

const stats = statSync('api/index.js');
const kb = (stats.size / 1024).toFixed(1);
console.log(`✅ ${kb}kb`);

if (stats.size < 100000) {
  console.warn(`⚠️  Small bundle (${kb}kb) - verify server code is included`);
}
