export function cppWorkerSource(baseUrl: string): string {
  return `
const BASE = ${JSON.stringify(baseUrl)};
let tc, tools, artifact = null;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      importScripts(BASE + 'clang-wasm-toolchain.global.js');
      tools = self.clangWasmToolchain;
      tc = await tools.createToolchain({ baseUrl: BASE + 'assets/' });
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'compile') {
      const built = await tc.lock(() => tc.captureCompilerOutput(() =>
        tc.runtime.compileArtifact(data.code, {
          language: 'CPP',
          fileName: 'main.cpp',
          cppVersion: 'gnu++20',
          maxWasmMemoryBytes: 268435456
        })
      ));
      artifact = built.result || null;
      const ok = Boolean(artifact) && !built.error;
      self.postMessage({ type: 'compiled', id: data.id, ok, diagnostics: ok ? [] : tools.compilerDiagnostics(built.raw) });
    } else if (data.type === 'exec') {
      let sent = false;
      try {
        const r = await tc.execute(artifact, { stdin: () => (sent ? null : ((sent = true), data.stdin)) });
        self.postMessage({ type: 'executed', id: data.id, stdout: r.stdout, stderr: r.stderr, exitCode: r.exitCode, thrown: null });
      } catch (e) {
        self.postMessage({ type: 'executed', id: data.id, stdout: '', stderr: '', exitCode: null, thrown: String((e && e.message) || e) });
      }
    }
  } catch (e) { self.postMessage({ type: 'boot-error', id: data.id, error: String((e && e.message) || e) }); }
};
`;
}
