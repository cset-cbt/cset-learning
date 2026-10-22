export type WorkerMessage = Record<string, unknown> & {
  type: string;
  id?: number;
};

export function isWorkerMessage<Type extends string>(
  value: unknown,
  type: Type,
  id?: number
): value is WorkerMessage & { type: Type } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === type &&
    (!('id' in value) || typeof value.id === 'number') &&
    (id === undefined || ('id' in value && value.id === id))
  );
}
