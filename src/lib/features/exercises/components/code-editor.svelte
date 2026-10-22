<script lang="ts">
  import { onMount } from 'svelte';
  import { FormMessage, Skeleton } from 'cset-ui';
  import type { Compartment, Extension } from '@codemirror/state';
  import type { EditorView } from '@codemirror/view';
  import { t } from '$lib/core/i18n';
  import type { ExerciseLanguage } from '../shared/languages';

  interface Props {
    value?: string;
    language: ExerciseLanguage;
    readonly?: boolean;
    label: string;
    onrun?: () => void;
  }

  let { value = $bindable(''), language, readonly = false, label, onrun }: Props = $props();
  let host: HTMLDivElement;
  let editorView: EditorView | null = null;
  let languageCompartment: Compartment | null = null;
  let readonlyCompartment: Compartment | null = null;
  let languageExtensions: Record<ExerciseLanguage, Extension> | null = null;
  let editorStateModule: typeof import('@codemirror/state') | null = null;
  let configuredLanguage: ExerciseLanguage | null = null;
  let configuredReadonly: boolean | null = null;
  let ready = $state(false);
  let failed = $state(false);

  onMount(() => {
    let active = true;
    void mountEditor()
      .then((view) => {
        if (!active) {
          view.destroy();
          return;
        }
        editorView = view;
        ready = true;
      })
      .catch(() => {
        if (active) failed = true;
      });
    return () => {
      active = false;
      editorView?.destroy();
      editorView = null;
    };
  });

  async function mountEditor(): Promise<EditorView> {
    const [state, viewModule, codeMirror, python, cpp, java] = await Promise.all([
      import('@codemirror/state'),
      import('@codemirror/view'),
      import('codemirror'),
      import('@codemirror/lang-python'),
      import('@codemirror/lang-cpp'),
      import('@codemirror/lang-java')
    ]);
    editorStateModule = state;
    languageCompartment = new state.Compartment();
    readonlyCompartment = new state.Compartment();
    languageExtensions = { python: python.python(), cpp: cpp.cpp(), java: java.java() };
    configuredLanguage = language;
    configuredReadonly = readonly;
    const stateValue = state.EditorState.create({
      doc: value,
      extensions: [
        codeMirror.basicSetup,
        languageCompartment.of(languageExtensions[language]),
        readonlyCompartment.of(state.EditorState.readOnly.of(readonly)),
        viewModule.EditorView.contentAttributes.of({ 'aria-label': label }),
        viewModule.EditorView.updateListener.of((update) => {
          if (update.docChanged) value = update.state.doc.toString();
        }),
        viewModule.keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onrun?.();
              return true;
            }
          }
        ]),
        viewModule.EditorView.theme({
          '&': {
            color: 'var(--ui-ink)',
            backgroundColor: 'var(--ui-surface)',
            fontSize: '0.85rem'
          },
          '.cm-content': { fontFamily: 'var(--font-mono)' },
          '.cm-scroller': { fontFamily: 'var(--font-mono)' },
          '.cm-gutters': {
            color: 'var(--ui-ink)',
            backgroundColor: 'var(--ui-surface)',
            borderRight: '1px solid var(--ui-border)'
          },
          '.cm-cursor': { borderLeftColor: 'var(--ui-accent)' },
          '&.cm-focused': { outline: 'none' }
        })
      ]
    });
    return new viewModule.EditorView({ state: stateValue, parent: host });
  }

  $effect(() => {
    const view = editorView;
    const state = editorStateModule;
    if (!view || !state || !languageCompartment || !readonlyCompartment || !languageExtensions) return;
    if (configuredLanguage !== language) {
      view.dispatch({ effects: languageCompartment.reconfigure(languageExtensions[language]) });
      configuredLanguage = language;
    }
    if (configuredReadonly !== readonly) {
      view.dispatch({ effects: readonlyCompartment.reconfigure(state.EditorState.readOnly.of(readonly)) });
      configuredReadonly = readonly;
    }
    if (view.state.doc.toString() !== value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  });
</script>

<div class="space-y-2">
  <div class="relative">
    <div bind:this={host} class="code-surface min-h-[20rem] overflow-hidden rounded-sm"></div>
    {#if !ready && !failed}
      <div class="pointer-events-none absolute inset-0 bg-surface p-3">
        <Skeleton variant="text" lines={8} />
      </div>
    {/if}
  </div>
  <p class="text-xs text-ink-muted">{$t('exercise.editor.help')}</p>
  {#if failed}
    <FormMessage variant="error">{$t('exercise.error.editorUnavailable')}</FormMessage>
  {/if}
</div>
