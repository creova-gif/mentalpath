import { projectId } from '/utils/supabase/info';
import { authHeaders } from '@/utils/supabase/client';

const SUPABASE_URL = `https://${projectId}.supabase.co`;

export interface AINoteRequest {
  noteFormat: 'DAP' | 'SOAP' | 'BIRP' | 'PROGRESS';
  section1: string;
  section2: string;
  section3: string;
  section4?: string;
  sessionContext?: string;
}

export interface AINoteResponse {
  draft: string;
  format: string;
  model: string;
  disclaimer: string;
  usage?: {
    remaining: number;
    limit: number;
    used: number;
  };
  sections?: {
    [key: string]: string;
  };
}

/**
 * Parse AI-generated note into sections
 * The AI returns formatted text like:
 * 
 * Data:
 * Client reported...
 * 
 * Assessment:
 * Clinical formulation...
 * 
 * Plan:
 * Next steps...
 */
function parseNoteSections(draft: string, format: string): { [key: string]: string } {
  const sections: { [key: string]: string } = {};
  
  // Different formats have different section labels
  const sectionLabels: Record<string, string[]> = {
    DAP: ['Data', 'Assessment', 'Plan'],
    SOAP: ['Subjective', 'Objective', 'Assessment', 'Plan'],
    BIRP: ['Behavior', 'Intervention', 'Response', 'Plan'],
    PROGRESS: ['Summary', 'Observations', 'Plan'],
  };

  const labels = sectionLabels[format] || ['Section 1', 'Section 2', 'Section 3'];
  
  // Split by section headers
  let remainingText = draft;
  
  labels.forEach((label, index) => {
    const regex = new RegExp(`${label}:\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z][a-z]+:\\s*\\n|$)`, 'i');
    const match = remainingText.match(regex);
    
    if (match && match[1]) {
      sections[`section${index + 1}`] = match[1].trim();
    }
  });

  // Fallback: if parsing failed, just return the whole draft in section 1
  if (Object.keys(sections).length === 0) {
    sections.section1 = draft;
  }

  return sections;
}

/**
 * Call the AI Note Assist API
 */
export async function generateNoteAssist(request: AINoteRequest): Promise<AINoteResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-4d1a502d/ai-note-assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      },
      body: JSON.stringify({
        // Correlation id for server logs only — not linked to any client.
        session_id: crypto.randomUUID(),
        note_format: request.noteFormat,
        section_1: request.section1,
        section_2: request.section2,
        section_3: request.section3,
        section_4: request.section4,
        session_context: request.sessionContext || 'Individual therapy session, 50 minutes',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'AI assist service unavailable');
    }

    const data = await response.json();
    
    // Parse the draft into sections
    const sections = parseNoteSections(data.draft, request.noteFormat);

    return {
      draft: data.draft,
      format: data.format,
      model: data.model,
      disclaimer: data.disclaimer,
      usage: data.usage,
      sections,
    };
  } catch (error) {
    console.error('AI Note Assist Error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'AI assist is currently unavailable. Please write your note manually.'
    );
  }
}
