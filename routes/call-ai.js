const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const fetch = require('node-fetch'); // For downloading audio and ChatGPT API
const fs = require('fs'); // File system for saving audio locally
const { spawn } = require('child_process'); // For speech-to-text processing
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Twilio webhook to handle incoming calls
router.post('/incoming-call', (req, res) => {
    console.log(req.body);
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say('Please ask your question after the beep. Your question will be processed.');
    twiml.record({
        action: '/process-speech', // Sends recording details here
        maxLength: 30,
        transcribe: false, // Disable Twilio's transcription
        playBeep: true,
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

// Process the recording and generate a response
router.post('/process-speech', async (req, res) => {
    const recordingUrl = req.body.RecordingUrl;

    if (!recordingUrl) {
        console.error('Recording URL is missing!');
        return res.status(400).send('Recording URL not provided');
    }

    try {
        // Download audio from Twilio
        const audioBuffer = await downloadAudio(recordingUrl);

        // Convert audio to text using speech-to-text
        const userSpeech = await speechToText(audioBuffer);

        console.log('User said:', userSpeech);

        // Send user query to ChatGPT
        const chatgptResponse = await sendToChatGPT(`Answer concisely: "${userSpeech}"`);
        console.log('ChatGPT response:', chatgptResponse);

        // Respond to the user with the ChatGPT output
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say(chatgptResponse);
        res.type('text/xml').send(twiml.toString());
    } catch (error) {
        console.error('Error processing recording:', error);

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say('Sorry, there was an error processing your request.');
        res.type('text/xml').send(twiml.toString());
    }
});

// Function to download audio from Twilio
async function downloadAudio(url) {
    const response = await fetch(url);
    const buffer = await response.buffer();

    // Save the audio locally
    const filePath = '.../recordings/audio.wav';
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

// Function to convert speech-to-text using a local model (e.g., Whisper or others)
async function speechToText(audioPath) {
    return new Promise((resolve, reject) => {
        const process = spawn('whisper', [audioPath, '--language', 'en', '--model', 'base', '--output_format', 'txt']);

        process.stdout.on('data', (data) => {
            const transcription = data.toString().trim();
            resolve(transcription);
        });

        process.stderr.on('data', (data) => {
            console.error(`Speech-to-text error: ${data}`);
        });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Speech-to-text process exited with code ${code}`));
            }
        });
    });
}

// Function to send a query to ChatGPT
async function sendToChatGPT(userInput) {
    const url = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userInput }],
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

module.exports = router;
