import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

export const LoadResume = async (resume) => {
  const parser = new PDFParse({ url: resume });
  const res = parser.getText();
  await parser.destroy();
  return new Resume((await res).text);
};

export class Resume {
  text;
  constructor(text) {
    this.text = text;
  }
  async extractJson() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      You are an information extraction engine.

      Extract structured data from a raw resume text, calculate an ATS score, and return ONLY one valid JSON document matching the schema below.

      🎯 Target JSON Schema (STRICT)
      {
        "resume": {
          "socials": [
            { "name": "", "url": "" }
          ],
          "education": [
            {
              "eduType": "",
              "instituteName": "",
              "course": "",
              "score": 0,
              "isCGPA": false,
              "yearOfComp": 0
            }
          ],
          "certifications": [
            {
              "name": "",
              "provider": "",
              "url": "",
              "yearOfComp": 0
            }
          ],
          "experience": [
            {
              "jobTitle": "",
              "jobDesc": "",
              "months": 0
            }
          ],
          "projects": [
            {
              "title": "",
              "description": "",
              "url": "",
              "technologies": [""]
            }
          ],
          "atsScore": 0,
          "skills": [""]
        },
        "address": {
          "line": "",
          "city": "",
          "state": "",
          "pinCode": "",
          "country": ""
        },
        "dateOfBirth": "",
        "totalExperienceDuration": 0
      }

      🔒 Mandatory Rules

      Output ONLY valid JSON

      ❌ No markdown, explanations, or extra text

      ❌ No extra fields

      Missing values:

      string → ""

      number → 0

      boolean → false

      array → []

      Numbers must be numbers, not strings

      Never guess or hallucinate data

      📌 Field Rules

      Socials

      name ∈ leetcode | linkedin | github | others

      If platform present but URL missing → don't add that social media to the array

      If the url contains scheme of the protocol (eg. 'http://', 'https://') remove that from the actual url string

      Education

      eduType ∈ SSC | HSC | UG | PG | Diploma

      Percentage → isCGPA: false

      CGPA → isCGPA: true

      Experience

      Only professional jobs

      ❌ Exclude projects, hackathons, academics

      Projects

      Extract personal, academic, open-source, freelance, and professional projects into resume.projects

      title is required for each project; if title is missing, skip that project

      description should summarize what was built and impact/responsibility in 1-3 lines

      technologies should be an array of normalized skill/tool names with duplicates removed

      If the url contains scheme of the protocol (eg. 'http://', 'https://') remove that from the actual url string

      Skills
      Extract a list of skills mentioned in the resume.
      Ensure that the extracted skills closely match common professional skill labels (e.g., "JavaScript", "React", "Node.js", "Python", "SQL", "AWS").
      The output should be an array of strings.
      Normalize casing (e.g., capitalize the first letter of each word or use common conventions like "JavaScript" instead of "javascript") and remove duplicates.

      totalExperienceDuration → years (number), else 0

      📊 ATS Score (0–100)

      Evaluate the resume and compute an ATS score from 0–100, storing the result in resume.atsScore.

      Use these weights and calibration:

      Skills & Keyword Match — 30
        - Match of technical, role, and tool keywords vs job requirements.

      Relevant Experience & Projects — 25
        - Include internships, academic projects, and personal projects as valid experience, especially for entry-level roles.

      Role Fit & Impact — 15
        - Quality of projects, responsibilities, outcomes, and problem-solving.

      Resume Completeness & Structure — 15
        - Presence of summary, skills, projects/experience, education, contact info, clean formatting.

      Education — 10
        - Degree relevance, academic performance, institution credibility.

      Certifications — 5
        - Relevance and quality.

      Scoring calibration:

      Strong entry-level resumes should score 75–85

      Excellent profiles should reach 85–95

      Avoid compressing most candidates into 50–65

      Final ATS Score = sum of all sections (0–100).

      Rules:

      Integer only

      Max 100

      No explanation

      📊 Address

      Stores following object in address key

      1. line: actual address (eg. house number, landmark, etc.)
      2. city: stores name of the city
      3. state: stores the name of the state mentioned in the Resume
      4. pinCode: stores the zip code of the candidate mentioned in the Resume
      5. country: stores the name of the country the candidate has mentioned on the resume

      Rules:

      Address should store only the address of the resume holder.
      If address is not provided on the resume, it should be initialized with empty string (eg. "address.line" = "")

      🔽 Input

      You will receive raw resume text.
      Extract data, calculate ATS, and return JSON only.
      NOTE: DO NOT ADD MARKDOWN CODE FENCE

TEXT:
`;
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt + this.text,
    });
    try {
      if (typeof res.text === "undefined") {
        throw Error("Promise is unresolved");
      }
      const newJson = res.text
        .replace(/```json\s*/i, "")
        .replace(/```$/, "")
        .trim();
      return JSON.parse(newJson);
    } catch (err) {
      console.error("Invalid AI JSON:", err);
      return null;
    }
  }
  getText() {
    return this.text;
  }
}
