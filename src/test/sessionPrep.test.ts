import { describe, expect, it } from 'vitest';
import { buildPrepCards } from '@/app/services/sessionPrep';
import type { Appointment } from '@/app/services/practice';
import type { OutcomeMeasure } from '@/app/services/outcomes';

const appt = (id: string, clientId: string, status: Appointment['status'] = 'scheduled'): Appointment => ({
  id, clientId, clientName: clientId, scheduledAt: '2026-09-26T14:00:00Z', durationMinutes: 50, sessionType: 'video', status, noteId: null,
});
const measure = (clientId: string, instrument: OutcomeMeasure['instrument'], total: number, date: string, riskFlag = false): OutcomeMeasure => ({
  id: `${clientId}-${instrument}-${date}`, clientId, instrument, administeredOn: date, itemScores: [], total, severity: 'mild', riskFlag,
});

describe('buildPrepCards', () => {
  it('summarises history per client without mixing clients', () => {
    const cards = buildPrepCards(
      [appt('a1', 'c1'), appt('a2', 'c2'), appt('a3', 'c1', 'cancelled')],
      [
        { id: 'n1', clientId: 'c1', sessionDate: '2026-09-01', isLocked: true },
        { id: 'n2', clientId: 'c1', sessionDate: '2026-09-15', isLocked: false },
        { id: 'n3', clientId: 'c2', sessionDate: '2026-09-10', isLocked: true },
      ],
      [measure('c1', 'PHQ-9', 16, '2026-09-01'), measure('c1', 'PHQ-9', 9, '2026-09-15', true), measure('c2', 'GAD-7', 7, '2026-09-10')],
      [{ clientId: 'c1', amount: 150, status: 'pending' }, { clientId: 'c1', amount: 150, status: 'paid' }, { clientId: 'c2', amount: 120, status: 'overdue' }],
    );
    expect(cards.map(c => c.appointment.id)).toEqual(['a1', 'a2']);
    const [c1, c2] = cards;
    expect(c1.sessionNumber).toBe(3);
    expect(c1.lastSession?.id).toBe('n2');
    expect(c1.unsignedNotes).toBe(1);
    expect(c1.latest).toHaveLength(1);
    expect(c1.latest[0]).toMatchObject({ change: 'improved', delta: -7 });
    expect(c1.latest[0].measure.riskFlag).toBe(true);
    expect(c1.outstanding).toEqual({ count: 1, amount: 150 });
    expect(c2.latest[0]).toMatchObject({ change: null, delta: null });
    expect(c2.outstanding).toEqual({ count: 1, amount: 120 });
  });
});
