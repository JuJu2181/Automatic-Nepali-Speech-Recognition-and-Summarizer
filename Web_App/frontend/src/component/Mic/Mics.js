
import React from 'react';
import { ReactMic } from 'react-mic';
import AudioPlayer from "react-h5-audio-player";
import './mic.css';
import axios from 'axios';
import mic from '../../static/image/mic.jpg';




export default class Mics extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      record: false,
      wavFileblob: null,
      status:false,
      strokestate:false,
      selectedOption: "Wav2Vec",
      transcript:""
    }
  }

  changeOption = (e) => {
    let value = document.getElementById("select").value;
    this.setState({selectedOption:value});
    // console.log(value);
  }

  startRecording = () => {
    this.setState({ record: true });
    this.setState({status:false});
    this.setState({strokestate:true})
  }

  stopRecording = () => {
    this.setState({ record: false });
    this.setState({status:true});
    this.setState({strokestate:false});
  }

  // onData(recordedBlob) {
  //   console.log('chunk of real-time data is: ', recordedBlob);
  // }
  onStop = (blobObject) => {
    const { setAudioPath,wavFileblob } = this.props; // eslint-disable-line
    // console.info("onStop blobObject: ", blobObject);
    this.setState({
      blobURL: blobObject.blobURL,
      wavFileblob: blobObject.blob
    });
    blobObject.blobURL = new Date();
    // console.info("blobObject: ", blobObject);
    
    
    
  };
  // oncreate = (blobObject) => {
  //   this.setState

  // };
  Player = () => (
    this.state.status && <AudioPlayer autoPlay src={this.state.blobURL} onPlay={e => console.log("onPlay")} />  

  )
  render() {
      const {
        setAudioPath
      } = this.props;
      const handlesummary = async (e) => {
        document.getElementById("showstatus").style.display = "block";
        e.preventDefault();
        let audiolength = this.state.transcript.split(" ").length
        if (audiolength > 50){
          let data = {
            texts: this.state.transcript
          }
          let input = JSON.stringify(data)
          let customConfig = {
            headers: {
              'Content-Type': 'application/json'
            }
          }
          axios.post('http://localhost:8000/input-text',input, customConfig).then((res) => {
            this.setState({summary:res.data})
            document.getElementById("summary").style.display = "block";
            document.getElementById("showstatus").style.display = "none";
            
        })
        .catch((error) => {
          alert(" Server Error")
          console.log(error)
          document.getElementById("showstatus").style.display = "none";
        })
      }
      else{
        alert("Please record audio more than 50 words")
        document.getElementById("showstatus").style.display = "none";
      }
      }  
      const test_wav2vec = async (e) =>{
        //display the status and result
        document.getElementById("textsuccess").style.display = "none";
        document.getElementById("showstatus").style.display = "block";
        if (this.state.blobURL != null){
        let blob = await fetch(this.state.blobURL).then(r => r.blob());
        // console.log("blob: ", blob);
      
      
        let wavFile = new File([blob], "audio.wav"); 
        // {type:this.state.wavFileblob.type});
        //   console.log(wavFile);
        const formData = new FormData()
        formData.append('audio', wavFile)
        axios.post(      
          'http://localhost:8000/audio_live', formData
          
        )
        .then((res)=> {
          document.getElementById("textsuccess").style.display = "block";
          document.getElementById("showstatus").style.display = "none";
          document.getElementById("textsuccess").innerHTML = res.data
          this.setState({transcript:res.data})
          console.log(this.state.transcript)
       
        }  
        )
        .catch((error)=>{
          console.log(error)
          console.log("no response")
        })
      }
      else{
        alert("Please record audio first")
      }
        
     }
     const test_own = async (e) =>{
      document.getElementById("textsuccess").style.display = "none";
      document.getElementById("showstatus").style.display = "block";
      if (this.state.blobURL != null){
      let blob = await fetch(this.state.blobURL).then(r => r.blob());
      // console.log("blob: ", blob);
    
    
      let wavFile = new File([blob], "audio.wav"); 
      // {type:this.state.wavFileblob.type});
      //   console.log(wavFile);
      const formData = new FormData()
      formData.append('audio', wavFile)
      axios.post(      
        'http://localhost:8000/audio_live_own', formData
        
      )
      .then((res)=> {
        document.getElementById("showstatus").style.display = "none";
        document.getElementById("textsuccess").style.display = "block";
        document.getElementById("textsuccess").innerHTML = res.data
        this.setState({transcript:res.data})
        console.log(this.state.transcript)
        
      }  
      )
      .catch((error)=>{
        console.log("no response")
      })
    }
    else{
      alert("Please record audio first")
    }
      
   }
     let strokeColor=this.state.strokestate ? "green" : undefined
    return (
      <div className='audio'>
        <div>
          <span>Select the Model </span>
          
        <select id="select" onChange={this.changeOption}>
          <option value="Wav2Vec">Wav2Vec</option>
          <option value="CNN-ResNet-BiLSTM">CNN-Resnet</option>
        </select>
        <br/>
        <span>Current Model: {this.state.selectedOption}</span>
        </div>
        
        <img src={mic} alt="mic" className="mic mt-3" />
        <br/>
        <br/>
        <div className='audio__container'>
          
          <ReactMic
            onChange={this.onChange}
            record={this.state.record}
            className="sound-wave col"
            onStop={this.onStop}
            onData={this.onData}            
            strokeColor={strokeColor}
            strokeWidth={5}            
            backgroundColor="white" 
            setAudioPath={setAudioPath}
            mimeType="audio/wav"
            bitRate={256000}          // defaults -> 128000 (128kbps).  React-Mic-Gold only.
            sampleRate={96000}        // defaults -> 44100 (44.1 kHz).  It accepts values only in range: 22050 to 96000 (available in React-Mic-Gold)
            timeSlice={3000}
          />
          
          <br/>
          <br />
          {this.state.status &&
          <audio
            className='player col-xs-12 col-md-6 col-lg-6'
            ref="audioSource"
            controls="controls"
            src={this.state.blobURL}
          />
          } 
          <br/>
          <br/>
          <button className='btn col-2' onClick={this.startRecording} type="button"><i className='fa fa-play' style={{paddingRight:"5px",color:"green"}}></i>Start</button>
          <button className='btn col-2' onClick={this.stopRecording} type="button"><i className='fa fa-stop' style={{paddingRight:"5px",color:"green"}}></i> Stop</button>
          
          {this.state.selectedOption === "Wav2Vec"?<button className='btn col-2' onClick={test_wav2vec} type="button">Transcript- WV</button>:
          <button className='btn col-2' onClick={test_own} type="button">Transcript- CNN</button>}
        </div>
        <br/>
        <span id="showstatus" style={{color:"blue",display:"none"}}><i className="fa fa-info-circle" ></i> STT in Process...</span>
        
        <div class=" col">
            <div class=" col">
            <p id="textsuccess" class=" contain col">
            </p>
            </div>
        </div>
        {this.state.transcript === ""? null :<button id="sumbutton"className='btn col-2' onClick={handlesummary}> Summary </button>}
        <span id="showstatus" style={{color:"blue",display:"none"}}><i className="fa fa-info-circle" ></i> Summary in Process...</span>
        <br/>
        <center>
        <textarea  id="summary" style={{display:'none'}} class="col-lg-8 col-xs-8 col-md-8" value={this.state.summary}  disabled></textarea>
        </center>
      </div>

    );
  }
}
