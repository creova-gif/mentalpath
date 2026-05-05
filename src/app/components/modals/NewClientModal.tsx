import { useState } from 'react';
import { X } from 'lucide-react';

const intakeTemplates = [
  'Standard intake',
  'Newcomer trauma-informed',
  'Racialized stress & identity',
  'LGBTQ2S+ affirming',
  'Couples therapy',
  'Family systems',
  'Grief & loss',
];

export function NewClientModal({ onClose }: { onClose: () => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState('Standard intake');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5" onClick={onClose}>
      <div
        className="bg-[var(--surface)] rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.2)] w-full max-w-[700px] max-h-[90vh] overflow-y-auto animate-[fadeUp_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 pb-4 border-b border-[var(--border)] flex justify-between items-start">
          <div>
            <div className="font-[var(--font-display)] text-xl text-[var(--ink)]">Add new client</div>
            <div className="text-[13px] text-[var(--ink-muted)] mt-1">
              Client record stored on Canadian servers · PHIPA compliant
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-none border-none text-xl cursor-pointer text-[var(--ink-muted)] px-2 py-1 rounded-md transition-all duration-150 hover:bg-[var(--warm)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--ink-soft)]">First name</label>
              <input
                type="text"
                placeholder="First name"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--ink-soft)]">Last name</label>
              <input
                type="text"
                placeholder="Last name"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-email" className="text-[13px] font-medium text-[var(--ink-soft)]">Email</label>
              <input
                id="client-email"
                type="email"
                placeholder="client@example.com"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-phone" className="text-[13px] font-medium text-[var(--ink-soft)]">Phone</label>
              <input
                id="client-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-dob" className="text-[13px] font-medium text-[var(--ink-soft)]">Date of birth</label>
              <input
                id="client-dob"
                type="date"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-pronouns" className="text-[13px] font-medium text-[var(--ink-soft)]">Pronouns</label>
              <select id="client-pronouns" className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]">
                <option>They/Them</option>
                <option>She/Her</option>
                <option>He/Him</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-session-type" className="text-[13px] font-medium text-[var(--ink-soft)]">Session type</label>
              <select id="client-session-type" className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]">
                <option>Individual</option>
                <option>Couples</option>
                <option>Family</option>
                <option>Group</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-rate" className="text-[13px] font-medium text-[var(--ink-soft)]">Rate per session</label>
              <input
                id="client-rate"
                type="number"
                placeholder="140"
                className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
              />
              <div className="text-[11px] text-[var(--ink-muted)]">Leave blank to use default ($140/hr)</div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[13px] font-medium text-[var(--ink-soft)]">Sliding scale?</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 cursor-pointer" />
              <span className="text-sm text-[var(--ink-soft)]">Client is on sliding scale rate</span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="intake-template" className="text-[13px] font-medium text-[var(--ink-soft)]">Intake template</label>
            <select
              id="intake-template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
            >
              {intakeTemplates.map((template) => (
                <option key={template}>{template}</option>
              ))}
            </select>
            <div className="text-[11px] text-[var(--ink-muted)]">
              Culturally-adapted intake forms for specific contexts
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[13px] font-medium text-[var(--ink-soft)]">Cultural context tags (optional)</label>
            <input
              type="text"
              placeholder="e.g., Newcomer, Racialized stress, LGBTQ2S+"
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
            />
            <div className="text-[11px] text-[var(--ink-muted)]">Separate tags with commas</div>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[13px] font-medium text-[var(--ink-soft)]">Referral source</label>
            <input
              type="text"
              placeholder="How did they find you?"
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)]"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-[13px] font-medium text-[var(--ink-soft)]">Intake notes</label>
            <textarea
              placeholder="Initial observations, presenting concerns, goals..."
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-sm outline-none transition-all duration-150 focus:border-[var(--sage)] resize-vertical min-h-[100px] leading-[1.6]"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-[9px] text-sm font-medium cursor-pointer transition-all duration-150 bg-transparent border border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--warm)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-[9px] text-sm font-medium cursor-pointer transition-all duration-150 bg-[var(--sage)] text-white border-none hover:bg-[var(--sage-deep)]"
          >
            Add client
          </button>
        </div>
      </div>
    </div>
  );
}
