const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require('path');
const { exec } = require('child_process');
const { createClient } = require('@deepgram/sdk');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({ storage })
let generatedFileName = '';
app.post('/upload', upload.single('file'), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const videoPath = path.join(__dirname, 'uploads', req.file.filename);
    const audioPath = path.join(__dirname, 'uploads', `audio_${Date.now()}.mp3`);
    const outputVideoPath = path.join(__dirname, 'uploads', `subtitled_${Date.now()}.mp4`);

    try {

        await extractAudio(videoPath, audioPath);


        const textWithTimeline = await transcribeAudio(audioPath);

        console.log('Subtitled video:', outputVideoPath);

        const srtFilePath = generateSRT(textWithTimeline);

        await addSubtitlesToVideo(videoPath, outputVideoPath, audioPath, srtFilePath);
        generatedFileName = `subtitled_${Date.now()}.mp4`;

        res.json({ videoPath: outputVideoPath });


    } catch (error) {
        console.error('Error processing the video:', error);
        res.status(500).send('Error processing the video');
    }
});

app.get('/downloadVideo', (req, res) => {
    const { videoPath } = req.query;
    const filePath = videoPath;

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading the file');
        }
    });
});


function extractAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .audioCodec('libmp3lame')
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .run();
    });
}

function transcribeAudio(audioPath) {
    return new Promise(async (resolve, reject) => {
        try {
            const deepgramApiKey = 'e05d255942fadefe14bc6c95eabcba4b4c187ea6'; // Replace with your Deepgram API key
            const deepgram = createClient(deepgramApiKey);

            console.log('Requesting transcript...');
            console.log('Your audio file may take some time to process.');

            const { result, error } = await deepgram.listen.prerecorded.transcribeFile(fs.readFileSync(audioPath), {
                smart_format: true,
                model: 'nova-2',
                language: 'en-US',
            });

            if (error) {
                console.error('Error transcribing audio:', error);
                reject(error);
            } else {
                const textWithTimeline = [];

                if (result && result.results && result.results.channels && Array.isArray(result.results.channels)) {
                    result.results.channels.forEach((segment) => {
                        if (Array.isArray(segment.alternatives) && segment.alternatives.length > 0) {
                            segment.alternatives.forEach((alternative) => {
                                if (Array.isArray(alternative.words) && alternative.words.length > 0) {
                                    alternative.words.forEach((word) => {
                                        if (word.start && word.end && word.word) {
                                            textWithTimeline.push({
                                                start: word.start,
                                                end: word.end,
                                                word: word.word,
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

                console.log('Text with timeline:', textWithTimeline);
                resolve(textWithTimeline);
            }
        } catch (error) {
            console.error('Error transcribing audio:', error);
            reject(error);
        }
    });
}

function generateSRT(textWithTimeline) {
    let srtContent = '';
    let index = 1;

    textWithTimeline.forEach((word) => {
        const startTime = formatTime(word.start);
        const endTime = formatTime(word.end);

        srtContent += `${index}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${word.word}\n\n`;

        index++;
    });

    const srtFilePath = path.join(__dirname, 'uploads', `subtitles_${Date.now()}.srt`);
    fs.writeFileSync(srtFilePath, srtContent);

    return srtFilePath;
}

function formatTime(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 12); // Format: HH:mm:ss,msmsms
}

function addSubtitlesToVideo(videoPath, outputVideoPath, audioPath, srtFilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .input(srtFilePath)
            .outputOptions([
                '-c:v', 'copy',
                '-c:a', 'copy',
                '-c:s', 'mov_text',
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-map', '2:s:0',
            ])
            .output(outputVideoPath)
            .on('end', () => {
                console.log('Subtitles added to the video:', outputVideoPath);
                resolve(outputVideoPath);
            })
            .on('error', (err) => {
                console.error('Error adding subtitles:', err);
                reject(err);
            })
            .run();
    });

}

app.listen(3001, () => {
    console.log("Server is Running");
})
// env filr
// file structure 
// delete thesubtitle video 