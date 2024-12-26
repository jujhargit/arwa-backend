const twilio = require('twilio');
require('dotenv').config();

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

makeCall =(to)=>{
    if (!to) {
        return 'Recipient phone number is required.'
    }

    client.calls
        .create({
            to: to, // The recipient's phone number
            from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
            twiml: '<Response><Say>Hello, this is a call from Twilio using Express.js!</Say></Response>',
        })
        .then(call => res.status(200).send(`Call initiated with SID: ${call.sid}`))
        .catch(err => res.status(500).send(`Failed to make call: ${err.message}`));
}

module.exports = makeCall