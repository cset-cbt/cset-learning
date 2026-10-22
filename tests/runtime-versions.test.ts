import { describe, expect, it } from 'vitest';
import packageJson from '../package.json';
import {
  CLANG_WASM_VERSION,
  PYODIDE_VERSION,
  runtimePath,
  TRACEJVM_VERSION
} from '../src/lib/features/exercises/runner/runtime-versions';

describe('runtime versions', () => {
  it('matches the installed package versions', () => {
    expect(PYODIDE_VERSION).toBe(packageJson.devDependencies.pyodide);
    expect(CLANG_WASM_VERSION).toBe(packageJson.devDependencies['@live-codes/clang-wasm']);
    expect(TRACEJVM_VERSION).toBe(packageJson.dependencies['@tracecode/tracejvm']);
  });

  it('returns the stable self-hosted runtime prefix', () => {
    expect(runtimePath('pyodide', PYODIDE_VERSION)).toBe('/runtimes/pyodide/314.0.7/');
    expect(runtimePath('clang', CLANG_WASM_VERSION)).toBe('/runtimes/clang/0.3.0/');
    expect(runtimePath('tracejvm', TRACEJVM_VERSION)).toBe('/runtimes/tracejvm/0.4.1/');
  });
});
