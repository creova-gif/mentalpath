import { useState } from 'react';
import { Sparkles, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { generateNoteAssist } from '../../services/aiNoteService';

export function AITest() {
  const [format, setFormat] = useState<'DAP' | 'SOAP' | 'BIRP' | 'PROGRESS'>('DAP');
  const [section1, setSection1] = useState('Client reported feeling stressed about work deadline');
  const [section2, setSection2] = useState('Used CBT techniques to explore thought patterns');
  const [section3, setSection3] = useState('Continue monitoring stress levels, practice relaxation exercises');
  const [section4, setSection4] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateNoteAssist({
        noteFormat: format,
        section1,
        section2,
        section3,
        section4: section4 || undefined,
        sessionContext: 'Individual therapy session, 50 minutes',
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-serif text-gray-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Claude AI Connection Test
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Test the AI note assist integration to verify Claude API is connected
          </p>

          {/* Format Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Note Format</label>
            <div className="grid grid-cols-4 gap-2">
              {(['DAP', 'SOAP', 'BIRP', 'PROGRESS'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    format === fmt
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Sections */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section 1</label>
              <input
                type="text"
                value={section1}
                onChange={(e) => setSection1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section 2</label>
              <input
                type="text"
                value={section2}
                onChange={(e) => setSection2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section 3</label>
              <input
                type="text"
                value={section3}
                onChange={(e) => setSection3(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            {format === 'SOAP' || format === 'BIRP' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section 4 (optional)</label>
                <input
                  type="text"
                  value={section4}
                  onChange={(e) => setSection4(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            ) : null}
          </div>

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Test AI Connection
              </>
            )}
          </button>

          {/* Results */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Connection Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <div className="mt-3 text-xs text-red-600">
                    <p className="font-medium mb-1">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check that ANTHROPIC_API_KEY is set in Supabase secrets</li>
                      <li>Verify the API key is valid at console.anthropic.com</li>
                      <li>Check browser console for detailed error messages</li>
                      <li>Ensure the edge function is deployed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-900">✅ Claude API Connected Successfully!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Model: {result.model} • Format: {result.format}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 mt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">AI Generated Note:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{result.draft}</pre>
              </div>

              {result.sections && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mt-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Parsed Sections:</h4>
                  <div className="space-y-2">
                    {Object.entries(result.sections).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-gray-900">{key}:</span>
                        <p className="text-gray-700 mt-0.5">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-600 mt-3 italic">{result.disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
