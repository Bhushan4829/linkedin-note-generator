// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error('Missing Supabase URL or Anon Key');
// }

// export const supabase = createClient(supabaseUrl, supabaseKey, {
//   auth: {
//     storage: {
//       getItem: (key) => chrome.storage.local.get(key),
//       setItem: (key, value) => chrome.storage.local.set({ [key]: value }),
//       removeItem: (key) => chrome.storage.local.remove(key)
//     },
//     persistSession: true,
//     autoRefreshToken: true,
//     detectSessionInUrl: false
//   }
// });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: {
        getItem: async (key) => {
          const { [key]: value } = await chrome.storage.local.get(key);
          return value;
        },
        setItem: async (key, value) => {
          await chrome.storage.local.set({ [key]: value });
        },
        removeItem: async (key) => {
          await chrome.storage.local.remove(key);
        }
      },
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);

// Add session change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    chrome.storage.local.set({
      supabase_session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      }
    });
  } else {
    chrome.storage.local.remove('supabase_session');
  }
});

export { supabase };