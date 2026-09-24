import { beforeEach, describe, expect, it, vi } from 'vitest';

const capture = vi.fn();
vi.mock('posthog-js', () => ({ default: { init: vi.fn(), capture, identify: vi.fn(), reset: vi.fn() } }));
vi.mock('@sentry/react', () => ({ init: vi.fn(), browserTracingIntegration: vi.fn(), captureException: vi.fn() }));

describe('telemetry', () => {
  beforeEach(() => { capture.mockClear(); vi.resetModules(); });

  it('scrubUrl removes IDs and query strings', async () => {
    const { scrubUrl } = await import('@/app/lib/telemetry');
    expect(scrubUrl('https://app.example.ca/dashboard/clients/3f2a9c1e-1111-4111-8111-111111111111?tab=notes'))
      .toBe('https://app.example.ca/dashboard/clients/:id');
    expect(scrubUrl('https://app.example.ca/session-note-editor?noteId=abc&clientId=def'))
      .toBe('https://app.example.ca/session-note-editor');
  });

  it('track() is a no-op without a PostHog key', async () => {
    const { initTelemetry, track } = await import('@/app/lib/telemetry');
    await initTelemetry();
    track('note_locked', { note_format: 'dap' });
    expect(capture).not.toHaveBeenCalled();
  });

  it('track() drops properties that are not allow-listed', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
    const { initTelemetry, track } = await import('@/app/lib/telemetry');
    await initTelemetry();
    // client_name is deliberately not an allowed property for this event
    track('note_locked', { note_format: 'dap', ai_used: true, client_name: 'Sam Rivera' });
    expect(capture).toHaveBeenCalledWith('note_locked', { note_format: 'dap', ai_used: true });
    vi.unstubAllEnvs();
  });
});
