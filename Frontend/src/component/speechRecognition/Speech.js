import React, {useState} from 'react'
import './speech.css'
import axios from 'axios'
import ReactAudioPlayer from 'react-audio-player'
import loading from '../../gif/256.gif'
import stt from '../../static/image/stt.png'
import audiofile from '../../static/image/audio.jpg'

function Speech() {
  const [audio, setAudio] =useState('')
  const [audiopath, setAudiopath] =useState('')
  const [audiofiletranscript, setAudiofiletranscript] =useState('')
  //render getsummary button only when get transcript button is clicked 
  const[showsummarybutton, setShowbutton] = useState(false)
  //show wait message
  const[showwaitmessage, setShowwaitmessage] = useState(false)
  const[showsummarywait,setsummarywait] = useState(false)
  //to show download button when transcript summary is generated
  const [downloadbuttonstatus, setDownloadbuttonstatus] = useState(false)
  //to store urlblob of generated summary
  const [url_text_input,setUrl_text_input] = useState('')
  //store the blob url of transcript
  const[transcripturl,setTranscripturl] = useState('')
  //loading gif show garnlai
  const [loadinggif_audio, setLoadinggif_audio] = useState(false)
  const [loadinggif_summary, setLoadinggif_summary] = useState(false)
  
  const [Transcript, setTranscript] = useState('')
  const[audiosummary,setaudiosummary] = useState('')
  // const[transcript, setTranscript] = useState('')
  //getthesummary from the audiotranscript, audiotranscript is stores in {audiofiletranscript}

  

  
  const getthesummary =(e)=>{
    let stringlength=audiofiletranscript.length
    console.log(stringlength)
    if(stringlength>150){
      setLoadinggif_summary(true)
      setsummarywait(true)
      const data = {
        texts: audiofiletranscript
      }
      console.log(data)
      let input = JSON.stringify(data);
      let customConfig = {
      headers: {
      'Content-Type': 'application/json'
      }
      };
      
      axios.post('http://localhost:8000/input-text',
      input, customConfig)
      .then(
        function(res){
          setLoadinggif_summary(false)
          setsummarywait(false)
          setaudiosummary(res.data)
         
          setDownloadbuttonstatus(true)
          
          const downloadTextFile = JSON.stringify(res.data);
          const blob = new Blob([downloadTextFile], { type: "text/plain" });
          const urls = URL.createObjectURL(blob);
          setUrl_text_input(urls)
        })
    }
    else{
      alert('Sorry, the audio file is too short to generate a summary')
    }  
      

  }
  //download the summary.txt
  const input_text_downloader = (e) => {
    if(url_text_input===''){
      alert('Please upload the file!')
    }
    else{
      const tempLink = document.createElement('a');
      tempLink.href = url_text_input;
      tempLink.setAttribute('download', 'summary.txt');
      tempLink.click();

    }  
  }  
  //download transcript.txt
  const transcript_downloader = (e) => {
    if(transcripturl===''){
      alert('Please upload the file!')
    }
    else{
      const tempLink = document.createElement('a');
      tempLink.href = transcripturl;
      tempLink.setAttribute('download', 'Transcript.txt');
      tempLink.click();

    }  

  }


  



  const handleFile = (e) => {
    if(e.target.files[0]==='undefined'){
      alert("Please upload a .flac or .wav file")

    }else{
    setAudiopath(URL.createObjectURL(e.target.files[0]))
    setAudio(e.target.files[0])
    console.log(e.target.files[0].name)
    document.getElementById('filename').innerHTML = e.target.files[0].name
  }
  }
  const handleSubmit = (e) => { 
    if (audio===''){
      document.getElementById('nofile-error').innerHTML = 'No file selected'
    }
    else{

    
    let ext=audio.name.split('.').pop()
    console.log(audio.name)
    if(ext === 'flac' || ext === 'wav'){    
      
      setShowwaitmessage(true)
      setLoadinggif_audio(true) 
      const formData = new FormData()
      formData.append('audio', audio)
      axios.post(      
        'http://localhost:8000/audio', formData
        
      )
      .then((res)=> {
        setShowwaitmessage(false)
        setLoadinggif_audio(false)
        setShowbutton(true)
        
        console.log(res)
        document.getElementById('upload-file-info').innerHTML = "Upload Success!"
        // document.getElementById("success").innerHTML = res.data
        // setTranscript(res.data)
        setTranscript(res.data)
        setAudiofiletranscript(res.data)
        const downloadTextFile = JSON.stringify(res.data);
        const blob = new Blob([downloadTextFile], { type: "text/plain" });
        const urls = URL.createObjectURL(blob);
        setTranscripturl(urls)
      }  
      )
      .catch((error)=>{
        console.log(error)
        console.log("no response")
        setShowwaitmessage(false)
        setLoadinggif_audio(false)
        document.getElementById('upload-file-info').innerHTML = "There was error in uploading the file or server crashed"
      })
      
    } 
    
    else{
      alert("Please upload a .flac or .wav file")
    }  
  }

  }  
  return (
    <div>
      <center><img src={stt} alt="stt" className='col-xs-12 col-lg-6 col-md-6 mt-2 mb-2' width="auto" height="auto"/></center>
        <div class="audio m-auto">
        <div class="audio-input text-center">   
          <img src={audiofile} alt="audiofile" className='mt-2' width="auto" height="150"/>      
          <br/>
          <span id="nofile-error"></span>
          <br/>
          <input type="file" id="file" accept="audio/*" onChange={handleFile}/>
          <label for="file" class="btn btn-primary"><i class="fa fa-plus"></i></label>
          <p id="filename"></p>
          <br/>
          <div class="audio-player mt-3">
            <ReactAudioPlayer
              className='col-xs-12 col-lg-6 col-md-6'
              src={audiopath}
              autoPlay
              controls
            />
          </div>  
          <button onClick={handleSubmit} class="btn btn-primary mt-2">Get the Transcript</button>
             
        
        <p id="upload-file-info"></p>
        <br/>
        {showwaitmessage && <p id="wait-message"> Please wait while we work on your audio file and generate the transcript ...</p>}
        {loadinggif_audio && <img class="col-xs-6 col-lg-3 col-md-6" src={loading} alt="loading" width="300px" height="200px"/>}
        <br/>
        {showsummarybutton && <textarea class="col-lg-8 col-md-8 col-xs-8" value={Transcript}disabled></textarea>}
        <br/>
        { showsummarybutton && <button onClick={transcript_downloader} class="btn btn-primary mt-2">Download Transcript</button>} 

        <br/>
        { showsummarybutton && <button onClick={getthesummary} class="btn btn-primary mt-2">Get the Summary</button>} 

        <br/>
        

        {showsummarywait && <p id="wait-message"> Please wait while we work on your audio file and generate the summary ...</p>}

        {loadinggif_summary && <img class="col-xs-6 col-lg-3 col-md-6" src={loading} alt="loading" width="300px" height="200px"/>}
        <br/>
        {downloadbuttonstatus && <textarea class="col-lg-8 col-md-8 col-xs-8" value={audiosummary} disabled></textarea>}
        <br/>
        {downloadbuttonstatus && <button onClick={input_text_downloader}  type="submit" class="btn btn-primary"> Download Summary</button>}                       
        
                
                
            
        </div>
        
    </div>
    </div>
  )
}

export default Speech