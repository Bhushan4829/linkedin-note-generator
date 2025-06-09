"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
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
const react_1 = require("react");
const client_1 = require("react-dom/client");
const api_1 = require("./api");
// Utility: Scrape LinkedIn profile info
function scrapeLinkedInProfile() {
    var _a, _b, _c, _d;
    // More robust selectors
    const name = ((_b = (_a = document.querySelector(".text-heading-xlarge")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) ||
        "";
    // Try two headline selectors, just in case
    const headline = (((_c = document.querySelector(".text-body-medium.break-words")) === null || _c === void 0 ? void 0 : _c.textContent) ||
        ((_d = document.querySelectorAll(".text-body-medium")[1]) === null || _d === void 0 ? void 0 : _d.textContent) ||
        "").trim();
    return { name, headline };
}
const Popup = () => {
    const [profile, setProfile] = (0, react_1.useState)({ name: "", headline: "" });
    const [note, setNote] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [copied, setCopied] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const handleGenerate = () => __awaiter(void 0, void 0, void 0, function* () {
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
                (0, api_1.generateNote)(name, headline).then((n) => {
                    setNote(n);
                    setLoading(false);
                });
            });
        });
    });
    const handleCopy = () => {
        navigator.clipboard.writeText(note);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { minWidth: 320, padding: 18, fontFamily: "Segoe UI, Arial" }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 0 }, children: "LinkedIn Note Generator" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleGenerate, disabled: loading, style: {
                    marginTop: 14,
                    width: "100%",
                    padding: 8,
                    fontWeight: "bold",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: "#0073b1",
                    color: "#fff",
                    cursor: "pointer",
                }, children: loading ? "Generating..." : "Generate Note" }), error && ((0, jsx_runtime_1.jsx)("div", { style: { color: "red", marginTop: 12, fontSize: 14 }, children: error })), note && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("textarea", { value: note, readOnly: true, rows: 4, style: {
                            width: "100%",
                            marginTop: 12,
                            fontSize: 15,
                            borderRadius: 4,
                            border: "1px solid #bbb",
                            padding: 8,
                            resize: "none",
                        } }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 5, display: "flex", alignItems: "center" }, children: [(0, jsx_runtime_1.jsxs)("span", { style: {
                                    color: note.length > 300 ? "red" : "green",
                                    fontSize: 13,
                                }, children: [note.length, " / 300 characters"] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCopy, style: {
                                    marginLeft: "auto",
                                    padding: "3px 12px",
                                    borderRadius: 5,
                                    background: "#eee",
                                    border: "1px solid #ccc",
                                    fontSize: 13,
                                    cursor: "pointer",
                                }, children: copied ? "Copied!" : "Copy" })] })] })), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 12, fontSize: 11, color: "#666" }, children: "Make sure to personalize your note before sending." })] }));
};
const root = (0, client_1.createRoot)(document.getElementById("root"));
root.render((0, jsx_runtime_1.jsx)(Popup, {}));
