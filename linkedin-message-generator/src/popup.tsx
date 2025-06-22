// // New code
// import React, { useState, useEffect } from "react";
// import { createRoot } from "react-dom/client";
// import { supabase } from "./supabaseClient";
// import { User } from '@supabase/supabase-js';
// // import { ChromeStorageAdapter } from '@supabase/auth-helpers-shared';
// supabase.auth.onAuthStateChange((_event, session) => {
//   if (session) {
//     chrome.storage.local.set({ supabase_session: session });
//   } else {
//     chrome.storage.local.remove('supabase_session');
//   }
// });
// function scrapeLinkedInProfile(): { name: string; headline: string } {
//   const name = document.querySelector("h1")?.textContent?.trim() || "";
//   const headline = document.querySelector(".text-body-medium.break-words")?.textContent?.trim() || "";
//   return { name, headline };
// }
// const chromeStorageAdapter = {
//   getItem: (key: string) => {
//     return new Promise<string | null>((resolve) => {
//       chrome.storage.local.get([key], (result) => {
//         resolve(result[key] || null);
//       });
//     });
//   },
//   setItem: (key: string, value: string) => {
//     return new Promise<void>((resolve) => {
//       chrome.storage.local.set({ [key]: value }, () => {
//         resolve();
//       });
//     });
//   },
//   removeItem: (key: string) => {
//     return new Promise<void>((resolve) => {
//       chrome.storage.local.remove(key, () => {
//         resolve();
//       });
//     });
//   }
// };
// const Popup: React.FC = () => {
//   // Auth state
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [user, setUser] = useState<User | null>(null);
//   const [authError, setAuthError] = useState('');
//   const [mode, setMode] = useState<'login' | 'signup'>('login');


//   // App state
//   const [profile, setProfile] = useState({ name: "", headline: "" });
//   const [note, setNote] = useState("");
//   const [emailDraft, setEmailDraft] = useState(""); // Fixed variable name
//   const [inmail, setInmail] = useState("");
//   const [loading, setLoading] = useState<"none" | "note" | "email" | "inmail">("none");
//   const [error, setError] = useState("");

//   // Check session on mount
//   useEffect(() => {
//   (async () => {
//     const { supabase_session } = await chrome.storage.local.get('supabase_session');
//     if (supabase_session && supabase_session.access_token && supabase_session.refresh_token) {
//       await supabase.auth.setSession(supabase_session);
//     }
//     const { data: { user } } = await supabase.auth.getUser();
//     setUser(user);
//   })();
// }, []);


//   const handleLogin = async () => {
//   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//   if (error) setAuthError(error.message);
//   else {
//     setUser(data.user);
//     // Save session to chrome.storage.local
//     const session = data.session;
//     if (session) {
//       await chrome.storage.local.set({
//         supabase_session: {
//           access_token: session.access_token,
//           refresh_token: session.refresh_token,
//         }
//       });
//     }
//   }
// };
//   const handleSignUp = async () => {
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//   });
//   if (error) setAuthError(error.message);
//   else {
//     setAuthError("Sign up successful! Please check your email for a confirmation link.");
//     setMode("login");
//   }
// };
//   const handleGoogleLogin = async () => {
//   try {
//     const extensionId = chrome.runtime.id;
//     const redirectUrl = `https://${extensionId}.chromiumapp.org/auth`;

//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: redirectUrl,
//         queryParams: {
//           access_type: 'offline',
//           prompt: 'consent'
//         }
//       }
//     });

//     if (error) throw error;
//     if (!data.url) throw new Error('No authentication URL received');

//     // Launch auth flow and capture the response URL
//     const responseUrl = await chrome.identity.launchWebAuthFlow({
//       url: data.url,
//       interactive: true
//     });

//     // Add this null check before creating URL
//     if (!responseUrl) {
//       throw new Error('Authentication failed - no response URL');
//     }

//     // Now TypeScript knows responseUrl is defined
//     const url = new URL(responseUrl);
//     const params = new URLSearchParams(url.hash.substring(1));
    
//     const access_token = params.get('access_token');
//     const refresh_token = params.get('refresh_token');
//     const expires_in = parseInt(params.get('expires_in') || '3600');

//     if (!access_token || !refresh_token) {
//       throw new Error('Missing tokens in authentication response');
//     }

//     // Set the session directly
//     const { data: { session, user }, error: sessionError } = 
//       await supabase.auth.setSession({
//         access_token,
//         refresh_token
//       });

//     if (sessionError) throw sessionError;
//     if (!user) throw new Error('No user returned after authentication');
    
//     setUser(user);

//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
//     setAuthError(errorMessage);
//     console.error('Google auth error:', err);
//   }
// };

//   const handleLogout = async () => {
//   await supabase.auth.signOut();
//   await chrome.storage.local.remove('supabase_session');
//   setUser(null);
//   setProfile({ name: "", headline: "" });
//   setNote("");
//   setEmailDraft("");
//   setInmail("");
// };


//   if (!user) {
//     return (
//       <div style={{ minWidth: 300, padding: 16 }}>
//   <h3 style={{ marginBottom: 12 }}>
//     {mode === 'login' ? "Login Required" : "Sign Up"}
//   </h3>
//   <input
//     value={email}
//     onChange={e => setEmail(e.target.value)}
//     placeholder="Email"
//     style={{ width: '100%', marginBottom: 8, padding: 6 }}
//   />
//   <input
//     type="password"
//     value={password}
//     onChange={e => setPassword(e.target.value)}
//     placeholder="Password"
//     style={{ width: '100%', marginBottom: 8, padding: 6 }}
//   />
//   <button
//   style={{
//     width: '100%',
//     padding: 8,
//     background: '#fff',
//     color: '#333',
//     border: '1px solid #ddd',
//     borderRadius: 4,
//     marginBottom: 12,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8
//   }}
//   onClick={handleGoogleLogin}
// >
//   <img src="https://developers.google.com/identity/images/g-logo.png" alt="" style={{width: 18}} />
//   Sign in with Google
// </button>

//   <button
//     onClick={mode === 'login' ? handleLogin : handleSignUp}
//     style={{ width: '100%', padding: 8, background: '#0073b1', color: 'white', border: 'none', borderRadius: 4 }}
//   >
//     {mode === 'login' ? "Log In" : "Sign Up"}
//   </button>
//   <div style={{ marginTop: 8 }}>
//     {mode === 'login' ? (
//       <span>
//         New user?{" "}
//         <a href="#" onClick={() => setMode('signup')}>Sign up here</a>
//       </span>
//     ) : (
//       <span>
//         Already have an account?{" "}
//         <a href="#" onClick={() => setMode('login')}>Log in here</a>
//       </span>
//     )}
//   </div>
//   {authError && <div style={{ color: 'red', marginTop: 8 }}>{authError}</div>}
// </div>
//     );
//   }

//   const getProfile = () =>
//     new Promise<{ name: string; headline: string }>((resolve, reject) => {
//       chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
//         chrome.scripting.executeScript(
//           {
//             target: { tabId: tab.id! },
//             func: scrapeLinkedInProfile,
//           },
//           (injectionResults) => {
//             if (
//               chrome.runtime.lastError ||
//               !injectionResults ||
//               !injectionResults[0].result
//             ) {
//               reject("Could not extract profile info. Are you on a LinkedIn profile page?");
//               return;
//             }
//             const { name, headline } = injectionResults[0].result;
//             if (!name) {
//               reject("Could not find the name on this page. Try refreshing or check the profile page.");
//               return;
//             }
//             resolve({ name, headline });
//           }
//         );
//       });
//     });

//   async function fetchDraft(endpoint: string, name: string, headline: string): Promise<string> {
//     try {
//       const response = await fetch(`http://localhost:8000/${endpoint}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, headline }),
//       });
//       const data = await response.json();
//       return data[endpoint.replace("generate_", "")] || "No result";
//     } catch (e) {
//       return "Error contacting backend. Please try again later.";
//     }
//   }

//   const handleClick = async (type: "note" | "email" | "inmail") => {
//     setError("");
//     setLoading(type);
//     try {
//       const { name, headline } = await getProfile();
//       setProfile({ name, headline });
//       if (type === "note") {
//         setNote("Generating...");
//         const res = await fetchDraft("generate_note", name, headline);
//         setNote(res);
//       } else if (type === "email") {
//         setEmail("Generating...");
//         const res = await fetchDraft("generate_email", name, headline);
//         setEmail(res);
//       } else if (type === "inmail") {
//         setInmail("Generating...");
//         const res = await fetchDraft("generate_inmail", name, headline);
//         setInmail(res);
//       }
//     } catch (err: any) {
//       setError(err);
//     }
//     setLoading("none");
//   };

//   const handleCopy = (text: string) => {
//     navigator.clipboard.writeText(text);
//   };

//   return (
//     <div style={{ minWidth: 340, padding: 16, fontFamily: "Segoe UI, Arial",position: "relative" }}>
//       <button
//         onClick={handleLogout}
//         style={{
//           position: 'absolute',
//           top: 10,
//           right: 14,
//           background: '#fff',
//           color: '#0073b1',
//           border: '1px solid #0073b1',
//           borderRadius: 5,
//           fontSize: 12,
//           fontWeight: 600,
//           padding: '5px 10px',
//           cursor: 'pointer',
//           zIndex: 2
//         }}
//         title="Log out"
//       >
//         Log out
//       </button>
//       <div style={{ fontSize: 13, color: "#555", marginBottom: 10, marginTop: 5 }}>
//         Logged in as <b>{user.email}</b>
//       </div>
//       <h3 style={{ margin: "4px 0 14px" }}>LinkedIn Message Generator</h3>
//       <div>
//         <button
//           onClick={() => handleClick("note")}
//           disabled={loading !== "none"}
//           style={{ width: "100%", marginBottom: 8, padding: 8, background: "#0073b1", color: "#fff", borderRadius: 6, border: "none", fontWeight: "bold" }}
//         >
//           {loading === "note" ? "Generating..." : "Generate LinkedIn Note"}
//         </button>
//         {note && (
//           <div style={{ marginBottom: 12 }}>
//             <textarea
//               value={note}
//               readOnly
//               rows={3}
//               style={{ width: "100%", borderRadius: 4, border: "1px solid #bbb", marginTop: 4, padding: 6, fontSize: 14 }}
//             />
//             <button onClick={() => handleCopy(note)} style={{ marginTop: 4, float: "right", fontSize: 12, borderRadius: 4 }}>
//               Copy
//             </button>
//           </div>
//         )}

//         <button
//           onClick={() => handleClick("email")}
//           disabled={loading !== "none"}
//           style={{ width: "100%", marginBottom: 8, padding: 8, background: "#26A541", color: "#fff", borderRadius: 6, border: "none", fontWeight: "bold" }}
//         >
//           {loading === "email" ? "Generating..." : "Generate Cold Email"}
//         </button>
//         {emailDraft && (
//           <div style={{ marginBottom: 12 }}>
//             <textarea
//               value={emailDraft}
//               readOnly
//               rows={4}
//               style={{ width: "100%", borderRadius: 4, border: "1px solid #bbb", marginTop: 4, padding: 6, fontSize: 14 }}
//             />
//             <button onClick={() => handleCopy(emailDraft)} style={{ marginTop: 4, float: "right", fontSize: 12, borderRadius: 4 }}>
//               Copy
//             </button>
//           </div>
//         )}

//         <button
//           onClick={() => handleClick("inmail")}
//           disabled={loading !== "none"}
//           style={{ width: "100%", marginBottom: 8, padding: 8, background: "#F8C13A", color: "#333", borderRadius: 6, border: "none", fontWeight: "bold" }}
//         >
//           {loading === "inmail" ? "Generating..." : "Generate LinkedIn InMail"}
//         </button>
//         {inmail && (
//           <div style={{ marginBottom: 10 }}>
//             <textarea
//               value={inmail}
//               readOnly
//               rows={4}
//               style={{ width: "100%", borderRadius: 4, border: "1px solid #bbb", marginTop: 4, padding: 6, fontSize: 14 }}
//             />
//             <button onClick={() => handleCopy(inmail)} style={{ marginTop: 4, float: "right", fontSize: 12, borderRadius: 4 }}>
//               Copy
//             </button>
//           </div>
//         )}

//         {error && <div style={{ color: "red", marginTop: 6 }}>{error}</div>}
//       </div>
//       <div style={{ marginTop: 10, fontSize: 11, color: "#666" }}>
//         {profile.name && (
//           <>Profile: <b>{profile.name}</b> {profile.headline && `— ${profile.headline}`}</>
//         )}
//         {!profile.name && <>Navigate to a LinkedIn profile page and click a button above.</>}
//       </div>
//     </div>
//   );
// };

// const root = createRoot(document.getElementById("root")!);
// root.render(<Popup />);


// import React from "react";
// import { createRoot } from "react-dom/client";

// const Popup = () => <div style={{ padding: 24, fontSize: 18 }}>Hello, this is the popup!</div>;

// const root = createRoot(document.getElementById("root")!);
// root.render(<Popup />);


// Testing Code

import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient";
import { User } from '@supabase/supabase-js';

// Helper: Scrape LinkedIn
function scrapeLinkedInProfile(): { name: string; headline: string } {
  const name = document.querySelector("h1")?.textContent?.trim() || "";
  const headline = document.querySelector(".text-body-medium.break-words")?.textContent?.trim() || "";
  return { name, headline };
}

const Popup: React.FC = () => {
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  // App state
  const [profile, setProfile] = useState({ name: "", headline: "" });
  const [jobdesc, setJobdesc] = useState(""); // NEW: For plain JD input
  const [note, setNote] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [inmail, setInmail] = useState("");
  const [loading, setLoading] = useState<"none" | "note" | "email" | "inmail">("none");
  const [error, setError] = useState("");

  const [customPrompt, setCustomPrompt] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  // Auth check on mount
  useEffect(() => {
  (async () => {
    const { supabase_session } = await chrome.storage.local.get('supabase_session');
    if (supabase_session && supabase_session.access_token && supabase_session.refresh_token) {
      await supabase.auth.setSession(supabase_session);
    }
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  })();
}, []);

  // Auth Handlers
  const handleLogin = async () => {
    setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    else setUser(data.user);
  };
  const handleSignUp = async () => {
    setAuthError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    else {
      setAuthError("Sign up successful! Please check your email for a confirmation link.");
      setMode("login");
    }
  };
  const handleGoogleLogin = async () => {
  try {
    const extensionId = chrome.runtime.id;
    const redirectUrl = `https://${extensionId}.chromiumapp.org/auth`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    if (!data.url) throw new Error('No authentication URL received');

    // Launch auth flow and capture the response URL
    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: data.url,
      interactive: true
    });

    // Add this null check before creating URL
    if (!responseUrl) {
      throw new Error('Authentication failed - no response URL');
    }

    // Now TypeScript knows responseUrl is defined
    const url = new URL(responseUrl);
    const params = new URLSearchParams(url.hash.substring(1));
    
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = parseInt(params.get('expires_in') || '3600');

    if (!access_token || !refresh_token) {
      throw new Error('Missing tokens in authentication response');
    }

    // Set the session directly
    const { data: { session, user }, error: sessionError } = 
      await supabase.auth.setSession({
        access_token,
        refresh_token
      });

    if (sessionError) throw sessionError;
    if (!user) throw new Error('No user returned after authentication');
    
    setUser(user);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    setAuthError(errorMessage);
    console.error('Google auth error:', err);
  }
};
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile({ name: "", headline: "" });
    setNote("");
    setEmailDraft("");
    setInmail("");
  };
  if (!user) {
    return (
      <div style={{ minWidth: 300, padding: 16 }}>
  <h3 style={{ marginBottom: 12 }}>
    {mode === 'login' ? "Login Required" : "Sign Up"}
  </h3>
  <input
    value={email}
    onChange={e => setEmail(e.target.value)}
    placeholder="Email"
    style={{ width: '100%', marginBottom: 8, padding: 6 }}
  />
  <input
    type="password"
    value={password}
    onChange={e => setPassword(e.target.value)}
    placeholder="Password"
    style={{ width: '100%', marginBottom: 8, padding: 6 }}
  />
  <button
  style={{
    width: '100%',
    padding: 8,
    background: '#fff',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: 4,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  }}
  onClick={handleGoogleLogin}
>
  <img src="https://developers.google.com/identity/images/g-logo.png" alt="" style={{width: 18}} />
  Sign in with Google
</button>

  <button
    onClick={mode === 'login' ? handleLogin : handleSignUp}
    style={{ width: '100%', padding: 8, background: '#0073b1', color: 'white', border: 'none', borderRadius: 4 }}
  >
    {mode === 'login' ? "Log In" : "Sign Up"}
  </button>
  <div style={{ marginTop: 8 }}>
    {mode === 'login' ? (
      <span>
        New user?{" "}
        <a href="#" onClick={() => setMode('signup')}>Sign up here</a>
      </span>
    ) : (
      <span>
        Already have an account?{" "}
        <a href="#" onClick={() => setMode('login')}>Log in here</a>
      </span>
    )}
  </div>
  {authError && <div style={{ color: 'red', marginTop: 8 }}>{authError}</div>}
</div>
    );
  }
  // Fetch LinkedIn profile
  const getProfile = () =>
    new Promise<{ name: string; headline: string }>((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id! },
            func: scrapeLinkedInProfile,
          },
          (injectionResults) => {
            if (
              chrome.runtime.lastError ||
              !injectionResults ||
              !injectionResults[0].result
            ) {
              reject("Could not extract profile info. Are you on a LinkedIn profile page?");
              return;
            }
            const { name, headline } = injectionResults[0].result;
            if (!name) {
              reject("Could not find the name on this page. Try refreshing or check the profile page.");
              return;
            }
            resolve({ name, headline });
          }
        );
      });
    });

  // Backend call (single endpoint)
  async function fetchDraft(
  type: "note" | "email" | "inmail",
  name: string,
  headline: string,
  userId: string,
  jobdescText: string,
  customPrompt: string = "",
  additionalContext: string = ""
): Promise<string> {
  try {
    const { supabase_session } = await chrome.storage.local.get('supabase_session');
    const access_token = supabase_session?.access_token;

    if (!access_token) {
      return "Missing access token. Please log in again.";
    }

    const response = await fetch("https://d0633fcf28ede45a1932e5b3e0d4fd395.clg07azjl.paperspacegradient.com/generate_message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        name,
        headline,
        user_id: userId,
        message_type: type,
        jobdesc_text: jobdescText,
        custom_prompt: customPrompt,
        additional_context: additionalContext,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.message) {
      console.error("Missing expected field in response:", { type, data });
    }
    return data.message || "No result";
  } catch (e) {
    return "Error contacting backend. Please try again later.";
  }
}

  // Handle message generation
  const handleClick = async (type: "note" | "email" | "inmail") => {
    setError("");
    setLoading(type);
    try {
      const { name, headline } = await getProfile();
      setProfile({ name, headline });

      if (!user) {
        setError("Please log in first.");
        setLoading("none");
        return;
      }
      if (type === "note") {
      setNote("Generating...");
      const res = await fetchDraft(type, name, headline, user.id, jobdesc, customPrompt, additionalContext);
      setNote(res);
    } else if (type === "email") {
      setEmailDraft("Generating...");
      const res = await fetchDraft(type, name, headline, user.id, jobdesc, customPrompt, additionalContext);
      setEmailDraft(res);
    } else if (type === "inmail") {
      setInmail("Generating...");
      const res = await fetchDraft(type, name, headline, user.id, jobdesc, customPrompt, additionalContext);
      setInmail(res);
    }
    } catch (err: any) {
      setError(err);
    }
    setLoading("none");
  };

  // UI
  if (!user) {
    return (
      <div style={{ minWidth: 320, padding: 16 }}>
        <h3 style={{ marginBottom: 12 }}>
          {mode === 'login' ? "Login Required" : "Sign Up"}
        </h3>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          style={{ width: '100%', marginBottom: 8, padding: 6 }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          style={{ width: '100%', marginBottom: 8, padding: 6 }}
        />
        <button
          onClick={mode === 'login' ? handleLogin : handleSignUp}
          style={{ width: '100%', padding: 8, background: '#0073b1', color: 'white', border: 'none', borderRadius: 4 }}
        >
          {mode === 'login' ? "Log In" : "Sign Up"}
        </button>
        <div style={{ marginTop: 8 }}>
          {mode === 'login' ? (
            <span>
              New user?{" "}
              <a href="#" onClick={() => setMode('signup')}>Sign up here</a>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <a href="#" onClick={() => setMode('login')}>Log in here</a>
            </span>
          )}
        </div>
        {authError && <div style={{ color: 'red', marginTop: 8 }}>{authError}</div>}
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ minWidth: 340, padding: 16, fontFamily: "Segoe UI, Arial", position: "relative" }}>
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: 10,
          right: 14,
          background: '#fff',
          color: '#0073b1',
          border: '1px solid #0073b1',
          borderRadius: 5,
          fontSize: 12,
          fontWeight: 600,
          padding: '5px 10px',
          cursor: 'pointer',
          zIndex: 2
        }}
        title="Log out"
      >
        Log out
      </button>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 10, marginTop: 5 }}>
        Logged in as <b>{user.email}</b>
      </div>
      <h3 style={{ margin: "4px 0 10px" }}>LinkedIn Message Generator</h3>
      {/* -------- JD TEXT AREA -------- */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontWeight: 500 }}>Job Description (optional):</label>
        <textarea
          value={jobdesc}
          onChange={e => setJobdesc(e.target.value)}
          rows={3}
          placeholder="Paste job description here (optional, improves personalization)"
          style={{ width: "100%", borderRadius: 5, border: "1px solid #bbb", marginTop: 2, marginBottom: 6, padding: 6, fontSize: 14 }}
        />
        <textarea
        value={customPrompt}
        onChange={e => setCustomPrompt(e.target.value)}
        rows={2}
        placeholder="Custom prompt (optional, overrides saved prompt for this run)"
        style={{ width: "100%", borderRadius: 5, border: "1px solid #bbb", marginTop: 2, marginBottom: 6, padding: 6, fontSize: 14 }}

      />
      <textarea
        value={additionalContext}
        onChange={e => setAdditionalContext(e.target.value)}
        rows={2}
        placeholder="Additional context (optional, will be added to message context)"
        style={{ width: "100%", borderRadius: 5, border: "1px solid #bbb", marginTop: 2, marginBottom: 6, padding: 6, fontSize: 14 }}

      />
      </div>

      {/* -------- GENERATE BUTTONS -------- */}
      <button
        onClick={() => handleClick("note")}
        disabled={loading !== "none"}
        style={{ width: "100%", marginBottom: 8, padding: 8, background: "#0073b1", color: "#fff", borderRadius: 6, border: "none", fontWeight: "bold" }}
      >
        {loading === "note" ? "Generating..." : "Generate LinkedIn Note"}
      </button>
      {note && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={note}
            readOnly
            rows={3}
            style={{ width: "100%", borderRadius: 4, border: "1px solid #bbb", marginTop: 4, padding: 6, fontSize: 14 }}
          />
          <button onClick={() => handleCopy(note)} style={{ marginTop: 4, float: "right", fontSize: 12, borderRadius: 4 }}>
            Copy
          </button>
        </div>
      )}
      <button
        onClick={() => handleClick("email")}
        disabled={loading !== "none"}
        style={{ width: "100%", marginBottom: 8, padding: 8, background: "#26A541", color: "#fff", borderRadius: 6, border: "none", fontWeight: "bold" }}
      >
        {loading === "email" ? "Generating..." : "Generate Cold Email"}
      </button>
      {emailDraft && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={emailDraft}
            readOnly
            rows={4}
            style={{ width: "100%", borderRadius: 4, border: "1px solid #bbb", marginTop: 4, padding: 6, fontSize: 14 }}
          />
          <button onClick={() => handleCopy(emailDraft)} style={{ marginTop: 4, float: "right", fontSize: 12, borderRadius: 4 }}>
            Copy
          </button>
        </div>
      )}
      <button
        onClick={() => handleClick("inmail")}
        disabled={loading !== "none"}
        style={{ width: "100%", marginBottom: 8, padding: 8, background: "#F8C13A", color: "#333", borderRadius: 6, border: "none", fontWeight: "bold" }}
      >
        {loading === "inmail" ? "Generating..." : "Generate LinkedIn InMail"}
      </button>
      {inmail && (
        <div style={{ marginBottom: 10 }}>
          <textarea
            value={inmail}
            readOnly
            rows={4}
            style={{ width: "100%", borderRadius: 4, border: "1px solid #bbb", marginTop: 4, padding: 6, fontSize: 14 }}
          />
          <button onClick={() => handleCopy(inmail)} style={{ marginTop: 4, float: "right", fontSize: 12, borderRadius: 4 }}>
            Copy
          </button>
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: 6 }}>{error}</div>}
      <div style={{ marginTop: 10, fontSize: 11, color: "#666" }}>
        {profile.name && (
          <>Profile: <b>{profile.name}</b> {profile.headline && `— ${profile.headline}`}</>
        )}
        {!profile.name && <>Navigate to a LinkedIn profile page and click a button above.</>}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);