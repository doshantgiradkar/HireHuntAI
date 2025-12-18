import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";

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
        const prompt = `You are an information extraction engine.

Your task is to extract structured data from a **raw resume text** and return **only one valid JSON document** that strictly matches the following MongoDB/Mongoose schema.

---

## \uD83C\uDFAF Target Output Schema

⚠️ **Do NOT add, remove, rename, or restructure any fields**
\`\`\`json
{
"bio": "",
"resume": {
"resumeUrl": "",
"socials": [
{
"name": "",
"url": ""
}
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
"atsScore": 0
},
"dateOfBirth": "",
"mobileNo": 0,
"atsScore": 0,
"appliedJobs": [],
"totalExperienceDuration": 0,
"skills": []
}

\`\`\`

---


## \uD83D\uDD12 Mandatory Extraction Rules

### 1. **Output Rules**

* ✅ Output **ONLY valid JSON**
* ❌ No explanations
* ❌ No markdown
* ❌ No comments
* ❌ No extra text before or after JSON

---

### 2. **Missing or Unavailable Fields**

* **String fields** → \`""\`
* **Number fields** → \`0\`
* **Boolean fields** → \`false\`
* **Array fields** → \`[]\`
* ❌ Never guess or infer missing data

---

### 3. **Strict Data Types**

* All numeric fields **MUST be numbers**, never strings:

* \`score\`
* \`yearOfComp\`
* \`mobileNo\`
* \`totalExperienceDuration\`
* \`isCGPA\` **must be boolean**

---

### 4. **ATS Score Rule (IMPORTANT)**

* \`resume.atsScore\` **must always be \`0\`**
* Root-level \`atsScore\` **must always be \`0\`**
* ❌ Never calculate, infer, or extract ATS score from text

---

### 5. **Bio (\`bio\`)**

* Populate from:

* Profile summary
* About section
* Professional overview
* Keep it concise and factual
* Set character limit of 255 characters * If not present → \`""\`

---

### 6. **Social Links (\`resume.socials\`)**

* Allowed \`name\` values ONLY:

* \`"leetcode"\`, \`"linkedin"\`, \`"github"\`, \`"others"\`
* If platform name is present but **URL is missing or implied**

* Set \`"url": ""\`
* If platform cannot be identified → \`"others"\`
* ❌ Do not fabricate URLs

---

### 7. **Education Mapping**

* \`eduType\` must be exactly one of:

* \`SSC\`, \`HSC\`, \`UG\`, \`PG\`, \`Diploma\`
* If education level is unclear → **exclude that entry**
* \`score\`:

* Numeric only
* Percentage → \`isCGPA: false\`
* CGPA → \`isCGPA: true\`
* Unknown → \`score: 0\`, \`isCGPA: false\`
* \`yearOfComp\` → completion year only (number)

---

### 8. **Experience**

* Include **only professional work experience**
* ❌ Do NOT include:

* Academic projects
* Hackathons
* College final-year projects
* \`jobDesc\` should be a concise merged summary of responsibilities

---

### 9. **Skills**

* Populate **only the root-level \`skills\`**
* Extract from:

* Technical skills
* Tools
* Languages
* Frameworks
* Normalize casing (e.g., \`React.js\`, \`MongoDB\`)
* Avoid duplicates

---

### 10. **Resume URL**

* Always return \`""\` unless explicitly provided

---

### 11. **Date & Phone Rules**

* \`dateOfBirth\`:

* Empty string unless explicitly stated
* \`mobileNo\`:

* Exactly 10 digits
* Remove country code, spaces, symbols
* If missing → \`0\`

---

## ✅ Final Validation Checklist (Before Responding)

* ✔ JSON only
* ✔ Exact schema match
* ✔ \`resume.skills\` NOT present
* ✔ ATS scores always \`0\`
* ✔ Correct data types
* ✔ No hallucinated data
* ✔ No extra keys

---

### \uD83D\uDD3D Input

You will now receive a **raw resume text**.
Extract and return the JSON strictly following all rules above.
NOTE: DO NOT ADD MARKDOWN CODE FENCE

TEXT:
`;
        const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt + this.text
        });
        try {
            if (typeof res.text === "undefined") {
                throw Error("Promise is unresolved");
            }
            const newJson = res.text.replace(/```json\s*/i, "").replace(/```$/, "").trim();
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
