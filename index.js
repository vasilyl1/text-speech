const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI,
});
const argument = process.argv[2]; // Get the argument passed via command line

const printInstructions = () => {
    console.log("Usage: npm start [speech|toSpeech]\n");
    console.log("Parameters:");
    console.log("  speech      - Process the input prompt into speech (using INPUT environment variable)");
    console.log("  text   - Process the audio file into text (using INPUTAUDIO environment variable)");
};

const speechFile = path.resolve(`./${process.env.FILE}`);

const speech = async () => {

    try {
        console.log(`Processing prompt: ${process.env.INPUT} \n Please be patient!`);

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "sage",
            input: process.env.INPUT,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        console.log(`File ${process.env.FILE} has been successfully created`)
    } catch (err) {
        console.error(err);
    };
};

const text = async () => {
    try {
        console.log(`Processing file: ${process.env.INPUTAUDIO} \n Please be patient!`);
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(process.env.INPUTAUDIO),
            model: "whisper-1",
        });
        console.log(transcription.text);
    } catch (err) {
        console.error(err);
    };
};

if (!argument) {
    printInstructions();
} else if (argument === 'speech') {
    speech();
} else if (argument === 'text') {
    text();
} else {
    console.log("Invalid argument provided.");
    printInstructions();
};