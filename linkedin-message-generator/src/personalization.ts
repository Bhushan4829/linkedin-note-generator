// personalization.ts
export interface PersonalizationInputs {
  type: "note" | "email" | "inmail";
  template: string;
  profile: { name: string; headline: string };
  jobdesc: string;
  customPrompt: string;
  additionalContext: string
}

/**
 * Build the “question” payload from all the bits of context.
 */
export function buildQuestion({
  type,
  template,
  profile: { name, headline },
  customPrompt,
  additionalContext
}: PersonalizationInputs): string {
  return `
-- Message Type: ${type}
-- Template:
${template}

-- Profile:
Name: ${name}
Headline: ${headline}

-- Custom Prompt:
${customPrompt || "N/A"}

-- Additional Context:
${additionalContext || "N/A"}
`.trim();
}

/**
 * Call your existing Groq-based /api/chat endpoint.
 */
export async function generateViaGroq(inputs: PersonalizationInputs): Promise<string> {
  const question = buildQuestion(inputs);
  const res = await fetch("http://localhost:7999/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, job_description: inputs.jobdesc })
  });
  const json = await res.json();
  return json.response;
}

/**
 * Call a new ChatGPT-backed personalization endpoint.
 * (You’d add this to your FastAPI server, same URL but toggled model internally.)
 */
export async function generateViaChatGPT(inputs: PersonalizationInputs): Promise<string> {
  const question = buildQuestion(inputs);
  const res = await fetch("https://job-aware-api.onrender.com/api/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      job_description: inputs.jobdesc
    })
  });
  const json = await res.json();
  return json.response;
}
