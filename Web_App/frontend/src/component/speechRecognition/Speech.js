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

  // const [wordcount , setWordcount] = useState(0)
  // const [wordcountsummary , setWordcountsummary] = useState(0)

  // const domain_to_server = "192.168.50.31:8000";

  
  const getthesummary =async (e)=>{
    document.getElementById('summarybutton').disabled = true
    document.getElementById('summarybutton').style.cursor = 'not-allowed'
    let stringlength=audiofiletranscript.split(" ").length
    // console.log(stringlength)
    if(stringlength>50){
      setLoadinggif_summary(true)
      setsummarywait(true)
      const data = {
        texts: audiofiletranscript
      }
      // console.log(data)
      let input = JSON.stringify(data);
      let customConfig = {
      headers: {
      'Content-Type': 'application/json'
      }
      };
      
      // await axios.post(`http://192.168.50.31:8000/input-text`,
      // input, customConfig)
      await axios.post(`http://localhost:8000/input-text`,
      input, customConfig)
      .then(
        function(res){
          setLoadinggif_summary(false)
          setsummarywait(false)
          document.getElementById('summarybutton').disabled = false
        document.getElementById('summarybutton').style.cursor = 'pointer'
          setaudiosummary(res.data)
          var count = 0;
          for (var i = 0; i < res.data.length; i++) {
            if(res.data[i]===' '){
              count=count+1
            }
            
          }
          // setWordcountsummary(count)
         
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
    document.getElementById('audio-player').style.display = 'block'
    setAudiopath(URL.createObjectURL(e.target.files[0]))
    setAudio(e.target.files[0])
    // console.log(e.target.files[0].name)
    document.getElementById('filename').innerHTML = e.target.files[0].name
  }
  }
  const handleSubmit =async (e) => {   

    if (audio===''){
      document.getElementById('nofile-error').style.display = 'block'
      document.getElementById('audiofile').style.border = '2px dotted red'
    }
    else{
      let ext = audio.name.split('.').pop()
      let allowed_extensions = ['flac', 'wav', 'mp3', 'm4a', 'ogg', 'opus', 'webm'];
      if(allowed_extensions.includes(ext)){ 
        document.getElementById('upload-file-info').style.display = 'none'        
        document.getElementById('audiofile').style.border = '2px dotted green'
        document.getElementById('nofile-error').style.display = 'none'
        document.getElementById('transcriptbutton').disabled = true
        document.getElementById('transcriptbutton').style.cursor = 'not-allowed'
        setShowwaitmessage(true)
        setLoadinggif_audio(true) 
        const formData = new FormData()
        formData.append('audio', audio)
        await axios.post(      
          // `http://192.168.50.31:8000/audio`, formData
          `http://localhost:8000/audio`, formData
        )
        .then((res)=> {
          if(res.data==='fail'){
            document.getElementById('transcriptbutton').disabled = false
            document.getElementById('transcriptbutton').style.cursor = 'pointer'
            setShowwaitmessage(false)
            setLoadinggif_audio(false) 
            document.getElementById('upload-file-info').style.display = 'block'
          }
          else{
            setShowwaitmessage(false)
            setLoadinggif_audio(false)
            setShowbutton(true)
            
            
            // console.log(res)
            document.getElementById('upload-file-info').innerHTML = "Upload Success!"
            // document.getElementById("success").innerHTML = res.data
            // setTranscript(res.data)
            setTranscript(res.data)
            var count = 0;
            for (var i = 0; i < res.data.length; i++) {
              if(res.data[i]===' '){
                count=count+1
              }

            }
            
            document.getElementById('transcriptbutton').disabled = false
            document.getElementById('transcriptbutton').style.cursor = 'pointer'
            setAudiofiletranscript(res.data)
            const downloadTextFile = JSON.stringify(res.data);
            const blob = new Blob([downloadTextFile], { type: "text/plain" });
            const urls = URL.createObjectURL(blob);
            setTranscripturl(urls)
          }
        })

        .catch((err)=>{
          document.getElementById('transcriptbutton').disabled = false
          document.getElementById('transcriptbutton').style.cursor = 'pointer'
          // console.log(error)
          // console.log("no response")
          setShowwaitmessage(false)
          setLoadinggif_audio(false)
          document.getElementById('upload-file-info').style.display = 'block'
        })
      
      }
    
      else{       
        document.getElementById('nofile-error').style.display = 'block'
        document.getElementById('audiofile').style.border = '2px dotted red'
      } 
  }

  }  
  return (
    <div>
      <center><img src={stt} alt="stt" className='col-xs-12 col-lg-6 col-md-6 mt-2 mb-2' width="auto" height="auto"/></center>
        <div className="audio m-auto">
        <div className="audio-input text-center">   
          <img src={audiofile} alt="audiofile" className='mt-2' width="auto" height="150"/>      
          <br/>
          <span id="nofile-error" style={{display:'none'}}><i className='fa fa-exclamation-triangle'></i> Please Upload audio file</span>
          <br/>
          <input type="file" id="file" accept="audio/*" onChange={handleFile}/>
          <label id="audiofile" htmlFor="file" className="btn btn-primary" style={{borderRadius:"0px",border:"2px dotted"}}><i className="fas fa-upload" style={{color:"green"}}/> Upload Audio File</label>
          <p id="filename"></p>
          <br/>
          <div id='audio-player' className="audio-player mt-3" style={{display:'none'}}>
            <ReactAudioPlayer
              className='col-xs-12 col-lg-6 col-md-6'
              src={audiopath}
              autoPlay
              controls
            />
          </div>  
          <button id="transcriptbutton" onClick={handleSubmit} className="btn btn-primary "><i className='fa  fa-arrow-right' style={{color:"blue"}}/> Transcript</button>
             
        
        <p id="upload-file-info" style={{color:"red",display:"none",marginTop:"20px"}}>
        <i className='fa fa-exclamation-triangle'></i> There was error in uploading the file or server crashed. Please try again later.
        </p>
        <br/>
        {showwaitmessage && <p id="wait-message mt-5">Please wait while we work on your audio file and generate the transcript ...</p>}
        {loadinggif_audio && <img className="col-xs-6 col-lg-3 col-md-6" src={loading} alt="loading" width="300px" height="200px"/>}
        <br/>
        {!loadinggif_audio && showsummarybutton && <textarea className="col-lg-8 col-md-8 col-xs-8" value={Transcript}disabled></textarea>}
        {/* {!loadinggif_audio && showsummarybutton && <p>Total: {wordcount} words</p>} */}
        <br/>
        { !loadinggif_audio && showsummarybutton && <button onClick={transcript_downloader} className="btn btn-primary mt-2"><i className='fa  fa-download' style={{color:"blue"}}/> Transcript</button>} 

        <br/>
        { !loadinggif_audio && showsummarybutton && <button onClick={getthesummary} id="summarybutton" className="btn btn-primary mt-2"><i className='fa  fa-arrow-right' style={{color:"blue"}}/> Summary</button>} 

        <br/>
        

        {showsummarywait && <p id="wait-message"> Please wait while we work on your audio file and generate the summary ...</p>}

        {loadinggif_summary && <img className="col-xs-6 col-lg-3 col-md-6" src={loading} alt="loading" width="300px" height="200px"/>}
        <br/>
        {!loadinggif_summary && downloadbuttonstatus && <textarea className="col-lg-8 col-md-8 col-xs-8" value={audiosummary} disabled></textarea>

      }
      {/* {!loadinggif_summary && downloadbuttonstatus && <p>Total: {wordcountsummary} words</p>} */}
        <br/>
        {!loadinggif_summary && downloadbuttonstatus && <button onClick={input_text_downloader}  type="submit" className="btn btn-primary"> <i className='fa  fa-download' style={{color:"blue"}}/> Summary</button>}                       
        
                
                
            
        </div>
        
    </div>
    </div>
  )
}

export default Speech