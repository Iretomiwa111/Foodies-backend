const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendOrderSms = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    });
    console.log("Order SMS sent to", to);
  } catch (error) {
    console.error("Error sending order SMS:", error.message);
  }
};

module.exports = sendOrderSms;
