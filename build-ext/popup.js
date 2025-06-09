// import React, { useState } from "react";
// import { createRoot } from "react-dom/client";
// import { generateNote } from "./api";
// const Popup = () => {
//   const [profile, setProfile] = useState({ name: "", headline: "" });
//   const [note, setNote] = useState("");
//   const [loading, setLoading] = useState(false);
//   // Scrape profile info from LinkedIn tab
//   const fetchProfileInfo = async () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
//       chrome.scripting.executeScript(
//         {
//           target: { tabId: tab.id! },
//           func: () => {
//             // Adjust selectors as per LinkedIn's DOM
//             const name = document.querySelector(".text-heading-xlarge")?.textContent?.trim() || "";
//             const headline = document.querySelector(".text-body-medium")?.textContent?.trim() || "";
//             return { name, headline };
//           },
//         },
//         (injectionResults) => {
//           const [{ result }] = injectionResults;
//           if (result) setProfile(result);
//             else {
//                 setProfile({ name: "", headline: "" });
//                 alert("Could not fetch profile info. Please reload the LinkedIn profile.");
//             }
//         }
//       );
//     });
//   };
//   const handleGenerate = async () => {
//     setLoading(true);
//     await fetchProfileInfo();
//     // Delay to ensure state is updated
//     setTimeout(async () => {
//       const note = await generateNote(profile.name, profile.headline);
//       setNote(note);
//       setLoading(false);
//     }, 600);
//   };
//   return (
//     <div style={{ minWidth: 320, padding: 20 }}>
//       <h3>LinkedIn Note Generator</h3>
//       <button onClick={handleGenerate} disabled={loading}>
//         {loading ? "Generating..." : "Generate Note"}
//       </button>
//       {note && (
//         <>
//           <textarea value={note} readOnly rows={4} style={{ width: "100%", marginTop: 10 }} />
//           <div style={{ marginTop: 5, color: note.length > 300 ? "red" : "green" }}>
//             {note.length} / 300 characters
//           </div>
//         </>
//       )}
//     </div>
//   );
// };
// const root = createRoot(document.getElementById("root")!);
// root.render(<Popup />);
import React from "react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { generateNote } from "./api";
// Utility: Scrape LinkedIn profile info
function scrapeLinkedInProfile() {
    // More robust selectors
    const name = document.querySelector(".text-heading-xlarge")?.textContent?.trim() ||
        "";
    // Try two headline selectors, just in case
    const headline = (document.querySelector(".text-body-medium.break-words")?.textContent ||
        document.querySelectorAll(".text-body-medium")[1]?.textContent ||
        "").trim();
    return { name, headline };
}
const Popup = () => {
    const [profile, setProfile] = useState({ name: "", headline: "" });
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const handleGenerate = async () => {
        setError("");
        setNote("");
        setCopied(false);
        setLoading(true);
        // Run content script to scrape LinkedIn profile info from current tab
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: scrapeLinkedInProfile,
            }, (injectionResults) => {
                if (chrome.runtime.lastError ||
                    !injectionResults ||
                    !injectionResults[0].result) {
                    setError("Could not extract profile info. Are you on a LinkedIn profile page?");
                    setLoading(false);
                    return;
                }
                const { name, headline } = injectionResults[0].result;
                if (!name) {
                    setError("Could not find the name on this page. Try refreshing or check the profile page.");
                    setLoading(false);
                    return;
                }
                setProfile({ name, headline });
                // Call note generator (mock or backend)
                generateNote(name, headline).then((n) => {
                    setNote(n);
                    setLoading(false);
                });
            });
        });
    };
    const handleCopy = () => {
        navigator.clipboard.writeText(note);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };
    return (React.createElement("div", { style: { minWidth: 320, padding: 18, fontFamily: "Segoe UI, Arial" } },
        React.createElement("h3", { style: { margin: 0 } }, "LinkedIn Note Generator"),
        React.createElement("button", { onClick: handleGenerate, disabled: loading, style: {
                marginTop: 14,
                width: "100%",
                padding: 8,
                fontWeight: "bold",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#0073b1",
                color: "#fff",
                cursor: "pointer",
            } }, loading ? "Generating..." : "Generate Note"),
        error && (React.createElement("div", { style: { color: "red", marginTop: 12, fontSize: 14 } }, error)),
        note && (React.createElement(React.Fragment, null,
            React.createElement("textarea", { value: note, readOnly: true, rows: 4, style: {
                    width: "100%",
                    marginTop: 12,
                    fontSize: 15,
                    borderRadius: 4,
                    border: "1px solid #bbb",
                    padding: 8,
                    resize: "none",
                } }),
            React.createElement("div", { style: { marginTop: 5, display: "flex", alignItems: "center" } },
                React.createElement("span", { style: {
                        color: note.length > 300 ? "red" : "green",
                        fontSize: 13,
                    } },
                    note.length,
                    " / 300 characters"),
                React.createElement("button", { onClick: handleCopy, style: {
                        marginLeft: "auto",
                        padding: "3px 12px",
                        borderRadius: 5,
                        background: "#eee",
                        border: "1px solid #ccc",
                        fontSize: 13,
                        cursor: "pointer",
                    } }, copied ? "Copied!" : "Copy")))),
        React.createElement("div", { style: { marginTop: 12, fontSize: 11, color: "#666" } }, "Make sure to personalize your note before sending.")));
};
const root = createRoot(document.getElementById("root"));
root.render(React.createElement(Popup, null));
