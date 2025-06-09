// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'oauth-callback') {
//     chrome.storage.local.set({
//       supabase_token: {
//         access_token: request.access_token,
//         refresh_token: request.refresh_token,
//         expires_at: Date.now() + (request.expires_in * 1000)
//       }
//     }, () => {
//       // Notify the popup that auth is complete
//       chrome.runtime.sendMessage({ type: 'auth-complete' });
//     });
//   }
// });
// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'get-session') {
    chrome.storage.local.get('supabase_token').then(sendResponse);
    return true; // Required for async response
  }
});