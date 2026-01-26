import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

/**
 * @param {string} jobTitle
 * @param {string} jobDescription
 */
async function getQuestions(jobTitle, jobDescription) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log(process.env.GEMINI_API_KEY);
  const prompt = `
    Act as an expert interviewer and curriculum designer for the role of: ${jobTitle} - ${jobDescription}.

    Your task is to generate 15 interview questions that test a candidate's depth of knowledge.

    The difficulty must progress as follows:
    - Questions 1-5: Low Difficulty (Basic concepts)
    - Questions 6-10: Medium Difficulty (Application and edge cases)
    - Questions 11-15: High Difficulty (Complex scenarios and architectural thinking)

    You must return the output as a strict JSON array. The JSON object structure for each item must match this exact format:
    {
      "text": "The question string",
      "modelAnswer": "A concise, ideal answer used for grading",
      "score": <INTEGER>
    }

    Score Rules:
    - Assign a score integer between 5 and 10 for each question.
    - Low difficulty questions should range from 5-6 points.
    - Medium difficulty questions should range from 7-8 points.
    - High difficulty questions should range from 9-10 points.

    Ensure the content is technical, precise, and unambiguous. Do not include markdown formatting (like \`\`\`json), just the raw array.
    `;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  try {
    if (typeof res.text === "undefined") {
      throw Error("Promise is unresolved");
    }
    const questions = res.text
      .replace(/```json\s*/i, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(questions);
  } catch (err) {
    console.error("Invalid AI JSON:", err);
    return null;
  }
}

export default getQuestions;
