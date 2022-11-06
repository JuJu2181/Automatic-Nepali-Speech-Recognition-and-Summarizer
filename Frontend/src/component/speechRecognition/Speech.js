import React, {useState} from 'react'
import './speech.css'
import axios from 'axios'
import ReactAudioPlayer from 'react-audio-player'
import loading from '../../gif/256.gif'

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
  //transcript download garnalai
  const [downloadbuttonstatustranscript, setDownloadbuttonstatustranscript] = useState(false)
  // const[transcript, setTranscript] = useState('')
  //getthesummary from the audiotranscript, audiotranscript is stores in {audiofiletranscript}

  

  
  const getthesummary =(e)=>{
    let stringlength=audiofiletranscript.length
    console.log(stringlength)
    if(stringlength>40){
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
          document.getElementById('audio_transcript').innerHTML = res.data
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
    console.log(e.target.files[0])
    if(e.target.files[0]==='undefined'){
      alert("Please upload a .flac or .wav file")

    }else{
    setAudiopath(URL.createObjectURL(e.target.files[0]))
    setAudio(e.target.files[0])
    console.log(e.target.files[0])
  }
  }
  const handleSubmit = (e) => {   

    
    let ext=audio.name.split('.').pop()
    if(ext === 'flac'){    
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
        setDownloadbuttonstatustranscript(true)
        console.log(res)
        document.getElementById('upload-file-info').innerHTML = "Upload Success!"
        document.getElementById("success").innerHTML = res.data
        // setTranscript(res.data)
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
      })
      
    } 
    
    else{
      alert("Please upload a .flac or .wav file")
    }  

  }  
  return (
    <div>
        <div class="audio">
        <div class="audio-input text-center mt-5">
            
                <h1>Audio File</h1>
                <hr/>
                <p>To get the summary, you can upload recorded audio file.
                  <br/>
                  To upload the file click on plus sign!
                  To download the transcript, click on the Download Transcript button!
                  
                  </p>
                <br/>
              
                
                    <input type="file" id="file" accept="audio/*" onChange={handleFile}/>
                    <label for="file" class="btn btn-primary"><i class="fa fa-plus"></i></label>
                    <br/>
                    <div class="audio-player mt-3">
                      <ReactAudioPlayer
                        src={audiopath}
                        autoPlay
                        controls
                      />
                    </div>  
                    <button onClick={handleSubmit} class="btn btn-primary mt-2">Get the Transcript</button>

                
                <br/>
                <p id="upload-file-info"></p>
                <br/>
                {showwaitmessage && <p id="wait-message"> Please wait while we work on your audio file and generate the transcript ...</p>}
                {loadinggif_audio && <img src={loading} alt="loading" width="100px" height="100px"/>}
                
                <div class=" col">
                      <div class=" col">
                      <p id="success" class=" contain col">

                      </p>    
                      <br/>
                      
                    </div>
                </div>
                { showsummarybutton && <button onClick={getthesummary} class="btn btn-primary mt-2">Get the Summary</button>} 
                <br/>
                
                { downloadbuttonstatustranscript && <button onClick={transcript_downloader} class="btn btn-primary mt-2">Download Transcript</button>} 
                <br/>
                <br/>

                {showsummarywait && <p id="wait-message"> Please wait while we work on your audio file and generate the summary ...</p>}

                {loadinggif_summary && <img src={loading} alt="loading" width="100px" height="100px"/>}
                <div class=" col">
                  <div class=" col">
                  <p id="audio_transcript" class=" contain col">

                  </p>
                  
                  </div>
                </div> 
                {downloadbuttonstatus && <button onClick={input_text_downloader}  type="submit" class="btn btn-primary"> Download-summary</button>}                       
                
                
                
            
        </div>
        <br/>
    </div>
    </div>
  )
}

export default Speech