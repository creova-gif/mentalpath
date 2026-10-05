import { generateDek, unwrapDek, wrapDek } from "./note-envelope.ts";

export interface WrappedKeyStore {
  get(practiceId: string): Promise<string | null>;
  insertIfAbsent(practiceId: string, wrappedDek: string, kekId: string): Promise<void>;
}

/**
 * Load the practice DEK, or create and store one if this practice has none.
 * A wrapped key that cannot be opened is an error. It is not replaced.
 * After a raced insert, the stored row wins.
 */
export async function loadOrCreateDek(
  store: WrappedKeyStore,
  practiceId: string,
  kek: Uint8Array,
  kekId: string,
): Promise<Uint8Array> {
  const existing = await store.get(practiceId);
  if (existing) return unwrapDek(existing, kek);

  const dek = generateDek();
  const wrapped = await wrapDek(dek, kek);
  await store.insertIfAbsent(practiceId, wrapped, kekId);

  const stored = await store.get(practiceId);
  if (!stored) throw new Error("Data key unavailable");
  return unwrapDek(stored, kek);
}
