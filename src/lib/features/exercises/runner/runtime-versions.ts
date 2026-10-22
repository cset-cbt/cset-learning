export const PYODIDE_VERSION = '314.0.7';
export const CLANG_WASM_VERSION = '0.3.0';
export const TRACEJVM_VERSION = '0.4.1';

export function runtimePath(name: 'pyodide' | 'clang' | 'tracejvm', version: string): string {
  return `/runtimes/${name}/${version}/`;
}
