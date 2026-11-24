import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const outDirArgIdx = process.argv.indexOf('--outDir');
          const outDirName =
            outDirArgIdx !== -1 && process.argv[outDirArgIdx + 1]
              ? process.argv[outDirArgIdx + 1]
              : 'dist';
          const outDir = path.resolve(__dirname, outDirName);
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const outAssets = path.resolve(outDir, 'src/assets');
          if (fs.existsSync(outDir)) {
            fs.writeFileSync(path.join(outDir, '.nojekyll'), '# Disable Jekyll\n');
            if (fs.existsSync(srcAssets)) {
              fs.cpSync(srcAssets, outAssets, {recursive: true, force: true});
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
