import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

/**
* @param {string} jobTitle
* @param {string} jobDescription
* @param {Array<string>}
* @description This function generates a list of interview questions for a given job title and description.
* @returns {Promise<JSON[]>}
*/
async function getQuestions(jobTitle, jobDescription, requiredSkills) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log(process.env.GEMINI_API_KEY);

  const prompt = `
    Act as an expert interviewer and industrial psychologist for the role of: ${jobTitle}.

    Job Context: ${jobDescription}
    Required Skills: ${requiredSkills.join(', ')}

    Your task is to generate exactly 15 questions for the candidadte for the purpose of interview.

    Structure the questions as follows:
    1.  **Question 1:** MUST be "Tell me about yourself and your background relevant to this role."
    2.  **Questions 2-6:** Technical Competency (Low to Medium difficulty). Basic concepts and standard practices.
    3.  **Questions 7-10:** Advanced Engineering & Scenarios (High difficulty). System design, edge cases, and complex problem-solving.
    4.  **Questions 11-12:** Logic Building (Medium difficulty). Analytical thinking, scientific thinking
    5.  **Questions 13-15:** Behavioral & Psychology (HR) questions. Focus on work ethic, conflict resolution, and cultural fit.

    You must return the output as a strict JSON array. The JSON object structure for each item must match this exact format:
    {
    "text": "The question string",
    "modelAnswer": "A concise, ideal answer or key points to look for",
    "score": <INTEGER>
    }

    Score Rules:
    - Assign a score integer between 5 and 10 based on the complexity of a good answer.
    - Intro/HR questions: 5-6 points.
    - Technical questions: Scale from 7 up to 10 points for the hardest ones.

    Required Skills Rules:
    - The listed required skills may vary from job title and job description
    - Don't ignore the required skills since they are also important
    - Required Skills are provided by recruiter to prepare questions

    Question Rules:
    - The questions should be therotical not practical
    - The questions should test candidate's knowledge, not practical skills.

    Ensure the content is professional, precise, and unambiguous. Do not include markdown formatting (like \`\`\`json), just the raw JSON array.
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
