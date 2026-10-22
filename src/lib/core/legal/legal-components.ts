export interface LegalComponent {
  name: string;
  license: string;
  sourceUrl: string;
}

// Every third-party component that is redistributed to the browser. Keep this list in sync with
// the runtimes copied by scripts/prepare-runtimes.ts and with package.json.
export const LEGAL_COMPONENTS: LegalComponent[] = [
  {
    name: 'Pyodide 314.0.7',
    license: 'MPL-2.0',
    sourceUrl: 'https://github.com/pyodide/pyodide'
  },
  {
    name: 'CPython standard library (bundled with Pyodide)',
    license: 'PSF License Version 2',
    sourceUrl: 'https://docs.python.org/3/license.html'
  },
  {
    name: 'clang-wasm 0.3.0 (LLVM Clang, LLD and wasi-libc compiled to WebAssembly)',
    license: 'MIT; LLVM components Apache-2.0 with LLVM exception',
    sourceUrl: 'https://www.npmjs.com/package/@live-codes/clang-wasm'
  },
  {
    name: 'TraceJVM 0.4.1',
    license: 'AGPL-3.0-only',
    sourceUrl: 'https://github.com/tracecodeapp/tracejvm'
  },
  {
    name: 'OpenJDK 23 runtime image (inside TraceJVM)',
    license: 'GPL-2.0 with Classpath Exception',
    sourceUrl: 'https://github.com/tracecodeapp/tracejvm/blob/main/legal/CORRESPONDING_SOURCE.md'
  },
  {
    name: 'TeaVM-javac (inside TraceJVM)',
    license: 'Apache-2.0',
    sourceUrl: 'https://github.com/konsoletyper/teavm-javac'
  },
  {
    name: 'b-jvm (inside TraceJVM)',
    license: 'MIT',
    sourceUrl: 'https://github.com/anematode/b-jvm'
  },
  { name: 'KaTeX', license: 'MIT', sourceUrl: 'https://github.com/KaTeX/KaTeX' },
  { name: 'highlight.js', license: 'BSD-3-Clause', sourceUrl: 'https://github.com/highlightjs/highlight.js' },
  { name: 'markdown-it', license: 'MIT', sourceUrl: 'https://github.com/markdown-it/markdown-it' },
  { name: 'CodeMirror', license: 'MIT', sourceUrl: 'https://github.com/codemirror/dev' },
  { name: 'DOMPurify', license: 'MPL-2.0 or Apache-2.0', sourceUrl: 'https://github.com/cure53/DOMPurify' },
  { name: 'cset-ui', license: 'CSET club design system', sourceUrl: 'https://github.com/cset-cbt/cset-ui' }
];
