import { supabase } from '../lib/supabase';

export const hasSave = async () => {
    const lastSessionKey = localStorage.getItem('hounded_last_session');
    if (!lastSessionKey) return false;

    try {
        const { data, error } = await supabase
            .from('game_sessions')
            .select('id')
            .eq('session_key', lastSessionKey)
            .maybeSingle();

        return !error && data !== null;
    } catch (error) {
        console.error('hasSave error:', error);
        return false;
    }
};
