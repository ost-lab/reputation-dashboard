import nodemailer from 'nodemailer';

// Shared Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use 'smtp.sendgrid.net', etc.
  auth: {
    user: process.env.EMAIL_USER, // Add to .env.local
    pass: process.env.EMAIL_PASS, // Add to .env.local
  },
});

/**
 * Sends a password reset link to the user.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  const mailOptions = {
    from: '"Reputation App" <no-reply@example.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h3>Password Reset</h3>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>Or copy this link: ${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Email failed:", error);
    // Fallback for development (View link in terminal)
    console.log("---------------------------------------");
    console.log("DEV MODE RESET LINK:", resetLink);
    console.log("---------------------------------------");
  }
}

/**
 * Sends a 6-digit verification code for signup.
 */
export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: '"Reputation App" <no-reply@example.com>',
    to: email,
    subject: 'Verify your email address',
    text: `Your verification code is: ${code}`,
    html: `
      <h3>Welcome!</h3>
      <p>Please use the following code to verify your email address:</p>
      <h1 style="letter-spacing: 5px; background: #f4f4f4; padding: 10px; display: inline-block;">${code}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Email failed:", error);
    // Fallback for development
    console.log("---------------------------------------");
    console.log("DEV MODE VERIFICATION CODE:", code);
    console.log("---------------------------------------");
  }
}