// Browser-only Markdown pipeline: markdown-it (raw HTML escaped) + highlight.js + KaTeX, with the
// final HTML sanitized by DOMPurify. It is loaded lazily so the server and the first paint stay
// small (Workers Free allows only 10 ms CPU per request, so nothing here may run server-side).
type Renderer = (source: string) => string;

const HIGHLIGHT_LANGUAGES = [
  ['python', () => import('highlight.js/lib/languages/python')],
  ['cpp', () => import('highlight.js/lib/languages/cpp')],
  ['java', () => import('highlight.js/lib/languages/java')],
  ['javascript', () => import('highlight.js/lib/languages/javascript')],
  ['typescript', () => import('highlight.js/lib/languages/typescript')],
  ['bash', () => import('highlight.js/lib/languages/bash')],
  ['json', () => import('highlight.js/lib/languages/json')],
  ['sql', () => import('highlight.js/lib/languages/sql')],
  ['xml', () => import('highlight.js/lib/languages/xml')],
  ['css', () => import('highlight.js/lib/languages/css')],
  ['markdown', () => import('highlight.js/lib/languages/markdown')],
  ['plaintext', () => import('highlight.js/lib/languages/plaintext')]
] as const;

let rendererPromise: Promise<Renderer> | undefined;

async function buildRenderer(): Promise<Renderer> {
  const [{ default: MarkdownIt }, { default: hljs }, { katex }, { default: DOMPurify }] =
    await Promise.all([
      import('markdown-it'),
      import('highlight.js/lib/core'),
      import('@mdit/plugin-katex'),
      import('dompurify')
    ]);

  const languages = await Promise.all(
    HIGHLIGHT_LANGUAGES.map(async ([name, load]) => [name, (await load()).default] as const)
  );
  for (const [name, definition] of languages) hljs.registerLanguage(name, definition);

  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: false,
    highlight(code, lang) {
      if (!lang || !hljs.getLanguage(lang)) return '';
      const highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
      return `<pre class="hljs"><code>${highlighted}</code></pre>`;
    }
  });
  md.use(katex, { throwOnError: false, strict: 'ignore' });

  // Absolute links leave the site: open them in a new tab without giving the target a handle.
  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (/^https?:\/\//i.test(String(token.attrGet('href') ?? ''))) {
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return (source) =>
    DOMPurify.sanitize(md.render(source), {
      USE_PROFILES: { html: true, mathMl: true, svg: true },
      ADD_ATTR: ['target']
    });
}

export function renderMarkdown(source: string): Promise<string> {
  rendererPromise ??= buildRenderer();
  return rendererPromise.then((render) => render(source));
}
