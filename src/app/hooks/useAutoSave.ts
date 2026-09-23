import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  /** Debounce before saving after the last change (ms). */
  delay?: number;
  enabled?: boolean;
}

// Debounced server autosave. Clinical content is deliberately NOT mirrored to
// localStorage/sessionStorage (plaintext PHI at rest on shared devices); instead
// unsaved changes block tab close via beforeunload until the save succeeds.
export function useAutoSave<T>({ data, onSave, delay = 3000, enabled = true }: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const lastSaved = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const saving = useRef<Promise<void> | null>(null);
  const latest = useRef({ data, onSave });
  latest.current = { data, onSave };

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const snapshot = JSON.stringify(latest.current.data);
    if (snapshot === lastSaved.current) return;
    if (saving.current) await saving.current;
    setStatus('saving');
    const run = latest.current.onSave(latest.current.data)
      .then(() => {
        lastSaved.current = snapshot;
        setStatus(JSON.stringify(latest.current.data) === snapshot ? 'saved' : 'unsaved');
      })
      .catch(() => setStatus('error'))
      .finally(() => { saving.current = null; });
    saving.current = run;
    await run;
  }, []);

  /** Marks the current data as already persisted (e.g. after loading a note). */
  const markSaved = useCallback((value: T) => {
    lastSaved.current = JSON.stringify(value);
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const snapshot = JSON.stringify(data);
    if (lastSaved.current === null) {
      // First render: treat initial state as the baseline.
      lastSaved.current = snapshot;
      return;
    }
    if (snapshot === lastSaved.current) return;
    setStatus('unsaved');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [data, delay, enabled, flush]);

  const dirty = status === 'unsaved' || status === 'saving' || status === 'error';
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  return { status, flush, markSaved, dirty };
}
