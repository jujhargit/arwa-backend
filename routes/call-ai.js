const express = require('express');
const twilio = require('twilio');
const { speechToText } = require('../utils/speechToText');
const { sendToChatGPT } = require('../utils/openai');

const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Twilio webhook to handle incoming calls
router.post('/incoming-call', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.gather({
        input: 'speech',
        action: '/process-speech',
        timeout: 5,
    }).say('Hello! Please ask your question.');

    res.type('text/xml');
    res.send(twiml.toString());
});

// Process speech input
router.post('/process-speech', async (req, res) => {
    const rawAudio = req.body.RecordingUrl; // Twilio may save the audio URL here

    try {
        // Download the audio file
        const audioBuffer = await downloadAudio(rawAudio);

        // Convert audio to text
        const userSpeech = await speechToText(audioBuffer);
        console.log('User Speech:', userSpeech);

        // Get response from ChatGPT
        const chatgptResponse = await sendToChatGPT(userSpeech);

        // Respond to the user via Twilio <Say>
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say(chatgptResponse);

        // Allow more user interaction
        twiml.gather({
            input: 'speech',
            action: '/process-speech',
            timeout: 8,
        });

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('Error processing speech:', error);
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say('Sorry, there was an error. Please try again.');
        res.type('text/xml');
        res.send(twiml.toString());
    }
});

// Utility to download Twilio audio file
async function downloadAudio(url) {
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
}

module.exports = router;
