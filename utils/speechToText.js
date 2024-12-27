const fs = require('fs');
const speech = require('@google-cloud/speech');

const client = new speech.SpeechClient();

async function speechToText(audioBuffer) {
    const request = {
        audio: {
            content: audioBuffer.toString('base64'), // Convert audio to base64 for Google STT
        },
        config: {
            encoding: 'LINEAR16', // Matches Twilio Media Streams
            sampleRateHertz: 8000, // Matches Twilio's sample rate
            languageCode: 'en-US', // Adjust for the language you want
        },
    };

    const [response] = await client.recognize(request);
    return response.results
        .map(result => result.alternatives[0].transcript)
        .join(' ');
}

module.exports = { speechToText };
