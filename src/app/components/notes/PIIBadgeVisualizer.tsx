import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { scrubPII, type PIIEntity } from '../../utils/piiScrubber';

interface PIIBadgeVisualizerProps {
  textToScrub: string;
  clientName?: string;
  format?: string;
}

export const PIIBadgeVisualizer: React.FC<PIIBadgeVisualizerProps> = ({
  textToScrub,
  clientName,
  format = 'DAP',
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const result = scrubPII(textToScrub, clientName);
  const entityCount = result.detectedEntities.length;

  if (!textToScrub.trim()) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/70 border border-emerald-200/60 rounded-lg text-xs text-emerald-800 transition-all mb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong className="font-semibold text-emerald-900">PHIPA Pre-Flight Guard:</strong> Real-time Canadian health privacy filter active. No PII is ever transmitted to AI.
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          🍁 Ontario PHIPA Safe
        </span>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-lg border transition-all text-xs bg-white shadow-sm overflow-hidden">
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 ${
          result.hasRedactions
            ? 'bg-amber-50/80 border-b border-amber-200 text-amber-900'
            : 'bg-emerald-50/80 border-b border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          {result.hasRedactions ? (
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          )}
          <div>
            {result.hasRedactions ? (
              <span>
                <strong className="font-semibold">PHIPA Guard Active:</strong>{' '}
                {entityCount} identifier{entityCount > 1 ? 's' : ''} detected & auto-sanitized for AI.
              </span>
            ) : (
              <span>
                <strong className="font-semibold">PHIPA Guard Clean:</strong> Zero client PII detected. Payload is clean for Canadian cloud assist.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/80 border border-slate-200 text-slate-700">
            <Lock className="w-3 h-3 mr-1 text-slate-500" /> ca-central-1
          </span>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 font-medium text-slate-700 transition-colors shadow-2xs"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-500" /> Hide AI Payload
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> Preview AI Payload
              </>
            )}
          </button>
        </div>
      </div>

      {result.hasRedactions && (
        <div className="px-3.5 py-2 bg-amber-50/30 flex flex-wrap gap-1.5 items-center border-b border-amber-100">
          <span className="text-[11px] font-medium text-amber-800 mr-1">Sanitized tokens:</span>
          {result.detectedEntities.map((ent, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-100/80 text-amber-900 border border-amber-200"
              title={`Original: "${ent.original}"`}
            >
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
              {ent.label}: <span className="ml-1 text-slate-600">{ent.replacement}</span>
            </span>
          ))}
        </div>
      )}

      {showPreview && (
        <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48 border-t border-slate-800">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
            <span>Payload Dispatched to Claude (Anthropic PHIPA Safe)</span>
            <span>Format: {format}</span>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400">
            {result.scrubbedText || '// Empty payload'}
          </pre>
        </div>
      )}
    </div>
  );
};
