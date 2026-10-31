import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://upgscgxwxpabiukrgclg.supabase.co";

const SUPABASE_KEY = "sb_publishable_eynw3SDjsTqpwoTJvbr7Aw_lWKMwOd0";

export const supabase = createClient(
    
    SUPABASE_URL,
    SUPABASE_KEY
);