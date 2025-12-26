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
              "jobDesc": ""
            }
          ],
          "atsScore": 0,
          "skills": [""]
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

      If platform present but URL missing → url: ""

      Education

      eduType ∈ SSC | HSC | UG | PG | Diploma

      Percentage → isCGPA: false

      CGPA → isCGPA: true

      Experience

      Only professional jobs

      ❌ Exclude projects, hackathons, academics

      Skills

      Mongodb Array of strings

      Normalize casing, remove duplicates

      totalExperienceDuration → years (number), else 0

      📊 ATS Score (0–100)

      Store result in resume.atsScore.

      Weights:

      Skills: 40

      Experience: 30

      Education: 15

      Certifications: 10

      Resume completeness: 5

      Rules:

      Integer only

      Max 100

      No explanation

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
