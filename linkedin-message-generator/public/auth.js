// Parse URL hash fragment (#) parameters
// Parse URL hash
const params = new URLSearchParams(window.location.hash.substring(1));
const access_token = params.get('access_token');
const refresh_token = params.get('refresh_token');
if (access_token && refresh_token) {
  chrome.storage.local.set({
    supabase_session: { access_token, refresh_token }
  }, () => window.close());
} else {
  window.close();
}