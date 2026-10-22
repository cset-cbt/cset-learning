export function pythonWorkerSource(baseUrl: string): string {
  return `
const BASE = ${JSON.stringify(baseUrl)};
let py;
const MAX = 1048576;
self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      const { loadPyodide } = await import(BASE + 'pyodide.mjs');
      py = await loadPyodide({ indexURL: BASE });
      self.postMessage({ type: 'ready' });
    } catch (e) { self.postMessage({ type: 'boot-error', error: String((e && e.message) || e) }); }
    return;
  }
  if (data.type !== 'run') return;
  const out = [], err = [];
  let outSize = 0, errSize = 0, sent = false;
  const bytes = new TextEncoder().encode(data.stdin);
  py.setStdin({ stdin: () => (sent ? null : ((sent = true), bytes)) });
  py.setStdout({ write: (b) => { if (outSize < MAX) { out.push(b.slice()); outSize += b.length; } return b.length; } });
  py.setStderr({ write: (b) => { if (errSize < MAX) { err.push(b.slice()); errSize += b.length; } return b.length; } });
  const globals = py.runPython("dict(__name__='__main__')");
  let exitCode = 0, errorText = null;
  try {
    await py.runPythonAsync(data.code, { globals, filename: 'main.py' });
  } catch (e) {
    const message = String((e && e.message) || e);
    if (e && e.type === 'SystemExit') {
      const arg = ((/SystemExit:\\s*(.*)\\s*$/.exec(message) || [])[1] || '').trim();
      exitCode = arg === '' || arg === 'None' ? 0 : /^-?\\d+$/.test(arg) ? Number(arg) : 1;
      if (exitCode === 1 && arg !== '1') err.push(new TextEncoder().encode(arg + '\\n'));
    } else { exitCode = 1; errorText = message; }
  } finally { globals.destroy(); }
  try { py.runPython('import sys\\nsys.stdout.flush()\\nsys.stderr.flush()'); } catch (e) { /* best effort */ }
  const dec = new TextDecoder();
  const join = (parts) => parts.map((p) => dec.decode(p, { stream: true })).join('');
  self.postMessage({ type: 'result', id: data.id, stdout: join(out), stderr: join(err), exitCode, errorText });
};
`;
}
