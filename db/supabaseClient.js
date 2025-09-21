import { createClient } from '@supabase/supabase-js'

// Use environment variables instead of hardcoding
export const supabase = () => { 
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY  // Service role for backend
    try{
        return createClient(supabaseUrl, supabaseKey) 
    } catch (error) {
        console.error('Error creating Supabase client:', error)
        throw error
    }
}