import React,{ useState} from "react"
import axios from 'axios'

function App(){
  const [file,setFile]=useState();
  const [videoPath, setVideoPath] = useState('');

  const upload = async () => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post('http://localhost:3001/upload', formData);
      const { videoPath } = response.data;
      setVideoPath(videoPath); 
      console.log('Video path received:', videoPath);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const downloadVideo = async () => {
    try {
        const response = await axios.get('http://localhost:3001/downloadVideo', {
            params: { videoPath }, 
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'downloaded_video.mp4');
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error downloading video:', error.response);
    }
};

  return(
    <div>
      <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>
      <button type="button" onClick={upload}>Upload</button>
       <button onClick={downloadVideo}>Download Subtitled Video</button> 
    </div>
  )
}
export default App;