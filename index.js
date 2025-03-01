const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI,
});
const speechFile = path.resolve(`./${process.env.FILE}`);

const speech = async () => {

    try {
        console.log(`Processing prompt: ${process.env.INPUT} \n Please be patient!`)

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

speech();