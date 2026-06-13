export type OfflineQueueEvent = {
  entity: string;
  operation: string;
};

type Listener = (event: OfflineQueueEvent) => void;

const listeners = new Set<Listener>();

export function onOfflineQueued(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitOfflineQueued(event: OfflineQueueEvent): void {
  listeners.forEach((listener) => {
    listener(event);
  });
}

export type MutationDroppedEvent = {
  entity: string;
  operation: string;
};

type DroppedListener = (event: MutationDroppedEvent) => void;

const droppedListeners = new Set<DroppedListener>();

export function onMutationDropped(listener: DroppedListener): () => void {
  droppedListeners.add(listener);
  return () => droppedListeners.delete(listener);
}

export function emitMutationDropped(event: MutationDroppedEvent): void {
  droppedListeners.forEach((listener) => {
    listener(event);
  });
}
