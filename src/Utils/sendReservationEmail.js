const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      
    pass: process.env.EMAIL_PASS,       
  },
});

const sendReservationEmail = async (to, { name, guests, date, time, request, notes }) => {
  const mailOptions = {
    from: `"Foodies Restaurant" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reservation Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hi ${name},</h2>
        <p>Thank you for booking a reservation at <strong>Foodies Restaurant</strong>!</p>
        <p><strong>Reservation Details:</strong></p>
        <ul>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Guests:</strong> ${guests}</li>
          ${request ? `<li><strong>Special Request:</strong> ${request}</li>` : ""}
          ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ""}
        </ul>
        <p>We look forward to serving you!</p>
        <p style="margin-top: 20px;">Best regards,<br/>Foodies Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendReservationEmail;
