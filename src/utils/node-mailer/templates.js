export const interviewInviteTemplate = ({
  candidateName,
  jobTitle,
  interviewURL,
  interviewDate,
  interviewTime,
}) => `
<html>
<body style="font-family:Arial; max-width:600px; margin:auto;">
  <h2>Interview Invitation – HireHunt AI</h2>

  <p>Hello ${candidateName},</p>

  <p>
    You’ve been shortlisted for the <strong>${jobTitle}</strong> role.
  </p>

  <p style="text-align:center;">
    <a href="${interviewURL}"
       style="padding:12px 20px; background:#000; color:#fff; text-decoration:none; border-radius:6px;">
      Join Interview
    </a>
  </p>

  <p>
    <strong>Date:</strong> ${interviewDate}<br/>
    <strong>Time:</strong> ${interviewTime}
  </p>

  <p>Best of luck!<br/>HireHunt AI Team</p>
</body>
</html>
`;

export const offerAcceptanceTemplate = ({
  candidateName,
  jobTitle,
  acceptOfferURL,
}) => `
<html>
<body style="font-family:Arial; max-width:600px; margin:auto;">
  <h2>Offer Letter – Action Required</h2>

  <p>Hello ${candidateName},</p>

  <p>
    We’re pleased to offer you the position of
    <strong>${jobTitle}</strong>.
  </p>

  <p style="text-align:center;">
    <a href="${acceptOfferURL}"
       style="padding:12px 20px; background:#000; color:#fff; text-decoration:none; border-radius:6px;">
      Review & Accept Offer
    </a>
  </p>

  <p>Regards,<br/>HireHunt AI</p>
</body>
</html>
`;

export const finalOfferTemplate = ({
  candidateName,
  jobTitle,
  offerLetterURL,
}) => `
<html>
<body style="font-family:Arial; max-width:600px; margin:auto;">
  <h2>🎉 Welcome to HireHunt AI</h2>

  <p>Hello ${candidateName},</p>

  <p>
    Congratulations! Your offer for
    <strong>${jobTitle}</strong> has been confirmed.
  </p>

  <p style="text-align:center;">
    <a href="${offerLetterURL}"
       style="padding:12px 20px; background:#000; color:#fff; text-decoration:none; border-radius:6px;">
      Download Offer Letter
    </a>
  </p>

  <p>We’re excited to have you onboard 🚀</p>

  <p>HireHunt AI Team</p>
</body>
</html>
`;