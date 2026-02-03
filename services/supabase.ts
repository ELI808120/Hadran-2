import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("פרטי ההתחברות של Supabase חסרים. ייתכן שהאפליקציה לא תפעל כראוי עד להגדרתם.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
