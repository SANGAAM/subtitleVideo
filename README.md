# Subtitle Video Generator

A MERN-stack application that enables users to upload videos, extract subtitles, and generate a new video with embedded subtitles using FFmpeg.

---

## Output

<img src="https://github.com/user-attachments/assets/364078ac-1f0f-4682-af03-e7ff0cff5629" alt="Screenshot 1" width="600" />

<img src="https://github.com/user-attachments/assets/3cb21336-f6ce-4019-afd0-90aee3e74bc0" alt="Screenshot 2" width="600" />

---

## Features

- **Video Upload**: Upload your video file to the application.  
- **Audio & Subtitle Extraction**: Automatically extracts audio and generates subtitles from the video.  
- **Subtitle Embedding**: Combines the original video, extracted audio, and generated subtitles into a single output video.  
- **FFmpeg Integration**: Handles video processing seamlessly.  

---

## Technologies Used

- **Frontend**: React.js  
- **Backend**: Node.js with Express.js  
- **Database**: MongoDB  
- **Video Processing**: FFmpeg  
- **Subtitle Extraction**: Speech-to-Text API (or tool used)  

---

## Usage

1. **Open** the application in your browser.  
2. **Upload** a video file.  
3. **Process** the video:  
   - **Extract** audio and generate subtitles.  
   - **Merge** audio, video, and subtitles.  
4. **Download** the generated video with subtitles.  

---

## FFmpeg Commands Used

- **Extract Subtitles**:  
  ```bash
  ffmpeg -i input.mp4 -map 0:s:0 subtitles.srt
- **Merge Audio, Video, and Subtitles**:
  ```bash
   ffmpeg -i input.mp4 -i subtitles.srt -c:v copy -c:a copy -c:s mov_text output.mp4

## Future Enhancements

- **Support for Multiple Subtitle Languages**  
- **Improved Speech-to-Text Accuracy with Custom Models**  
- **Cloud Storage Integration for Video Uploads**  
