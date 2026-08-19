import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
mkdirSync(join(root, 'lib', 'types', 'client'), { recursive: true })
writeFileSync(join(root, 'lib', 'index.js'), readFileSync(join(root, 'src', 'host.js'), 'utf8'))
writeFileSync(join(root, 'lib', 'core.js'), readFileSync(join(root, 'src', 'core.js'), 'utf8'))
const client = readFileSync(join(root, 'src', 'client.js'), 'utf8')
writeFileSync(join(root, 'lib', 'client.js'), `window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory: (require) => {
    const module = { exports: {} }; const exports = module.exports;
    const React = require('react');
${client}
    exports.apply = apply; exports.inject = inject; return module.exports;
  }
});\n`)
writeFileSync(join(root, 'lib', 'types', 'index.d.ts'), "export declare const name: string\nexport declare const inject: string[]\nexport declare function apply(ctx: import('@deepseek-ai/cordis').Context): void\n")
writeFileSync(join(root, 'lib', 'types', 'client', 'index.d.ts'), "export declare const inject: string[]\nexport declare function apply(ctx: unknown): void\n")
console.log(`built ${pkg.name}`)
