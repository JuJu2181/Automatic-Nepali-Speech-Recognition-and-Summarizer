
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
      wavFileblob: null
    }
  }


  startRecording = () => {
    this.setState({ record: true });
  }

  stopRecording = () => {
    this.setState({ record: false });
  }

  onData(recordedBlob) {
    console.log('chunk of real-time data is: ', recordedBlob);
  }
  onStop = (blobObject) => {
    const { setAudioPath,wavFileblob } = this.props; // eslint-disable-line
    // console.info("onStop blobObject: ", blobObject);
    this.setState({
      blobURL: blobObject.blobURL,
      wavFileblob: blobObject.blob
    });
    blobObject.blobURL = new Date();
    console.info("blobObject: ", blobObject);
    
    
    
  };
  // oncreate = (blobObject) => {
  //   this.setState

  // };
  Player = () => (
    <AudioPlayer
      autoPlay
      src={this.state.blobURL}
      onPlay={e => console.log("onPlay")}
      // other props here
    />

  )
  
  

  render() {

    const {
        setAudioPath
      } = this.props;
      const test = async (e) =>{
        if (this.state.blobURL != null){
        let blob = await fetch(this.state.blobURL).then(r => r.blob());
        console.log("blob: ", blob);
      
      
        let wavFile = new File([blob], "audio.wav");
        // {type:this.state.wavFileblob.type});
          
        //   console.log(wavFile);
        const formData = new FormData()
        formData.append('audio', wavFile)
        axios.post(      
          'http://localhost:8000/audio_live', formData
          
        )
        .then((res)=> {
          
          console.log(res)
          
          document.getElementById("textsuccess").innerHTML = res.data
          
          
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
    return (
      <div className='audio'>
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
            strokeColor="green"
            strokeWidth={2}
            backgroundColor="white" 
            setAudioPath={setAudioPath}
            mimeType="audio/wav"
            bitRate={256000}          // defaults -> 128000 (128kbps).  React-Mic-Gold only.
            sampleRate={96000}        // defaults -> 44100 (44.1 kHz).  It accepts values only in range: 22050 to 96000 (available in React-Mic-Gold)
            timeSlice={3000}
          />
          <br/>
          <br />
          <audio
            className='player col-xs-12 col-md-6 col-lg-6'
            ref="audioSource"
            controls="controls"
            src={this.state.blobURL}
          />
          <br/>
          <br/>
          <button className='btn col-2' onClick={this.startRecording} type="button">Start</button>
          <button className='btn col-2' onClick={this.stopRecording} type="button">Stop</button>
          
          <button className='btn col-2' onClick={test} type="button">Transcript</button>
        </div>
        <br/>
        <div class=" col">
            <div class=" col">
            <p id="textsuccess" class=" contain col">

            </p>
            
            </div>
        </div>
        <br/>
        
        
      </div>

    );
  }
}
