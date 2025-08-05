const twilio = require("twilio");
require("dotenv").config(); 

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendReservationSMS = async (toPhone, name, date, time, guests) => {
  try {
    await client.messages.create({
      body: `Hi ${name}, your reservation for ${guests} guests on ${date} at ${time} has been confirmed. Thank you for choosing us!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log("SMS sent successfully to", toPhone);
  } catch (err) {
    console.error("SMS sending error:", err.message);
  }
};

module.exports = sendReservationSMS;
