import fs from "fs";
import os from "os";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return "January 17, 2026";
  }
}

function formatRupees(amount) {
  return `Rs ${formatCurrency(amount)}`;
}

// Helper function to wrap text into lines
function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function generateOfferLetterPDF({
  recruiter,
  candidate,
  user,
  job,
  joiningDate,
  expiresAt,
}) {
  try {
    const recruiterData = recruiter;

    const candidateData = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      address: candidate.address || {
        line: "",
        city: "",
        state: "",
        pinCode: "",
        country: "India",
      },
    };

    const jobData = {
      ...(job.toObject?.() ?? job),

      postedAt: job.postedAt || new Date(),

      applicationDeadline: expiresAt || job.applicationDeadline,

      joiningDate,
    };

    console.log("Starting pixel-perfect PDF generation...");

    const pdfDoc = await PDFDocument.create();
    const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // A4 dimensions in points
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN_LEFT = 50;
    const MARGIN_RIGHT = 50;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

    // Color palette
    const PRIMARY_BLUE = rgb(0, 0.2, 0.4);
    const ACCENT_BLUE = rgb(0, 0.3, 0.6);
    const LIGHT_BLUE_BG = rgb(0.96, 0.98, 1);
    const BORDER_BLUE = rgb(0, 0.3, 0.6);
    const WARNING_BG = rgb(1, 0.95, 0.9);
    const WARNING_BORDER = rgb(1, 0.8, 0.4);
    const WARNING_TEXT = rgb(0.8, 0.4, 0);
    const GRAY_TEXT = rgb(0.5, 0.5, 0.5);
    const GRAY_LINE = rgb(0.7, 0.7, 0.7);

    // =================== PAGE 1 ===================
    const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - 50;

    // HEADER - Company Name
    page1.drawText(recruiterData.name, {
      x: MARGIN_LEFT,
      y: y,
      size: 18,
      font: boldFont,
      color: ACCENT_BLUE,
    });

    // TITLE - Centered
    const titleText = "OFFER OF EMPLOYMENT";
    const titleWidth = boldFont.widthOfTextAtSize(titleText, 20);
    page1.drawText(titleText, {
      x: (PAGE_WIDTH - titleWidth) / 2,
      y: y - 35,
      size: 20,
      font: boldFont,
      color: PRIMARY_BLUE,
    });

    y -= 75;

    // Date
    page1.drawText(`Date: ${formatDate(jobData.postedAt)}`, {
      x: MARGIN_LEFT,
      y: y,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    y -= 40;

    // TO Section
    page1.drawText("TO:", {
      x: MARGIN_LEFT,
      y: y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    y -= 22;
    page1.drawText(candidateData.name, {
      x: MARGIN_LEFT,
      y: y,
      size: 13,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    y -= 18;
    page1.drawText(candidateData.address.line, {
      x: MARGIN_LEFT,
      y: y,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    y -= 16;
    page1.drawText(
      `${candidateData.address.city}, ${candidateData.address.state} - ${candidateData.address.pinCode}`,
      {
        x: MARGIN_LEFT,
        y: y,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      },
    );

    y -= 16;
    page1.drawText(candidateData.address.country, {
      x: MARGIN_LEFT,
      y: y,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    y -= 35;

    // Greeting
    page1.drawText(`Dear ${candidateData.name.split(" ")[0]},`, {
      x: MARGIN_LEFT,
      y: y,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    y -= 25;

    // Introduction paragraph
    const introText = `We are delighted to extend an offer of employment to you for the position of ${jobData.title} at ${recruiterData.name}. After careful consideration of your qualifications and experience, we are confident that you will make a valuable contribution to our team and help us achieve our goals.`;

    const introLines = wrapText(introText, CONTENT_WIDTH, regularFont, 11);
    introLines.forEach((line) => {
      page1.drawText(line, {
        x: MARGIN_LEFT,
        y: y,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      y -= 16;
    });

    y -= 5;
    page1.drawText(
      "This offer is subject to the terms and conditions outlined below:",
      {
        x: MARGIN_LEFT,
        y: y,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      },
    );

    y -= 30;

    // OFFER DETAILS BOX
    const boxHeight = 170;
    const boxY = y;

    // Draw box background
    page1.drawRectangle({
      x: MARGIN_LEFT - 10,
      y: boxY - boxHeight,
      width: CONTENT_WIDTH + 20,
      height: boxHeight,
      color: LIGHT_BLUE_BG,
      borderColor: BORDER_BLUE,
      borderWidth: 1.5,
    });

    // Box title - centered
    const boxTitleText = "OFFER DETAILS";
    const boxTitleWidth = boldFont.widthOfTextAtSize(boxTitleText, 13);
    page1.drawText(boxTitleText, {
      x: (PAGE_WIDTH - boxTitleWidth) / 2,
      y: boxY - 20,
      size: 13,
      font: boldFont,
      color: ACCENT_BLUE,
    });

    // Position details in two columns
    let leftY = boxY - 45;
    let rightY = boxY - 45;
    const leftX = MARGIN_LEFT;
    const rightX = PAGE_WIDTH / 2 + 10;

    const leftDetails = [
      { label: "Position:", value: jobData.title },
      { label: "Department:", value: "Engineering" },
      { label: "Location:", value: jobData.location },
      { label: "Work Mode:", value: jobData.workMode },
      { label: "Employment Type:", value: jobData.employmentType },
    ];

    const rightDetails = [
      { label: "Experience Level:", value: jobData.experienceLevel },
      {
        label: "Required Experience:",
        value: `${jobData.experienceYear} years`,
      },
      {
        label: "Start Date:",
        value: formatDate(joiningDate),
      },
      { label: "Probation Period:", value: "3 months" },
    ];

    leftDetails.forEach((detail) => {
      page1.drawText(detail.label, {
        x: leftX,
        y: leftY,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      page1.drawText(detail.value, {
        x: leftX + boldFont.widthOfTextAtSize(detail.label, 10) + 5,
        y: leftY,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      leftY -= 18;
    });

    rightDetails.forEach((detail) => {
      page1.drawText(detail.label, {
        x: rightX,
        y: rightY,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      page1.drawText(detail.value, {
        x: rightX + boldFont.widthOfTextAtSize(detail.label, 10) + 5,
        y: rightY,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      rightY -= 18;
    });

    y = boxY - boxHeight - 25;

    // COMPENSATION SECTION
    const compTitleText = "COMPENSATION & BENEFITS";
    const compTitleWidth = boldFont.widthOfTextAtSize(compTitleText, 13);
    page1.drawText(compTitleText, {
      x: (PAGE_WIDTH - compTitleWidth) / 2,
      y: y,
      size: 13,
      font: boldFont,
      color: ACCENT_BLUE,
    });

    y -= 25;

    const compensationDetails = [
      {
        label: "Annual Salary:",
        value: `${formatRupees(jobData.salaryRange.min)} - ${formatRupees(jobData.salaryRange.max)}`,
      },
      { label: "Salary Frequency:", value: "Monthly (via bank transfer)" },
      {
        label: "Performance Bonus:",
        value: "Up to 15% of annual salary (based on performance)",
      },
      {
        label: "Health Insurance:",
        value: "Medical coverage for self and family",
      },
      { label: "Provident Fund:", value: "12% employer contribution" },
      { label: "Annual Leave:", value: "18 Paid Leaves + 12 Casual Leaves" },
    ];

    compensationDetails.forEach((detail) => {
      const labelWidth = boldFont.widthOfTextAtSize(detail.label, 10);
      page1.drawText(detail.label, {
        x: MARGIN_LEFT,
        y: y,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      const valueLines = wrapText(
        detail.value,
        CONTENT_WIDTH - labelWidth - 10,
        regularFont,
        10,
      );
      let valueY = y;
      valueLines.forEach((line, idx) => {
        page1.drawText(line, {
          x: MARGIN_LEFT + labelWidth + 5,
          y: valueY,
          size: 10,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        valueY -= 14;
      });

      y -= valueLines.length * 14 + 4;
    });

    // IMPORTANT NOTICE BOX - Fixed at 120 from bottom
    const noticeBoxY = 120;
    const noticeBoxHeight = 48;

    page1.drawRectangle({
      x: MARGIN_LEFT,
      y: noticeBoxY - noticeBoxHeight,
      width: CONTENT_WIDTH,
      height: noticeBoxHeight,
      color: WARNING_BG,
      borderColor: WARNING_BORDER,
      borderWidth: 1.5,
    });

    page1.drawText("", {
      x: MARGIN_LEFT + 10,
      y: noticeBoxY - 22,
      size: 14,
      font: boldFont,
      color: WARNING_TEXT,
    });

    page1.drawText(
      `IMPORTANT: Please respond to this offer by ${formatDate(expiresAt)}`,
      {
        x: MARGIN_LEFT + 30,
        y: noticeBoxY - 22,
        size: 10.5,
        font: boldFont,
        color: WARNING_TEXT,
      },
    );

    const noticeSubText =
      "Your offer will be considered withdrawn if we do not receive your acceptance by this date.";
    page1.drawText(noticeSubText, {
      x: MARGIN_LEFT + 30,
      y: noticeBoxY - 38,
      size: 9,
      font: italicFont,
      color: rgb(0.6, 0.3, 0),
    });

    // FOOTER - Page 1
    const footerY = 40;
    page1.drawLine({
      start: { x: MARGIN_LEFT, y: footerY },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: footerY },
      thickness: 0.5,
      color: GRAY_LINE,
    });

    page1.drawText(`Page 1 of 2`, {
      x: MARGIN_LEFT,
      y: footerY - 12,
      size: 8,
      font: regularFont,
      color: GRAY_TEXT,
    });

    page1.drawText(`${recruiterData.name} | Confidential`, {
      x: PAGE_WIDTH / 2 - 60,
      y: footerY - 12,
      size: 8,
      font: regularFont,
      color: GRAY_TEXT,
    });

    // =================== PAGE 2 ===================
    const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - 50;

    // Page 2 Header
    const page2Title = "TERMS & CONDITIONS";
    const page2TitleWidth = boldFont.widthOfTextAtSize(page2Title, 18);
    page2.drawText(page2Title, {
      x: (PAGE_WIDTH - page2TitleWidth) / 2,
      y: y,
      size: 18,
      font: boldFont,
      color: PRIMARY_BLUE,
    });

    y -= 35;

    // JOB DESCRIPTION
    page2.drawText("1. JOB DESCRIPTION & RESPONSIBILITIES", {
      x: MARGIN_LEFT,
      y: y,
      size: 11,
      font: boldFont,
      color: ACCENT_BLUE,
    });

    y -= 20;

    const descLines = wrapText(
      jobData.description,
      CONTENT_WIDTH - 10,
      regularFont,
      10,
    );
    descLines.forEach((line) => {
      page2.drawText(line, {
        x: MARGIN_LEFT + 10,
        y: y,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      y -= 14;
    });

    y -= 15;

    // TERMS & CONDITIONS
    page2.drawText("2. TERMS & CONDITIONS", {
      x: MARGIN_LEFT,
      y: y,
      size: 11,
      font: boldFont,
      color: ACCENT_BLUE,
    });

    y -= 18;

    const terms = [
      {
        num: "2.1",
        text: "This offer is contingent upon satisfactory verification of your educational qualifications, employment history, background checks, and references.",
      },
      {
        num: "2.2",
        text: "You will be required to submit original documents for verification before joining.",
      },
      {
        num: "2.3",
        text: "Employment is subject to a probation period of 3 months, which may be extended at the company's discretion based on performance.",
      },
      {
        num: "2.4",
        text: "During probation, either party may terminate employment with one week's notice.",
      },
      {
        num: "2.5",
        text: "After confirmation, the notice period will be 30 days for resignation.",
      },
      {
        num: "2.6",
        text: "You are required to maintain confidentiality of all company information during and after your employment.",
      },
      {
        num: "2.7",
        text: "You must comply with all company policies, rules, and regulations as amended from time to time.",
      },
      {
        num: "2.8",
        text: "Intellectual property created during employment belongs to the company.",
      },
      {
        num: "2.9",
        text: "The company reserves the right to modify compensation and benefits as per business requirements, with appropriate notice.",
      },
      {
        num: "2.10",
        text: "This offer supersedes all previous discussions and agreements.",
      },
      {
        num: "2.11",
        text: "Any disputes arising from this employment will be subject to the jurisdiction of courts in Nagpur, Maharashtra.",
      },
    ];

    terms.forEach((term) => {
      const termLines = wrapText(
        term.text,
        CONTENT_WIDTH - 40,
        regularFont,
        9.5,
      );

      page2.drawText(term.num, {
        x: MARGIN_LEFT + 10,
        y: y,
        size: 9.5,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      let termY = y;
      termLines.forEach((line, idx) => {
        page2.drawText(line, {
          x: MARGIN_LEFT + 35,
          y: termY,
          size: 9.5,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        termY -= 13;
      });

      y = termY - 6;
    });

    // SIGNATURE SECTION - Fixed position
    const sigY = 240;

    // Separator line
    page2.drawLine({
      start: { x: MARGIN_LEFT, y: sigY },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: sigY },
      thickness: 1,
      color: GRAY_LINE,
    });

    // Company Signature (Left)
    page2.drawText(`FOR ${recruiterData.name.toUpperCase()}`, {
      x: MARGIN_LEFT,
      y: sigY - 20,
      size: 10,
      font: boldFont,
      color: ACCENT_BLUE,
    });

    page2.drawText("Authorized Signatory", {
      x: MARGIN_LEFT,
      y: sigY - 34,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Signature line
    page2.drawLine({
      start: { x: MARGIN_LEFT, y: sigY - 55 },
      end: { x: MARGIN_LEFT + 180, y: sigY - 55 },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });

    page2.drawText(recruiterData.admin?.name || recruiterData.name, {
      x: MARGIN_LEFT,
      y: sigY - 70,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page2.drawText(recruiterData.admin?.role || "Authorized Signatory", {
      x: MARGIN_LEFT,
      y: sigY - 84,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    page2.drawText(`Date: ${formatDate(new Date().toISOString())}`, {
      x: MARGIN_LEFT,
      y: sigY - 98,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Candidate Signature (Right)
    const rightSigX = PAGE_WIDTH / 2 + 30;

    page2.drawText("CANDIDATE ACCEPTANCE", {
      x: rightSigX,
      y: sigY - 20,
      size: 10,
      font: boldFont,
      color: ACCENT_BLUE,
    });

    page2.drawText("I accept the terms of this employment offer", {
      x: rightSigX,
      y: sigY - 34,
      size: 8.5,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Signature line
    page2.drawLine({
      start: { x: rightSigX, y: sigY - 55 },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: sigY - 55 },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Name line
    page2.drawLine({
      start: { x: rightSigX, y: sigY - 85 },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: sigY - 85 },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });

    page2.drawText(candidateData.name, {
      x: rightSigX,
      y: sigY - 70,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page2.drawText(`Date: ________________`, {
      x: rightSigX,
      y: sigY - 98,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // FOOTER - Page 2
    const footer2Y = 40;
    page2.drawLine({
      start: { x: MARGIN_LEFT, y: footer2Y },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: footer2Y },
      thickness: 0.5,
      color: GRAY_LINE,
    });

    const currentYear = new Date().getFullYear();
    const offerId = `JKT-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    page2.drawText(`Page 2 of 2`, {
      x: MARGIN_LEFT,
      y: footer2Y - 12,
      size: 8,
      font: regularFont,
      color: GRAY_TEXT,
    });

    page2.drawText(`© ${currentYear} ${recruiterData.name}`, {
      x: PAGE_WIDTH / 2 - 60,
      y: footer2Y - 12,
      size: 8,
      font: regularFont,
      color: GRAY_TEXT,
    });

    page2.drawText(`Offer ID: ${offerId}`, {
      x: PAGE_WIDTH - MARGIN_RIGHT - 80,
      y: footer2Y - 12,
      size: 8,
      font: regularFont,
      color: GRAY_TEXT,
    });

    page2.drawText(
      "This is an electronically generated document and is legally binding.",
      {
        x: MARGIN_LEFT,
        y: footer2Y - 24,
        size: 7,
        font: italicFont,
        color: GRAY_TEXT,
      },
    );

    // =================== SAVE PDF ===================
    const pdfBytes = await pdfDoc.save();

    const tempPath = path.join(os.tmpdir(), `offer_letter_${Date.now()}.pdf`);

    fs.writeFileSync(tempPath, pdfBytes);

    return tempPath;
  } catch (err) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ ERROR GENERATING PDF:");
    console.error("=".repeat(60));
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    console.error("=".repeat(60) + "\n");
  }
}
