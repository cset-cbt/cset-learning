// cset-ui form controls forward unknown props to the native element, so their event handlers are
// not contextually typed. This reads the current value of the event target safely.
export function eventValue(event: Event): string {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return target.value;
  }
  return '';
}
