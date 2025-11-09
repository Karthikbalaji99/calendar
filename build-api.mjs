import { build } from 'esbuild';
import { resolve } from 'path';
import { statSync } from 'fs';

const outfile = resolve('api/index.js');  // ✅ the bundled function goes in api/

await build({
  entryPoints: [resolve('api/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,   // ✅ output inside api folder
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
  console.error('Build failed:', e);
  process.exit(1);
});

const stats = statSync(outfile);  // ✅ check the correct file
const kb = (stats.size / 1024).toFixed(1);
console.log(`✅ Built server API: ${kb}kb`);
