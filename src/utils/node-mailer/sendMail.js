import transporter from "./transporter";
import {
  interviewInviteTemplate,
  offerAcceptanceTemplate,
  finalOfferTemplate,
} from "./templates";

const FROM = `"HireHunt AI" <${process.env.GMAIL_USER}>`;

export async function sendInterviewInvite(data) {
  return transporter.sendMail({
    from: FROM,
    to: data.email,
    subject: `Interview Invitation – ${data.jobTitle}`,
    html: interviewInviteTemplate(data),
  });
}

export async function sendOfferAcceptance(data) {
  return transporter.sendMail({
    from: FROM,
    to: data.email,
    subject: `Offer Letter – ${data.jobTitle}`,
    html: offerAcceptanceTemplate(data),
  });
}

export async function sendFinalOfferLetter(data) {
  return transporter.sendMail({
    from: FROM,
    to: data.email,
    subject: "Welcome to HireHunt AI",
    html: finalOfferTemplate(data),
  });
}