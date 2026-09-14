import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

function offlineBuild() {
  let outDir
  return {
    name: 'offline-build',
    apply: 'build',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir) },
    async writeBundle(_options, bundle) {
      const assets = ['./', './index.html', './favicon.svg', './manifest.json', './theme-init.js',
        ...Object.keys(bundle).filter(name => name !== 'index.html').map(name => `./${name}`)]
      const contents = await Promise.all(assets.filter(path => path !== './').map(path => readFile(resolve(outDir, path))))
      const template = await readFile(resolve(outDir, 'sw.js'), 'utf8')
      const version = createHash('sha256').update(JSON.stringify(assets) + template)
      contents.forEach(content => version.update(content))
      const versionId = version.digest('hex').slice(0, 16)
      await writeFile(resolve(outDir, 'sw.js'), template.replace('__BUILD_VERSION__', versionId)
        .replace(/\/\* BUILD_ASSETS \*\/ \[[^;]+\]/, JSON.stringify(assets)))
    }
  }
}

export default defineConfig({
  plugins: [react(), offlineBuild(), {
    name: 'development-csp',
    apply: 'serve',
    transformIndexHtml(html) {
      // Vite React Fast Refresh injects an inline development preamble.
      return html.replace(/<meta http-equiv="Content-Security-Policy"[^>]+>/, '')
    }
  }],
  server: { port: 5174, open: false }
})
