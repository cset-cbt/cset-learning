export interface SandboxFrame {
  send(message: unknown): void;
  waitFor<T>(predicate: (value: unknown) => value is T, timeoutMs: number): Promise<T | 'timeout'>;
  destroy(): void;
}

interface Waiter {
  predicate: (value: unknown) => boolean;
  finish(value: unknown | 'timeout'): void;
}

interface FrameBootstrap {
  type: 'frame-ready';
  token: string;
  port: MessagePort;
}

function isFrameBootstrap(value: unknown, token: string): value is FrameBootstrap {
  if (typeof value !== 'object' || value === null || !('type' in value) || !('token' in value) || !('port' in value)) {
    return false;
  }
  const port = value.port;
  return (
    value.type === 'frame-ready' &&
    value.token === token &&
    typeof port === 'object' &&
    port !== null &&
    'postMessage' in port &&
    typeof port.postMessage === 'function' &&
    'start' in port &&
    typeof port.start === 'function'
  );
}

function relayDocument(source: string, kind: 'classic' | 'module', token: string): string {
  return `<!doctype html><meta charset="utf-8"><script>
const SOURCE = ${JSON.stringify(source)};
const KIND = ${JSON.stringify(kind)};
const TOKEN = ${JSON.stringify(token)};
const channel = new MessageChannel();
let worker = null;
channel.port1.onmessage = (event) => {
  if (worker) worker.postMessage(event.data);
};
channel.port1.start();
parent.postMessage({ type: 'frame-ready', token: TOKEN, port: channel.port2 }, '*', [channel.port2]);
try {
  worker = new Worker(
    'data:text/javascript;charset=utf-8,' + encodeURIComponent(SOURCE),
    KIND === 'module' ? { type: 'module' } : undefined
  );
  worker.addEventListener('message', (event) => channel.port1.postMessage(event.data));
  worker.addEventListener('error', (event) => channel.port1.postMessage({
    type: 'worker-error', message: event.message || 'Worker failed'
  }));
} catch (error) {
  channel.port1.postMessage({ type: 'worker-error', message: String(error) });
}
</script>`;
}

export function createSandboxFrame(workerSource: string, kind: 'classic' | 'module'): SandboxFrame {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.display = 'none';

  const queued: unknown[] = [];
  const waiters = new Set<Waiter>();
  const token = crypto.randomUUID();
  let destroyed = false;
  let port: MessagePort | null = null;
  const deliver = (message: unknown) => {
    for (const waiter of waiters) {
      if (waiter.predicate(message)) {
        waiter.finish(message);
        return;
      }
    }
    queued.push(message);
  };
  const onBootstrap = (event: MessageEvent<unknown>) => {
    const matchesFrame = event.source === iframe.contentWindow;
    if (!isFrameBootstrap(event.data, token)) return;
    // The token and transferred port authenticate the opaque srcdoc when its WindowProxy is not comparable.
    if (!matchesFrame && event.origin !== 'null') return;
    port = event.data.port;
    window.removeEventListener('message', onBootstrap);
    port.onmessage = (message) => deliver(message.data);
    port.onmessageerror = () => deliver({ type: 'worker-error', message: 'Worker message could not be read.' });
    port.start();
    deliver({ type: 'frame-ready' });
  };
  window.addEventListener('message', onBootstrap);
  iframe.srcdoc = relayDocument(workerSource, kind, token);
  document.body.appendChild(iframe);

  return {
    send(message) {
      if (!destroyed) port?.postMessage(message);
    },
    waitFor<T>(predicate: (value: unknown) => value is T, timeoutMs: number) {
      const message = queued.find(predicate);
      if (message !== undefined) {
        queued.splice(queued.indexOf(message), 1);
        return Promise.resolve(message);
      }
      if (destroyed) return Promise.resolve('timeout');
      const { promise, resolve } = Promise.withResolvers<T | 'timeout'>();
      let timer: ReturnType<typeof setTimeout>;
      const waiter: Waiter = {
        predicate,
        finish(value) {
          clearTimeout(timer);
          waiters.delete(waiter);
          resolve(value === 'timeout' ? value : predicate(value) ? value : 'timeout');
        }
      };
      timer = setTimeout(() => waiter.finish('timeout'), timeoutMs);
      waiters.add(waiter);
      return promise;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      iframe.remove();
      window.removeEventListener('message', onBootstrap);
      port?.close();
      port = null;
      for (const waiter of waiters) waiter.finish('timeout');
      queued.length = 0;
    }
  };
}
