const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://avlwwbkhsrubhsfwbgpr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bHd3Ymtoc3J1YmhzZndiZ3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4MTgxOSwiZXhwIjoyMDk2NjU3ODE5fQ.dJRzNTWroMDCkJ3Zd9PXxsJklG02XzwjT6iHdlt_-yc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
