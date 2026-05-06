import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const projectInfo = readFileSync('./utils/supabase/info.tsx', 'utf8');
const urlMatch = projectInfo.match(/export const projectId = "(.*?)"/);
const keyMatch = projectInfo.match(/export const publicAnonKey = "(.*?)"/);

const supabaseUrl = `https://${urlMatch[1]}.supabase.co`;
const supabase = createClient(supabaseUrl, keyMatch[1]);
// But we cannot query information_schema from anon key. Let's use service_role key if available.
