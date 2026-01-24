import fs from "fs";
import os from "os";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Your data (using the provided JSON)
const recruiterData = {
  name: "Juktion Pvt Ltd",
  logo: "https://res.cloudinary.com/di1870vlc/image/upload/v1767951589/hirehuntai/logo/n1gnxmkwkjexehrrzako.jpg",
  address: {
    line: "192, Q.No. 23/5, LIG Colony Near Hasanbag Police Chowki, Nandanwan",
    city: "Nagpur",
    state: "Maharashtra",
    pinCode: "440009",
    country: "India"
  },
  admin: {
    name: "DEV MULKALWAR",
    email: "junktioncompany@gmail.com",
    phone: "9322259967",
    role: "Admin"
  },
  industry: "Junk Collection",
  companyType: "Startup",
  founded: "2022",
  headquarters: "Nagpur",
  website: "www.junktion.com",
  size: "11"
};

const jobData = {
  title: "Java Fullstack Developer",
  description: "We are seeking a Junior Full Stack Developer with 1-3 years of experience to join our growing team. The ideal candidate is passionate about building scalable web applications, thrives in a fast-paced environment, and enjoys working collaboratively with cross-functional teams. This role requires strong problem-solving skills, attention to detail, and a willingness to learn new technologies. You will be responsible for developing and maintaining both frontend and backend systems, collaborating with product teams, and ensuring code quality through testing and code reviews.",
  location: "Nagpur",
  workMode: "Onsite",
  employmentType: "Full-time",
  experienceLevel: "Mid",
  experienceYear: 4,
  salaryRange: {
    min: 700000,
    max: 799999,
    currency: "INR"
  },
  skills: ["java", "spring boot", "sql", "mysql", "devops"],
  openings: 1,
  postedAt: { "$date": "2026-01-17T08:38:27.683Z" },
  applicationDeadline: { "$date": "2026-01-28T18:30:00.000Z" }
};

// Candidate data for testing
const candidateData = {
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  phone: "+91 9876543210",
  address: {
    line: "123, Tech Park Apartments",
    city: "Pune",
    state: "Maharashtra",
    pinCode: "411001",
    country: "India"
  },
  experience: "3 years",
  currentCompany: "Tech Solutions Inc.",
  signatureImage: "https://res.cloudinary.com/di1870vlc/image/upload/v1767951589/hirehuntai/logo/n1gnxmkwkjexehrrzako.jpg"
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return "January 17, 2026";
  }
}

function formatRupees(amount) {
  return `Rs ${formatCurrency(amount)}`;
}

async function generateProfessionalOfferLetter() {
  try {
    console.log("Starting PDF generation...");
    
    const pdfDoc = await PDFDocument.create();
    const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // =================== PAGE 1 ===================
    const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page1.getSize();

    // Header Section
    let y = height - 50;
    
    // Company Name and Title
    page1.drawText(recruiterData.name, {
      x: 50,
      y: y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0.3, 0.6),
    });
    
    page1.drawText("OFFER OF EMPLOYMENT", {
      x: width / 2 - 80,
      y: y - 30,
      size: 20,
      font: boldFont,
      color: rgb(0, 0.2, 0.4),
    });
    
    y -= 70;
    
    // Date
    page1.drawText(`Date: ${formatDate(jobData.postedAt.$date)}`, {
      x: 50,
      y,
      size: 11,
      font: regularFont,
    });
    
    y -= 40;
    
    // To: Section
    page1.drawText("TO:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
    });
    
    y -= 25;
    page1.drawText(candidateData.name, {
      x: 50,
      y,
      size: 14,
      font: boldFont,
    });
    
    y -= 20;
    page1.drawText(candidateData.address.line, {
      x: 50,
      y,
      size: 11,
      font: regularFont,
    });
    
    y -= 15;
    page1.drawText(`${candidateData.address.city}, ${candidateData.address.state} - ${candidateData.address.pinCode}`, {
      x: 50,
      y,
      size: 11,
      font: regularFont,
    });
    
    y -= 15;
    page1.drawText(candidateData.address.country, {
      x: 50,
      y,
      size: 11,
      font: regularFont,
    });
    
    y -= 40;
    
    // Greeting
    page1.drawText(`Dear ${candidateData.name.split(' ')[0]},`, {
      x: 50,
      y,
      size: 12,
      font: regularFont,
    });
    
    y -= 30;
    
    // Introduction
    const introLines = [
      "We are delighted to extend an offer of employment to you for the position of",
      `${jobData.title} at ${recruiterData.name}.`,
      "",
      "After careful consideration of your qualifications and experience, we are confident",
      "that you will make a valuable contribution to our team and help us achieve our goals.",
      "",
      "This offer is subject to the terms and conditions outlined below:"
    ];

    introLines.forEach(line => {
      page1.drawText(line, {
        x: 50,
        y,
        size: 11,
        font: regularFont,
      });
      y -= 16;
    });

    y -= 20;

    // Position Details Box - FIXED: Using absolute positioning
    const boxY = y;
    page1.drawRectangle({
      x: 40,
      y: boxY - 160,
      width: 515,
      height: 170,
      color: rgb(0.96, 0.98, 1),
      borderColor: rgb(0, 0.3, 0.6),
      borderWidth: 1,
    });

    page1.drawText("OFFER DETAILS", {
      x: width / 2 - 40,
      y: boxY,
      size: 14,
      font: boldFont,
      color: rgb(0, 0.3, 0.6),
    });

    y = boxY - 30;

    const positionDetails = [
      `Position: ${jobData.title}`,
      `Department: Engineering`,
      `Location: ${jobData.location}`,
      `Work Mode: ${jobData.workMode}`,
      `Employment Type: ${jobData.employmentType}`,
      `Experience Level: ${jobData.experienceLevel}`,
      `Required Experience: ${jobData.experienceYear} years`,
      `Start Date: February 1, 2027`,
      `Probation Period: 3 months`,
    ];

    let detailY = y;
    positionDetails.forEach((line, index) => {
      const xPos = index < 5 ? 60 : 300;
      if (index === 5) detailY = y; // Reset for right column
      
      page1.drawText(line, {
        x: xPos,
        y: detailY,
        size: 11,
        font: regularFont,
      });
      detailY -= 18;
    });

    y = boxY - 190; // Reset y for next section

    // Compensation Section
    page1.drawText("COMPENSATION & BENEFITS", {
      x: width / 2 - 70,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0, 0.3, 0.6),
    });

    y -= 30;

    const compensationDetails = [
      `Annual Salary: ${formatRupees(jobData.salaryRange.min)} - ${formatRupees(jobData.salaryRange.max)}`,
      `Salary Frequency: Monthly`,
      `Performance Bonus: Up to 15% of annual salary`,
      `Benefits: Health Insurance, Provident Fund, Gratuity`,
      `Leave Policy: 18 Paid Leaves per year`,
      `Other Benefits: Flexible working hours, Skill development allowance`
    ];

    compensationDetails.forEach(line => {
      page1.drawText(line, {
        x: 50,
        y,
        size: 11,
        font: regularFont,
      });
      y -= 18;
    });

    // Make sure we have enough space for important notice
    y = Math.max(y, 150); // Ensure minimum space at bottom
    
    // IMPORTANT NOTICE BOX - FIXED POSITION
    const noticeBoxY = 120; // Fixed position from bottom
    page1.drawRectangle({
      x: 50,
      y: noticeBoxY - 40,
      width: 495,
      height: 40,
      color: rgb(1, 0.95, 0.9),
      borderColor: rgb(1, 0.8, 0.4),
      borderWidth: 1,
    });

    page1.drawText(`IMPORTANT: Please respond to this offer by ${formatDate(jobData.applicationDeadline.$date)}`, {
      x: 60,
      y: noticeBoxY - 25,
      size: 11,
      font: boldFont,
      color: rgb(0.8, 0.4, 0),
    });

    page1.drawText("Your offer will be considered withdrawn if we do not receive your acceptance by this date.", {
      x: 60,
      y: noticeBoxY - 40,
      size: 9,
      font: italicFont,
      color: rgb(0.6, 0.3, 0),
    });

    // Footer for Page 1 - FIXED POSITION
    const footerY = 50;
    page1.drawLine({
      start: { x: 50, y: footerY },
      end: { x: width - 50, y: footerY },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });

    page1.drawText(`Page 1 of 2 | ${recruiterData.name} | Confidential`, {
      x: 50,
      y: footerY - 15,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // =================== PAGE 2 ===================
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    y = height - 50;

    // Page 2 Header
    page2.drawText("TERMS & CONDITIONS", {
      x: width / 2 - 60,
      y,
      size: 18,
      font: boldFont,
      color: rgb(0, 0.3, 0.6),
    });

    y -= 40;

    // Job Description
    page2.drawText("JOB DESCRIPTION & RESPONSIBILITIES:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0.3, 0.6),
    });

    y -= 25;

    // Split description into paragraphs
    const description = jobData.description;
    const sentences = description.split('. ');
    let currentParagraph = '';
    const paragraphs = [];

    for (const sentence of sentences) {
      if ((currentParagraph + sentence).length > 100) {
        if (currentParagraph) paragraphs.push(currentParagraph + '.');
        currentParagraph = sentence;
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + sentence;
      }
    }
    if (currentParagraph) paragraphs.push(currentParagraph + '.');

    paragraphs.forEach(para => {
      const words = para.split(' ');
      let line = '';
      const lines = [];
      
      for (const word of words) {
        if ((line + ' ' + word).length > 80) {
          lines.push(line);
          line = word;
        } else {
          line = line ? line + ' ' + word : word;
        }
      }
      if (line) lines.push(line);
      
      lines.forEach(line => {
        page2.drawText(line, {
          x: 50,
          y,
          size: 10,
          font: regularFont,
        });
        y -= 14;
      });
      y -= 5; // Space between paragraphs
    });

    y -= 20;

    // Terms and Conditions
    page2.drawText("TERMS & CONDITIONS:", {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0.3, 0.6),
    });

    y -= 25;

    const terms = [
      "1. This offer is contingent upon satisfactory verification of your educational qualifications,",
      "   employment history, background checks, and references.",
      "2. You will be required to submit original documents for verification before joining.",
      "3. Employment is subject to a probation period of 3 months, which may be extended at",
      "   the company's discretion based on performance.",
      "4. During probation, either party may terminate employment with one week's notice.",
      "5. After confirmation, the notice period will be 30 days for resignation.",
      "6. You are required to maintain confidentiality of all company information during and",
      "   after your employment.",
      "7. You must comply with all company policies, rules, and regulations as amended from",
      "   time to time.",
      "8. Intellectual property created during employment belongs to the company.",
      "9. The company reserves the right to modify compensation and benefits as per business",
      "   requirements, with appropriate notice.",
      "10. This offer supersedes all previous discussions and agreements.",
      "11. Any disputes arising from this employment will be subject to the jurisdiction of",
      "    courts in Nagpur, Maharashtra."
    ];

    terms.forEach(line => {
      if (y < 250) {
        y -= 5;
      }
      page2.drawText(line, {
        x: 50,
        y,
        size: 9,
        font: regularFont,
      });
      y -= 13;
    });

    y -= 20;

    // =================== SIGNATURE SECTION ===================
    // Draw horizontal line
    page2.drawLine({
      start: { x: 50, y: 220 },
      end: { x: width - 50, y: 220 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Company Signature (Left side)
    page2.drawText("FOR " + recruiterData.name.toUpperCase(), {
      x: 50,
      y: 200,
      size: 11,
      font: boldFont,
      color: rgb(0, 0.3, 0.6),
    });

    page2.drawText("Authorized Signatory", {
      x: 50,
      y: 185,
      size: 10,
      font: boldFont,
    });

    // Draw signature line for company
    page2.drawLine({
      start: { x: 50, y: 170 },
      end: { x: 250, y: 170 },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });

    page2.drawText(recruiterData.admin.name, {
      x: 50,
      y: 155,
      size: 11,
      font: boldFont,
    });

    page2.drawText(recruiterData.admin.role, {
      x: 50,
      y: 140,
      size: 10,
      font: regularFont,
    });

    page2.drawText(`Date: ${formatDate(new Date().toISOString())}`, {
      x: 50,
      y: 125,
      size: 9,
      font: regularFont,
    });

    // Candidate Signature (Right side)
    page2.drawText("CANDIDATE ACCEPTANCE", {
      x: 350,
      y: 200,
      size: 11,
      font: boldFont,
      color: rgb(0, 0.3, 0.6),
    });

    page2.drawText("I accept the terms of this employment offer", {
      x: 350,
      y: 185,
      size: 9,
      font: regularFont,
    });

    // Signature line for candidate
    page2.drawLine({
      start: { x: 350, y: 155 },
      end: { x: 500, y: 155 },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page2.drawText("Signature", {
      x: 350,
      y: 145,
      size: 8,
      font: italicFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Draw line for candidate name
    page2.drawLine({
      start: { x: 350, y: 120 },
      end: { x: 500, y: 120 },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });

    page2.drawText(candidateData.name, {
      x: 350,
      y: 105,
      size: 11,
      font: boldFont,
    });

    page2.drawText(`Date: ________________`, {
      x: 350,
      y: 90,
      size: 9,
      font: regularFont,
    });

    // Footer for Page 2
    const footerY2 = 50;
    page2.drawLine({
      start: { x: 50, y: footerY2 },
      end: { x: width - 50, y: footerY2 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });

    const currentYear = new Date().getFullYear();
    page2.drawText(`© ${currentYear} ${recruiterData.name} | Page 2 of 2 | Offer Letter ID: JKT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, {
      x: 50,
      y: footerY2 - 15,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page2.drawText("This is an electronically generated document and is legally binding.", {
      x: 50,
      y: footerY2 - 30,
      size: 7,
      font: italicFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // =================== SAVE PDF ===================
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(
      os.homedir(),
      "Desktop",
      `Offer_Letter_${candidateData.name.replace(/\s+/g, '_')}.pdf`
    );

    fs.writeFileSync(outputPath, pdfBytes);

    console.log("\n" + "=".repeat(50));
    console.log("✅ PROFESSIONAL OFFER LETTER GENERATED!");
    console.log("=".repeat(50));
    console.log(`📁 File saved at: ${outputPath}`);
    console.log("\n📊 OFFER SUMMARY:");
    console.log("─".repeat(35));
    console.log(`🏢 Company: ${recruiterData.name}`);
    console.log(`💼 Position: ${jobData.title}`);
    console.log(`👤 Candidate: ${candidateData.name}`);
    console.log(`💰 Salary: ${formatRupees(jobData.salaryRange.min)} - ${formatRupees(jobData.salaryRange.max)}/year`);
    console.log(`📍 Location: ${jobData.location}`);
    console.log(`📅 Offer Date: ${formatDate(jobData.postedAt.$date)}`);
    console.log(`⏰ Response Due: ${formatDate(jobData.applicationDeadline.$date)}`);
    console.log(`📄 Pages: 2`);
    console.log("─".repeat(35));
    console.log("✅ PDF generation completed successfully!");
    console.log("=".repeat(50));
    
  } catch (err) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ ERROR GENERATING PDF:");
    console.error("=".repeat(50));
    console.error("Error:", err.message);
    console.error("\n💡 Troubleshooting Tips:");
    console.error("1. The important notice box is now at fixed position (y=120)");
    console.error("2. Footer is at fixed position (y=50)");
    console.error("3. Using TimesRoman fonts for better compatibility");
    console.error("=".repeat(50));
  }
}

// Run the generator
generateProfessionalOfferLetter();