// chrome-ext/src/api.ts
export async function generateNote(name, headline) {
    if (!name && !headline) {
        return "Could not fetch profile info. Please reload the LinkedIn profile.";
    }
    // Try to keep it warm, human, and < 300 chars
    return `Hi ${name}, I came across your profile${headline ? ` (${headline})` : ""} and am genuinely interested in your background. Would love to connect and learn more!`;
}
