import { build } from 'esbuild';
import { resolve } from 'path';
import { statSync } from 'fs';

const outfile = resolve('api/index.js');  // Output to api/

await build({
  entryPoints: [resolve('src-api/index.ts')],  // Input from src-api/
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  external: [
    '@supabase/supabase-js',
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

const stats = statSync(outfile);
const kb = (stats.size / 1024).toFixed(1);
console.log(`✅ Built server API: ${kb}kb`);
