import { cp, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { extractTraceJVMRuntimeArchive } from '@tracecode/tracejvm/runtime-package';
import { CLANG_WASM_VERSION, PYODIDE_VERSION, TRACEJVM_VERSION } from '../src/lib/features/exercises/runner/runtime-versions.ts';

interface RuntimeFile {
  path: string;
  size: number;
  sha256: string;
}

interface RuntimeManifest {
  archive: { path: string };
  files: RuntimeFile[];
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runtimes = join(root, 'static', 'runtimes');
const headersPath = join(root, '_headers');
const readyMarker = '.ready';

async function isReady(target: string): Promise<boolean> {
  try {
    await readFile(join(target, readyMarker));
    return true;
  } catch {
    return false;
  }
}

async function resetTarget(target: string): Promise<void> {
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
}

async function copyRuntimeFiles(source: string, target: string, names: string[]): Promise<void> {
  for (const name of names) await copyFile(join(source, name), join(target, name));
}

async function assertWorkerPolicy(release: Record<string, unknown>): Promise<void> {
  const policyValue = release.responsePolicy;
  if (typeof policyValue !== 'object' || policyValue === null) {
    throw new Error('TraceJVM release.json has no responsePolicy object.');
  }
  const policy = policyValue as Record<string, unknown>;
  const workerValue = policy.worker;
  if (typeof workerValue !== 'object' || workerValue === null) {
    throw new Error('TraceJVM release.json has no responsePolicy.worker object.');
  }
  const worker = workerValue as Record<string, unknown>;
  const checks = [
    { name: 'Access-Control-Allow-Origin', expected: '*', actual: policy.accessControlAllowOrigin },
    { name: 'Cross-Origin-Resource-Policy', expected: 'cross-origin', actual: policy.crossOriginResourcePolicy },
    { name: 'X-Content-Type-Options', expected: 'nosniff', actual: policy.xContentTypeOptions },
    { name: 'Cross-Origin-Embedder-Policy', expected: 'require-corp', actual: worker.crossOriginEmbedderPolicy },
    {
      name: 'Content-Security-Policy',
      expected: "default-src 'none'; script-src 'self'; connect-src 'self'",
      actual: worker.contentSecurityPolicy
    }
  ];
  const headerText = await readFile(headersPath, 'utf8');
  for (const { name, expected, actual } of checks) {
    if (actual !== expected) {
      throw new Error(`TraceJVM response policy ${name} differs from _headers: expected ${expected}, received ${String(actual)}.`);
    }
    if (!headerText.includes(`${name}: ${expected}`)) {
      throw new Error(`_headers does not contain the required TraceJVM ${name} value.`);
    }
  }
}

async function preparePyodide(): Promise<void> {
  const target = join(runtimes, 'pyodide', PYODIDE_VERSION);
  if (await isReady(target)) return;
  const source = join(root, 'node_modules', 'pyodide');
  await resetTarget(target);
  await copyRuntimeFiles(source, target, [
    'pyodide.mjs',
    'pyodide.asm.mjs',
    'pyodide.asm.wasm',
    'pyodide-lock.json',
    'python_stdlib.zip'
  ]);
  await writeFile(join(target, readyMarker), 'ready\n');
}

async function prepareClang(): Promise<void> {
  const target = join(runtimes, 'clang', CLANG_WASM_VERSION);
  if (await isReady(target)) return;
  const source = join(root, 'node_modules', '@live-codes', 'clang-wasm');
  await resetTarget(target);
  await copyFile(join(source, 'dist', 'clang-wasm-toolchain.global.js'), join(target, 'clang-wasm-toolchain.global.js'));
  await cp(join(source, 'assets'), join(target, 'assets'), {
    recursive: true,
    filter: (path) => !path.startsWith(join(source, 'assets', 'objective-c'))
  });
  await copyFile(join(source, 'THIRD-PARTY-NOTICES.md'), join(target, 'THIRD-PARTY-NOTICES.md'));
  await writeFile(join(target, readyMarker), 'ready\n');
}

function isAllowedTraceFile(path: string): boolean {
  return (
    path === 'bjvm_main.wasm' ||
    path === 'browser-worker.js' ||
    path === 'release.json' ||
    path.startsWith('compiler/') ||
    path.startsWith('profiles/core/') ||
    path.startsWith('legal/')
  );
}

async function prepareTraceJVM(): Promise<void> {
  const target = join(runtimes, 'tracejvm', TRACEJVM_VERSION);
  if (await isReady(target)) return;
  const packagePath = join(root, 'node_modules', '@tracecode', 'tracejvm');
  const manifestPath = join(packagePath, 'runtime-release', 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as RuntimeManifest;
  const files = manifest.files.filter((file) => isAllowedTraceFile(file.path));
  if (!files.some((file) => file.path === 'browser-worker.js') || !files.some((file) => file.path === 'release.json')) {
    throw new Error('TraceJVM manifest is missing the browser worker or release descriptor.');
  }
  const extractionRoot = await mkdtemp(join(tmpdir(), 'cset-learning-tracejvm-'));
  await resetTarget(target);
  try {
    await extractTraceJVMRuntimeArchive({
      archivePath: join(packagePath, 'runtime-release', manifest.archive.path),
      destination: extractionRoot,
      files: manifest.files
    });
    for (const file of files) {
      const source = join(extractionRoot, file.path);
      const destination = join(target, file.path);
      await mkdir(dirname(destination), { recursive: true });
      await copyFile(source, destination);
    }
    const release = JSON.parse(await readFile(join(target, 'release.json'), 'utf8')) as Record<string, unknown>;
    await assertWorkerPolicy(release);
    await copyFile(manifestPath, join(root, 'src', 'lib', 'features', 'exercises', 'runner', 'tracejvm-runtime-manifest.json'));
    await writeFile(join(target, readyMarker), 'ready\n');
  } finally {
    await rm(extractionRoot, { recursive: true, force: true });
  }
}

await mkdir(runtimes, { recursive: true });
await preparePyodide();
await prepareClang();
await prepareTraceJVM();
console.log('Exercise runtime assets are ready.');
