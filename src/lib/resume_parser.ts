import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";

export const LoadResume = async (resume: string): Promise<Resume> => {
    const parser = new PDFParse({ url: resume })

    const res = parser.getText();
    await parser.destroy();
    return new Resume((await res).text);
}

export class Resume {
    constructor(private readonly text: string) { }

    async extractJson() {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an information extraction engine.\n\nYour task is to extract structured data from a **raw resume text** and return **only one valid JSON document** that strictly matches the following MongoDB/Mongoose schema.\n\n---\n\n## 🎯 Target Output Schema\n\n⚠️ **Do NOT add, remove, rename, or restructure any fields**\n\`\`\`json\n{\n"bio": "",\n"resume": {\n"resumeUrl": "",\n"socials": [\n{\n"name": "",\n"url": ""\n}\n],\n"education": [\n{\n"eduType": "",\n"instituteName": "",\n"course": "",\n"score": 0,\n"isCGPA": false,\n"yearOfComp": 0\n}\n],\n"certifications": [\n{\n"name": "",\n"provider": "",\n"url": "",\n"yearOfComp": 0\n}\n],\n"experience": [\n{\n"jobTitle": "",\n"jobDesc": ""\n}\n],\n"atsScore": 0\n},\n"dateOfBirth": "",\n"mobileNo": 0,\n"atsScore": 0,\n"appliedJobs": [],\n"totalExperienceDuration": 0,\n"skills": []\n}\n\n\`\`\`\n\n---\n\n\n## 🔒 Mandatory Extraction Rules\n\n### 1. **Output Rules**\n\n* ✅ Output **ONLY valid JSON**\n* ❌ No explanations\n* ❌ No markdown\n* ❌ No comments\n* ❌ No extra text before or after JSON\n\n---\n\n### 2. **Missing or Unavailable Fields**\n\n* **String fields** → \`""\`\n* **Number fields** → \`0\`\n* **Boolean fields** → \`false\`\n* **Array fields** → \`[]\`\n* ❌ Never guess or infer missing data\n\n---\n\n### 3. **Strict Data Types**\n\n* All numeric fields **MUST be numbers**, never strings:\n\n* \`score\`\n* \`yearOfComp\`\n* \`mobileNo\`\n* \`totalExperienceDuration\`\n* \`isCGPA\` **must be boolean**\n\n---\n\n### 4. **ATS Score Rule (IMPORTANT)**\n\n* \`resume.atsScore\` **must always be \`0\`**\n* Root-level \`atsScore\` **must always be \`0\`**\n* ❌ Never calculate, infer, or extract ATS score from text\n\n---\n\n### 5. **Bio (\`bio\`)**\n\n* Populate from:\n\n* Profile summary\n* About section\n* Professional overview\n* Keep it concise and factual\n* Set character limit of 255 characters * If not present → \`""\`\n\n---\n\n### 6. **Social Links (\`resume.socials\`)**\n\n* Allowed \`name\` values ONLY:\n\n* \`"leetcode"\`, \`"linkedin"\`, \`"github"\`, \`"others"\`\n* If platform name is present but **URL is missing or implied**\n\n* Set \`"url": ""\`\n* If platform cannot be identified → \`"others"\`\n* ❌ Do not fabricate URLs\n\n---\n\n### 7. **Education Mapping**\n\n* \`eduType\` must be exactly one of:\n\n* \`SSC\`, \`HSC\`, \`UG\`, \`PG\`, \`Diploma\`\n* If education level is unclear → **exclude that entry**\n* \`score\`:\n\n* Numeric only\n* Percentage → \`isCGPA: false\`\n* CGPA → \`isCGPA: true\`\n* Unknown → \`score: 0\`, \`isCGPA: false\`\n* \`yearOfComp\` → completion year only (number)\n\n---\n\n### 8. **Experience**\n\n* Include **only professional work experience**\n* ❌ Do NOT include:\n\n* Academic projects\n* Hackathons\n* College final-year projects\n* \`jobDesc\` should be a concise merged summary of responsibilities\n\n---\n\n### 9. **Skills**\n\n* Populate **only the root-level \`skills\`**\n* Extract from:\n\n* Technical skills\n* Tools\n* Languages\n* Frameworks\n* Normalize casing (e.g., \`React.js\`, \`MongoDB\`)\n* Avoid duplicates\n\n---\n\n### 10. **Resume URL**\n\n* Always return \`""\` unless explicitly provided\n\n---\n\n### 11. **Date & Phone Rules**\n\n* \`dateOfBirth\`:\n\n* Empty string unless explicitly stated\n* \`mobileNo\`:\n\n* Exactly 10 digits\n* Remove country code, spaces, symbols\n* If missing → \`0\`\n\n---\n\n## ✅ Final Validation Checklist (Before Responding)\n\n* ✔ JSON only\n* ✔ Exact schema match\n* ✔ \`resume.skills\` NOT present\n* ✔ ATS scores always \`0\`\n* ✔ Correct data types\n* ✔ No hallucinated data\n* ✔ No extra keys\n\n---\n\n### 🔽 Input\n\nYou will now receive a **raw resume text**.\nExtract and return the JSON strictly following all rules above.\nNOTE: DO NOT ADD MARKDOWN CODE FENCE\n\nTEXT:\n`

        const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt + this.text
        });

        try {
            if (typeof (res.text) === 'undefined') {
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

