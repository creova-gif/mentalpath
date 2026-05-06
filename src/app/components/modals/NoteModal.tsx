import { useState } from 'react';
import { X, Sparkles, Lock, Loader2, CheckCircle, Zap } from 'lucide-react';
import { generateNoteAssist, generateSessionId } from '../../services/aiNoteService';

const noteFormats = [
  { id: 'dap', name: 'DAP', description: 'Data · Assessment · Plan' },
  { id: 'soap', name: 'SOAP', description: 'Subjective · Objective · Assessment · Plan' },
  { id: 'birp', name: 'BIRP', description: 'Behavior · Intervention · Response · Plan' },
  { id: 'progress', name: 'Progress', description: 'Narrative progress note' },
];

export function NoteModal({ clientName, onClose }: { clientName: string; onClose: () => void }) {
  const [selectedFormat, setSelectedFormat] = useState('dap');
  const [aiAssisting, setAiAssisting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ remaining: number; limit: number; used: number } | null>(null);
  const [sectionValues, setSectionValues] = useState<Record<string, string>>({
    section1: '',
    section2: '',
    section3: '',
    section4: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleAiAssist = async () => {
    setAiAssisting(true);
    setAiError(null);
    setAiSuccess(false);

    try {
      // Validate that user has entered some content
      const hasContent = Object.values(sectionValues).some(v => v.trim().length > 0);
      if (!hasContent) {
        throw new Error('Please enter some session notes before using AI assist.');
      }

      const result = await generateNoteAssist({
        sessionId: generateSessionId(),
        noteFormat: selectedFormat.toUpperCase() as 'DAP' | 'SOAP' | 'BIRP' | 'PROGRESS',
        section1: sectionValues.section1 || '',
        section2: sectionValues.section2 || '',
        section3: sectionValues.section3 || '',
        section4: sectionValues.section4,
        sessionContext: `Individual therapy session, 50 minutes`,
      });

      // Populate sections with AI suggestions
      if (result.sections) {
        setSectionValues(result.sections);
        setAiSuccess(true);

        // Update usage info
        if (result.usage) {
          setAiUsage(result.usage);
        }

        // Hide success message after 3 seconds
        setTimeout(() => setAiSuccess(false), 3000);
      }
    } catch (error) {
      console.error('AI assist error:', error);
      setAiError(error instanceof Error ? error.message : 'AI assist is currently unavailable. Please write your note manually.');
    } finally {
      setAiAssisting(false);
    }
  };

  const getSections = (format: string) => {
    switch (format) {
      case 'dap':
        return [
          { label: 'Data', hint: 'Enter the data collected during the session.', placeholder: 'Enter data...' },
          { label: 'Assessment', hint: 'Enter your assessment of the data.', placeholder: 'Enter assessment...' },
          { label: 'Plan', hint: 'Enter the plan for the next session.', placeholder: 'Enter plan...' },
        ];
      case 'soap':
        return [
          { label: 'Subjective', hint: 'Enter the subjective information.', placeholder: 'Enter subjective...' },
          { label: 'Objective', hint: 'Enter the objective information.', placeholder: 'Enter objective...' },
          { label: 'Assessment', hint: 'Enter your assessment.', placeholder: 'Enter assessment...' },
          { label: 'Plan', hint: 'Enter the plan for the next session.', placeholder: 'Enter plan...' },
        ];
      case 'birp':
        return [
          { label: 'Behavior', hint: 'Enter the behavior observed.', placeholder: 'Enter behavior...' },
          { label: 'Intervention', hint: 'Enter the intervention used.', placeholder: 'Enter intervention...' },
          { label: 'Response', hint: 'Enter the response to the intervention.', placeholder: 'Enter response...' },
          { label: 'Plan', hint: 'Enter the plan for the next session.', placeholder: 'Enter plan...' },
        ];
      case 'progress':
        return [
          { label: 'Summary', hint: 'Enter a summary of the session.', placeholder: 'Enter summary...' },
          { label: 'Observations', hint: 'Enter your observations.', placeholder: 'Enter observations...' },
          { label: 'Plan', hint: 'Enter the plan for the next session.', placeholder: 'Enter plan...' },
        ];
      default:
        return [
          { label: 'Section 1', hint: 'Enter the first section.', placeholder: 'Enter section 1...' },
          { label: 'Section 2', hint: 'Enter the second section.', placeholder: 'Enter section 2...' },
          { label: 'Section 3', hint: 'Enter the third section.', placeholder: 'Enter section 3...' },
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-serif text-gray-900">Session Note</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{clientName} · Session {new Date().toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">Note Format</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {noteFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-left ${selectedFormat === format.id
                  ? 'border-[#4a7c6f] bg-[#E8F3F0]'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-gray-900 text-sm sm:text-base">{format.name}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 hidden sm:block">{format.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Section Fields */}
          {getSections(selectedFormat).map((section, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {section.label}
                <span className="text-xs text-gray-500 ml-2 font-normal">{section.hint}</span>
              </label>
              <textarea
                value={sectionValues[`section${idx + 1}`] || ''}
                onChange={(e) => setSectionValues({ ...sectionValues, [`section${idx + 1}`]: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c6f] resize-none text-sm sm:text-base"
                placeholder={section.placeholder}
              />
            </div>
          ))}

          {/* AI Assist Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-blue-900 text-sm sm:text-base">AI Note Assist</h4>
                  <p className="text-xs sm:text-sm text-blue-800 mt-1">
                    Get AI-generated suggestions based on your session notes. All processing is PHIPA-compliant.
                  </p>
                  {aiError && (
                    <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-start gap-2">
                      <span className="flex-shrink-0">⚠️</span>
                      <span className="flex-1">{aiError}</span>
                    </p>
                  )}
                  {aiSuccess && (
                    <p className="text-xs sm:text-sm text-green-600 mt-2 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">AI suggestions applied!</span>
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleAiAssist}
                    disabled={aiAssisting}
                    className="mt-3 flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {aiAssisting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Assisting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">Get AI suggestions</span>
                        <span className="sm:hidden">AI Assist</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PHIPA Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-700">
                All notes are encrypted at rest and stored on Canadian servers in compliance with PHIPA regulations.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:flex-1 px-4 py-2 bg-[#4a7c6f] text-white rounded-lg hover:bg-[#3d6b5f] transition-colors text-sm sm:text-base"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}