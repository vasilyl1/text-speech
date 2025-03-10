import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ollamaOCR, DEFAULT_OCR_SYSTEM_PROMPT, DEFAULT_MARKDOWN_SYSTEM_PROMPT, LlamaOCRError, ErrorCode } from 'ollama-ocr';
import XMLHttpRequest from 'xhr2';

const xhr = new XMLHttpRequest();

dotenv.config();
global.XMLHttpRequest = XMLHttpRequest;


const openai = new OpenAI({
    apiKey: process.env.OPENAI,
});
const argument = process.argv[2]; // Get the argument passed via command line

const printInstructions = () => {
    console.log("Usage: npm start [speech|text|ocr]\n");
    console.log("Parameters:");
    console.log("  speech      - Process the input prompt into speech (using INPUT environment variable)");
    console.log("  text   - Process the audio file into text (using INPUTAUDIO environment variable)");
    console.log("  ocr   - Process the image file into text (using INPUTIMAGE environment variable)");
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

const ocr = async () => {
    try {
        console.log(`Processing file: ${process.env.INPUTIMAGE} using local machine compute power, it can take minutes if not longer based on your chipset. \n Please be patient!`);
        const text = await ollamaOCR({
            filePath: process.env.INPUTIMAGE,
            systemPrompt: DEFAULT_MARKDOWN_SYSTEM_PROMPT + ' ' + process.env.ADDPROMPT,
        });
        console.log(text);
    } catch (err) {
        if (err instanceof LlamaOCRError) {
            switch (err.code) {
                case ErrorCode.FILE_NOT_FOUND:
                    console.error("Image file not found");
                    break;
                case ErrorCode.UNSUPPORTED_FILE_TYPE:
                    console.error("Unsupported image format");
                    break;
                case ErrorCode.OLLAMA_SERVER_ERROR:
                    console.error("Ollama server connection failed");
                    break;
                case ErrorCode.OCR_PROCESSING_ERROR:
                    console.error("OCR processing failed");
                    break;
            };
        };
        console.error(err);
    };

};

switch (argument) {
    case undefined:
    case null:
    case '':
        printInstructions();
        break;
    case 'speech':
        speech();
        break;
    case 'text':
        text();
        break;
    case 'ocr':
        ocr();
        break;
    default:
        console.log("Invalid argument provided.");
        printInstructions();
};