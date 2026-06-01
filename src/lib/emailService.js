/**
 * Email Service for Notifications
 *
 * Handles sending emails to candidates and recruiters for:
 * - Shortlist notifications
 * - Interview scheduling confirmations
 * - Rejection notifications
 */
import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

/**
 * Send shortlist notification to candidate
 */
export async function sendShortlistNotification({
  candidateEmail,
  candidateName,
  jobTitle,
  companyName,
  interviewDate,
}) {
  try {
    if (!transporter.options.auth.user) {
      console.warn("[EMAIL] SMTP credentials not configured, skipping email");
      return { success: false, reason: "SMTP not configured" };
    }

    const htmlContent = `
      <h2>Congratulations! You've been shortlisted</h2>
      <p>Dear ${candidateName},</p>
      <p>We are pleased to inform you that you have been shortlisted for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>

      <h3>Next Steps:</h3>
      <p>Your interview has been scheduled for <strong>${interviewDate}</strong>. You can access and take the interview anytime during that day.</p>

      <h3>Interview Details:</h3>
      <ul>
        <li><strong>Job Title:</strong> ${jobTitle}</li>
        <li><strong>Company:</strong> ${companyName}</li>
        <li><strong>Interview Date:</strong> ${interviewDate}</li>
        <li><strong>Duration:</strong> You have the entire day to complete the interview</li>
      </ul>

      <p>Please log in to your account to access the interview.</p>

      <p>Best regards,<br/>
      HireHunt.AI Team</p>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: candidateEmail,
      subject: `Congratulations! You've been shortlisted for ${jobTitle}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Shortlist notification sent to ${candidateEmail}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(
      `[EMAIL] Error sending shortlist notification to ${candidateEmail}:`,
      error.message,
    );
    return { success: false, error: error.message };
  }
}

/**
 * Send offerletter notification to candidate
 */
export async function sendOfferLetterEmail({
  candidateEmail,
  candidateName,
  companyName,
  jobTitle,
  offerLetterUrl,
  joiningDate,
  expiresAt,
}) {
  try {
    if (!transporter.options.auth.user) {
      return {
        success: false,
        reason: "SMTP not configured",
      };
    }

    const htmlContent = `
      <h2>Congratulations! Your Offer Letter is Ready</h2>

      <p>Dear ${candidateName},</p>

      <p>
        We are pleased to offer you the position of
        <strong>${jobTitle}</strong>
        at
        <strong>${companyName}</strong>.
      </p>

      <h3>Offer Details</h3>

      <ul>
        <li><strong>Position:</strong> ${jobTitle}</li>
        <li><strong>Company:</strong> ${companyName}</li>
        <li><strong>Joining Date:</strong> ${new Date(
          joiningDate,
        ).toLocaleDateString()}</li>
        <li><strong>Offer Valid Until:</strong> ${new Date(
          expiresAt,
        ).toLocaleDateString()}</li>
      </ul>

      <p>
        Please review your offer letter using the link below:
      </p>

      <p>
        <a href="${offerLetterUrl}">
          View Offer Letter
        </a>
      </p>

      <p>
        We look forward to welcoming you to our team.
      </p>

      <p>
        Best Regards,<br/>
        ${companyName}
      </p>
    `;

    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: candidateEmail,
      subject: `Offer Letter - ${jobTitle} | ${companyName}`,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Offer letter email failed:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send rejection notification to candidate
 */
export async function sendRejectionNotification({
  candidateEmail,
  candidateName,
  jobTitle,
  companyName,
}) {
  try {
    if (!transporter.options.auth.user) {
      console.warn("[EMAIL] SMTP credentials not configured, skipping email");
      return { success: false, reason: "SMTP not configured" };
    }

    const htmlContent = `
      <h2>Application Status Update</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>

      <p>After careful review of all applications, we regret to inform you that we will not be moving forward with your application at this time. However, we encourage you to apply for other open positions that match your skills and experience.</p>

      <p>We appreciate your time and effort in applying and wish you the best in your career search.</p>

      <p>Best regards,<br/>
      HireHunt.AI Team</p>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: candidateEmail,
      subject: `Application Status - ${jobTitle}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Rejection notification sent to ${candidateEmail}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(
      `[EMAIL] Error sending rejection notification to ${candidateEmail}:`,
      error.message,
    );
    return { success: false, error: error.message };
  }
}

/**
 * Send shortlisting summary to recruiter
 */
export async function sendRecruiterShortlistNotification({
  recruiterEmail,
  recruiterName,
  jobTitle,
  shortlistCount,
  totalRequired,
}) {
  try {
    if (!transporter.options.auth.user) {
      console.warn("[EMAIL] SMTP credentials not configured, skipping email");
      return { success: false, reason: "SMTP not configured" };
    }

    const htmlContent = `
      <h2>Shortlisting Complete - ${jobTitle}</h2>
      <p>Dear ${recruiterName},</p>
      <p>The shortlisting process for the <strong>${jobTitle}</strong> position has been completed.</p>

      <h3>Summary:</h3>
      <ul>
        <li><strong>Job Title:</strong> ${jobTitle}</li>
        <li><strong>Candidates Shortlisted:</strong> ${shortlistCount}</li>
        <li><strong>Required Openings:</strong> ${totalRequired}</li>
        <li><strong>Target Count (1.5x):</strong> ${Math.ceil(totalRequired * 1.5)}</li>
      </ul>

      <p>Interviews have been scheduled for the shortlisted candidates and they have been notified. You can view the interview details and candidate information in your recruiter dashboard.</p>

      <p>Best regards,<br/>
      HireHunt.AI Team</p>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recruiterEmail,
      subject: `Shortlisting Complete - ${jobTitle}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(
      `[EMAIL] Shortlist summary sent to recruiter ${recruiterEmail}`,
    );
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(
      `[EMAIL] Error sending recruiter notification to ${recruiterEmail}:`,
      error.message,
    );
    return { success: false, error: error.message };
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration() {
  try {
    // Verify SMTP connection
    await transporter.verify();
    console.log("[EMAIL] SMTP configuration is valid");
    return { success: true, message: "SMTP connection verified" };
  } catch (error) {
    console.error("[EMAIL] SMTP configuration error:", error.message);
    return { success: false, error: error.message };
  }
}
