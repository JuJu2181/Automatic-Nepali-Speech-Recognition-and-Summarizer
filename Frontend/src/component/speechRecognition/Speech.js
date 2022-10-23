import React, {useState} from 'react'
import './speech.css'
import axios from 'axios'
import ReactAudioPlayer from 'react-audio-player'

function Speech() {
  const [audio, setAudio] =useState('')
  const [audiopath, setAudiopath] =useState('')
  const handleFile = (e) => {
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
      const formData = new FormData()
      formData.append('audio', audio)
      axios.post(      
        'http://localhost:8000/audio', formData
        
      )
      .then((res)=> {
        console.log(res)
        document.getElementById("success").innerHTML = "The file is uploaded!"
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
                <p>Upload the Audio File</p>
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
                <p id="success">
                
                </p>
                  
                <p class="trascript mt-5">
                    The Transcript appears here!
                </p>
                
                
            
        </div>
    </div>
    </div>
  )
}

export default Speech