// import React, { useEffect, useState } from "react";
// import { supabase } from "./supabaseClients";
// import CryptoJS from "crypto-js"; // for encryption

// const Dashboard: React.FC = () => {
//   // Auth State
//   const [user, setUser] = useState<any>(null);
//   const [authMode, setAuthMode] = useState<"login" | "signup">("login");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [authError, setAuthError] = useState("");

//   // Preferences State
//   const [prefs, setPrefs] = useState<any>({});
//   const [apiKey, setApiKey] = useState(""); // Plaintext input
//   const [apiKeyEncrypted, setApiKeyEncrypted] = useState(""); // For upsert
//   const [notePrompt, setNotePrompt] = useState("");
//   const [emailPrompt, setEmailPrompt] = useState("");
//   const [inmailPrompt, setInmailPrompt] = useState("");
//   const [useResume, setUseResume] = useState(false);
//   const [useJobdesc, setUseJobdesc] = useState(false);
//   const [useContext, setUseContext] = useState(false);
//   const [fileType, setFileType] = useState("resume");
//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [status, setStatus] = useState("");
//   const [jobdescText, setJobdescText] = useState("");

//   // Auth: Check session on mount
//   useEffect(() => {
//     supabase.auth.getUser().then(({ data }) => setUser(data.user));
//   }, []);

//   // Load user preferences on login
//   useEffect(() => {
//     if (!user) return;
//     supabase
//       .from("user_preferences")
//       .select("*")
//       .eq("user_id", user.id)
//       .single()
//       .then(({ data }) => {
//         if (data) {
//           setPrefs(data);
//           setNotePrompt(data.note_prompt || "");
//           setEmailPrompt(data.email_prompt || "");
//           setInmailPrompt(data.inmail_prompt || "");
//           setUseResume(data.use_resume || false);
//           setUseJobdesc(data.use_jobdesc || false);
//           setUseContext(data.use_context_files || false);
//           setApiKeyEncrypted(data.openai_api_key || "");
//         }
//       });
//   }, [user]);

//   // --- ENCRYPTION helper ---
//   const encryptApiKey = (plain: string) => {
//     // For demo: Use user.id as secret. For production, use a per-user random secret!
//     return CryptoJS.AES.encrypt(plain, user.id).toString();
//   };

//   // --- Google sign-in ---
//   const handleGoogleSignIn = async () => {
//     setAuthError("");
//     try {
//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider: "google"
//       });
//       if (error) throw error;
//     } catch (err: any) {
//       setAuthError(err.message || "Google sign-in failed");
//     }
//   };

//   // --- Save preferences (store only encrypted) ---
//   const handleSave = async () => {
//     setStatus("Saving...");
//     const upsert = {
//         user_id: user.id,
//         note_prompt: notePrompt,
//         email_prompt: emailPrompt,
//         inmail_prompt: inmailPrompt,
//         use_resume: useResume,
//         use_jobdesc: useJobdesc,
//         use_context_files: useContext,
//         openai_api_key: apiKey ? encryptApiKey(apiKey) : apiKeyEncrypted,
//         jobdesc_text: jobdescText
//       };

//     const { error } = await supabase.from("user_preferences").upsert([upsert], { onConflict: "user_id" });
//     setStatus(error ? "Failed to save!" : "Saved!");
//     setApiKey(""); // Clear field after save for security
//   };

//   // --- File upload handler ---
//   const handleFileUpload = async () => {
//     if (!uploadFile) return;
//     setStatus("Uploading file...");
//     const ext = uploadFile.name.split(".").pop();
//     const path = `user_${user.id}/${fileType}_${Date.now()}.${ext}`;
//     const { data, error } = await supabase.storage.from("resumes").upload(path, uploadFile, { upsert: true });
//     if (!error) {
//       await supabase.from("user_context_files").insert([{
//         user_id: user.id,
//         file_type: fileType,
//         file_name: uploadFile.name,
//         file_url: data.path
//       }]);
//       setStatus("File uploaded!");
//     } else {
//       setStatus("Upload failed.");
//     }
//   };

//   // --- Login / Signup ---
//   const handleAuth = async () => {
//     setAuthError("");
//     try {
//       if (authMode === "login") {
//         const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//         if (error) throw error;
//         setUser(data.user);
//       } else {
//         const { data, error } = await supabase.auth.signUp({ email, password });
//         if (error) throw error;
//         setAuthMode("login");
//         setAuthError("Check your email for a verification link, then log in.");
//       }
//     } catch (err: any) {
//       setAuthError(err.message);
//     }
//   };

//   // --- Logout ---
//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     // Optionally reset all state here
//   };

//   // --- Auth UI ---
//   if (!user) {
//     return (
//       <div style={{ maxWidth: 400, margin: "40px auto" }}>
//         <h2>{authMode === "login" ? "Login" : "Sign Up"}</h2>
//         <input
//           placeholder="Email"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           style={{ width: "100%", marginBottom: 8 }}
//         />
//         <input
//           placeholder="Password"
//           type="password"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           style={{ width: "100%", marginBottom: 8 }}
//         />
//         <button onClick={handleAuth} style={{ width: "100%", marginBottom: 8 }}>
//           {authMode === "login" ? "Log In" : "Sign Up"}
//         </button>
//         <button onClick={handleGoogleSignIn} style={{ width: "100%", marginBottom: 8, background: "#fff", border: "1px solid #ddd" }}>
//           <img src="https://developers.google.com/identity/images/g-logo.png" alt="" style={{ width: 18, marginRight: 8, verticalAlign: "middle" }} />
//           Sign in with Google
//         </button>
//         <div>
//           {authMode === "login" ?
//             <span>Don't have an account? <a href="#" onClick={() => setAuthMode("signup")}>Sign up</a></span> :
//             <span>Already have an account? <a href="#" onClick={() => setAuthMode("login")}>Log in</a></span>
//           }
//         </div>
//         {authError && <div style={{ color: "red", marginTop: 8 }}>{authError}</div>}
//       </div>
//     );
//   }

//   // --- Dashboard UI ---
//   return (
//     <div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h2>Settings Dashboard</h2>
//         <button onClick={handleLogout}>Logout</button>
//       </div>
//       <div>
//         <label>OpenAI API Key (encrypted):</label>
//         <input
//           type="password"
//           value={apiKey}
//           onChange={e => setApiKey(e.target.value)}
//           placeholder={apiKeyEncrypted ? "API key is saved. Enter to update." : "sk-..."}
//           style={{ width: "100%" }}
//           autoComplete="off"
//         />
//       </div>
//       <div>
//         <h4>Custom Prompts</h4>
//         <label>Note Prompt</label>
//         <textarea value={notePrompt} onChange={e => setNotePrompt(e.target.value)} style={{ width: "100%" }} />
//         <label>Email Prompt</label>
//         <textarea value={emailPrompt} onChange={e => setEmailPrompt(e.target.value)} style={{ width: "100%" }} />
//         <label>InMail Prompt</label>
//         <textarea value={inmailPrompt} onChange={e => setInmailPrompt(e.target.value)} style={{ width: "100%" }} />
//         <label>Job Description (plain text):</label>
//         <textarea
//           value={jobdescText}
//           onChange={e => setJobdescText(e.target.value)}
//           style={{ width: "100%", minHeight: 80, marginBottom: 10 }}
//         />
//       </div>
//       <div>
//         <h4>Context Files</h4>
//         <div>
//           <input type="checkbox" checked={useResume} onChange={e => setUseResume(e.target.checked)} /> Use Resume
//           <input type="checkbox" checked={useJobdesc} onChange={e => setUseJobdesc(e.target.checked)} /> Use Job Desc
//           <input type="checkbox" checked={useContext} onChange={e => setUseContext(e.target.checked)} /> Use Other Context Files
//         </div>
//         <select value={fileType} onChange={e => setFileType(e.target.value)}>
//           <option value="resume">Resume</option>
//           <option value="jobdesc">Job Description</option>
//           <option value="context">Context</option>
//         </select>
//         <input type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
//         <button onClick={handleFileUpload}>Upload File</button>
//       </div>
//       <button onClick={handleSave}>Save Preferences</button>
//       <div>{status}</div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClients";
import CryptoJS from "crypto-js";
const Dashboard: React.FC = () => {
  // Auth
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Preferences State
  const [, setPrefs] = useState<any>({});
  const [apiKey, setApiKey] = useState("");
  const [apiKeyEncrypted, setApiKeyEncrypted] = useState("");
  const [notePrompt, setNotePrompt] = useState("");
  const [emailPrompt, setEmailPrompt] = useState("");
  const [inmailPrompt, setInmailPrompt] = useState("");
  const [useResume, setUseResume] = useState(false);
  const [useJobdesc, setUseJobdesc] = useState(false);
  const [useContext, setUseContext] = useState(false);
  const [jobdescText, setJobdescText] = useState("");
  const [status, setStatus] = useState("");

  // File upload management
  const [fileType, setFileType] = useState("resume");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [files, setFiles] = useState<any[]>([]);

  // Active IDs for selection
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activeJobdescId, setActiveJobdescId] = useState<string | null>(null);

  // Auth: Check session
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Load user preferences and context files
  useEffect(() => {
    if (!user) return;
    // Load preferences
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPrefs(data);
          setNotePrompt(data.note_prompt || "");
          setEmailPrompt(data.email_prompt || "");
          setInmailPrompt(data.inmail_prompt || "");
          setUseResume(data.use_resume || false);
          setUseJobdesc(data.use_jobdesc || false);
          setUseContext(data.use_context_files || false);
          setApiKeyEncrypted(data.openai_api_key || "");
          setActiveResumeId(data.active_resume_id || null);
          setActiveJobdescId(data.active_jobdesc_id || null);
        }
      });
    // Load files
    supabase
      .from("user_context_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setFiles(data || []));
  }, [user, status]); // reload when status changes (eg, after upload)

  const encryptApiKey = (plain: string) => {
    return CryptoJS.AES.encrypt(plain, user.id).toString();
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      const {error } = await supabase.auth.signInWithOAuth({
        provider: "google"
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in failed");
    }
  };

  // Save preferences + active file ids
  const handleSave = async () => {
    setStatus("Saving...");
    const upsert = {
      user_id: user.id,
      note_prompt: notePrompt,
      email_prompt: emailPrompt,
      inmail_prompt: inmailPrompt,
      use_resume: useResume,
      use_jobdesc: useJobdesc,
      use_context_files: useContext,
      openai_api_key: apiKey ? encryptApiKey(apiKey) : apiKeyEncrypted,
      jobdesc_text: jobdescText,
      active_resume_id: activeResumeId,
      active_jobdesc_id: activeJobdescId,
    };
    const { error } = await supabase.from("user_preferences").upsert([upsert], { onConflict: "user_id" });
    setStatus(error ? "Failed to save!" : "Saved!");
    setApiKey(""); // Clear input for security
  };

  // File upload
  const handleFileUpload = async () => {
  if (!uploadFile || !user) return;
  
  setStatus("Uploading file...");
  try {
    const ext = uploadFile.name.split(".").pop();
    const path = `${fileType}s/user_${user.id}/${fileType}_${Date.now()}.${ext}`;
    const bucket = fileType === "resume" ? "resumes" : 
                  fileType === "jobdesc" ? "jobdescs" : 
                  "context";

    // 1. Upload file to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucket)
      .upload(path, uploadFile, { 
        upsert: false,
        contentType: uploadFile.type,
        cacheControl: '3600'
      });

    if (storageError) {
      throw storageError;
    }

    // 2. Insert file record
    const { data: dbData, error: dbError } = await supabase
      .from("user_context_files")
      .insert([{
        user_id: user.id,
        file_type: fileType,
        file_name: uploadFile.name,
        file_url: storageData.path,
        storage_path: path,
        is_active: true,
        metadata: {},
      }])
      .select(); // Add this to get the inserted record

    if (dbError) {
      // If DB insert fails, try to delete the uploaded file
      await supabase.storage.from(bucket).remove([path]);
      throw dbError;
    }

    setStatus("File uploaded successfully!");
    setUploadFile(null);
    // Update files list with the new file
    setFiles(prev => [dbData[0], ...prev]);
    
  } catch (error: any) {
    console.error("Upload error:", error);
    setStatus(`Upload failed: ${error.message}`);
  }
};

  // Set active file
  const handleSetActive = (type: "resume" | "jobdesc", id: string) => {
    if (type === "resume") setActiveResumeId(id);
    else if (type === "jobdesc") setActiveJobdescId(id);
    setStatus("Active file changed. Don't forget to save preferences!");
  };

  const handleAuth = async () => {
    setAuthError("");
    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
      } else {
        const {error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthMode("login");
        setAuthError("Check your email for a verification link, then log in.");
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "40px auto" }}>
        <h2>{authMode === "login" ? "Login" : "Sign Up"}</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", marginBottom: 8 }} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", marginBottom: 8 }} />
        <button onClick={handleAuth} style={{ width: "100%", marginBottom: 8 }}>
          {authMode === "login" ? "Log In" : "Sign Up"}
        </button>
        <button onClick={handleGoogleSignIn} style={{ width: "100%", marginBottom: 8, background: "#fff", border: "1px solid #ddd" }}>
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="" style={{ width: 18, marginRight: 8, verticalAlign: "middle" }} />
          Sign in with Google
        </button>
        <div>
          {authMode === "login"
            ? <span>Don't have an account? <a href="#" onClick={() => setAuthMode("signup")}>Sign up</a></span>
            : <span>Already have an account? <a href="#" onClick={() => setAuthMode("login")}>Log in</a></span>
          }
        </div>
        {authError && <div style={{ color: "red", marginTop: 8 }}>{authError}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Settings Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div>
        <label>OpenAI API Key (encrypted):</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder={apiKeyEncrypted ? "API key is saved. Enter to update." : "sk-..."}
          style={{ width: "100%" }}
          autoComplete="off"
        />
      </div>
      <div>
        <h4>Custom Prompts</h4>
        <label>Note Prompt</label>
        <textarea value={notePrompt} onChange={e => setNotePrompt(e.target.value)} style={{ width: "100%" }} />
        <label>Email Prompt</label>
        <textarea value={emailPrompt} onChange={e => setEmailPrompt(e.target.value)} style={{ width: "100%" }} />
        <label>InMail Prompt</label>
        <textarea value={inmailPrompt} onChange={e => setInmailPrompt(e.target.value)} style={{ width: "100%" }} />
        <label>Job Description (plain text):</label>
        <textarea value={jobdescText} onChange={e => setJobdescText(e.target.value)} style={{ width: "100%", minHeight: 80, marginBottom: 10 }} />
      </div>

      <div>
        <h4>Context Files</h4>
        <div>
          <input type="checkbox" checked={useResume} onChange={e => setUseResume(e.target.checked)} /> Use Resume
          <input type="checkbox" checked={useJobdesc} onChange={e => setUseJobdesc(e.target.checked)} /> Use Job Desc
          <input type="checkbox" checked={useContext} onChange={e => setUseContext(e.target.checked)} /> Use Other Context Files
        </div>
        <select value={fileType} onChange={e => setFileType(e.target.value)}>
          <option value="resume">Resume</option>
          <option value="jobdesc">Job Description</option>
          <option value="context">Context</option>
        </select>
        <input type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
        <button onClick={handleFileUpload}>Upload File</button>
      </div>

      <div>
        <h4>Your Uploaded Files</h4>
        <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Path</th>
              <th>Active?</th>
              <th>Set Active</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f, i) => (
              <tr key={i} style={{ background: i % 2 ? "#f5f5f5" : "#fff" }}>
                <td>{f.file_type}</td>
                <td>{f.file_name}</td>
                <td>{f.file_url}</td>
                <td>
                  {(f.file_type === "resume" && f.id === activeResumeId) ? "✔️" :
                    (f.file_type === "jobdesc" && f.id === activeJobdescId) ? "✔️" : ""}
                </td>
                <td>
                  {(f.file_type === "resume" &&
                    <button onClick={() => handleSetActive("resume", f.id)} disabled={f.id === activeResumeId}>Set as Resume</button>
                  )}
                  {(f.file_type === "jobdesc" &&
                    <button onClick={() => handleSetActive("jobdesc", f.id)} disabled={f.id === activeJobdescId}>Set as JD</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleSave} style={{ marginTop: 16 }}>Save Preferences</button>
      <div>{status}</div>
    </div>
  );
};

export default Dashboard;