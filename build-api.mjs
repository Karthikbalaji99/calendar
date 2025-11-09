import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    'crypto',
    'path',
    'fs',
    'http',
    'url',
  ],
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
}).catch(() => process.exit(1));

console.log('✅ API bundled successfully');
