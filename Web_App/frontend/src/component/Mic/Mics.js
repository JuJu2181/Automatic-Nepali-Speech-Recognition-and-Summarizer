
import React from 'react';
import { ReactMic } from 'react-mic';
import AudioPlayer from "react-h5-audio-player";
import './mic.css';
import axios from 'axios';
import mic from '../../static/image/mic.jpg';
const Diff = require('diff');




export default class Mics extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      record: false,
      wavFileblob: null,
      status:false,
      strokestate:false,
      selectedOption: "Wav2Vec",
      transcript:"",
      selectedOptionSummary: "Extractive",
      showEvaluation:false,
      userInput:""
    }
  }

  // domain_to_server = "192.168.50.31:8000";

  changeOption = (e) => {
    let value = document.getElementById("select").value;
    this.setState({selectedOption:value});
    // console.log(value);
  }
  changeOptionSummary = (e) => {
    let value = document.getElementById("selectsummary").value;
    this.setState({selectedOptionSummary:value});
    // console.log(value);
  }

  startRecording = () => {
    this.setState({ record: true });
    this.setState({status:false});
    this.setState({strokestate:true})
    document.getElementById("start-recording").style.display = "none";
    document.getElementById("stop-recording").style.display = "block";
    document.getElementById("displayAll").style.display = "none"
    document.getElementById("btn-start").style.display = "none";
    document.getElementById("btn-transcript").style.display = "none";
    document.getElementById("btn-stop").style.display = "inline";
    document.getElementById("summary").style.display = "none";
    this.setState({showEvaluation:false})
  }

  stopRecording = () => {
    this.setState({ record: false });
    this.setState({status:true});
    this.setState({strokestate:false});
    document.getElementById("start-recording").style.display = "block";
    document.getElementById("stop-recording").style.display = "none";
    document.getElementById("btn-transcript").style.display = "inline";
    document.getElementById("btn-start").style.display = "inline";
    document.getElementById("btn-stop").style.display = "none";
  }
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
        e.preventDefault();
        let audiolength = this.state.transcript.split(" ").length
        if (audiolength > 10){
          document.getElementById("summarystatus").style.display = "block";

          let data = {
            texts: this.state.transcript
          }
          let input = JSON.stringify(data)
          let customConfig = {
            headers: {
              'Content-Type': 'application/json'
            }
          }
          console.log(this.selectedOptionSummary)
          this.state.selectedOptionSummary === "Extractive"? 
          // await axios.post('http://tasr.eastus2.cloudapp.azure.com/input-text',input, customConfig)
          // await axios.post(`http://192.168.50.31:8000/input-text`,input, customConfig)
        
          await axios.post(`http://localhost:8000/input-text`,input, customConfig)
          .then((res) => {
            this.setState({summary:res.data})
            document.getElementById("summary").style.display = "block";
            document.getElementById("showstatus").style.display = "none";
            document.getElementById("summarystatus").style.display = "none";
            
          })
          .catch((error) => {
            alert(" Server Error")
            console.log(error)
            document.getElementById("showstatus").style.display = "none";
            document.getElementById("summarystatus").style.display = "none";
          }) :
          // await axios.post('http://tasr.eastus2.cloudapp.azure.com/abstract',input, customConfig)
          // await axios.post(`http://192.168.50.31:8000/abstract`,input, customConfig)  
          await axios.post(`http://localhost:8000/abstract`,input, customConfig)  
          .then((res) => {
            this.setState({summary:res.data})
            document.getElementById("summary").style.display = "block";
            document.getElementById("showstatus").style.display = "none";
            document.getElementById("summarystatus").style.display = "none";
            
        })
        .catch((error) => {
          alert(" Server Error")
          document.getElementById("showstatus").style.display = "none";
          document.getElementById("summarystatus").style.display = "none";
        })
      }
      else{
        alert("Please record audio more than 50 words")
        document.getElementById("showstatus").style.display = "none";
      }
      }  
      const test_wav2vec = async (e) =>{               
        //display the status and result
        this.setState({ showEvaluation: false });
        document.getElementById("displayAll").style.display = "none";
        document.getElementById("recordstatus").style.display = "none";
        document.getElementById("textsuccess").style.display = "none";
        document.getElementById("showstatus").style.display = "block";
        if (this.state.blobURL != null){
          //disbale the transcript btn
          document.getElementById("btn-transcript").disabled = true;
          document.getElementById("btn-transcript").style.cursor = "not-allowed";
          let blob = await fetch(this.state.blobURL).then(r => r.blob());
          // console.log("blob: ", blob);
          let wavFile = new File([blob], "audio.wav"); 
          // {type:this.state.wavFileblob.type});
          //   console.log(wavFile);
          const formData = new FormData()
          formData.append('audio', wavFile)
          
          await axios.post(      
            // 'http://tasr.eastus2.cloudapp.azure.com/audio_live', formData
            // `http://192.168.50.31:8000/audio_live`, formData
            `http://localhost:8000/audio_live`, formData
          )
          .then((res)=> {
            console.log(res.data)
            document.getElementById("liveOutput1").style.display = "flex";
            document.getElementById("textsuccess").style.display = "block";
            document.getElementById("showstatus").style.display = "none";
            document.getElementById("summarystatus").style.display = "none";
            document.getElementById("displayAll").style.display="block"
            document.getElementById("textsuccess").innerHTML = res.data.transcript
            this.setState({transcript:res.data.transcript})
          
            document.getElementById("btn-transcript").disabled = false;
            document.getElementById("btn-transcript").style.cursor = "pointer";
            if(res.data.time){
              document.getElementById("time").innerHTML = "Time Taken: "+res.data.time + " seconds"
            }
          }  
          )
          .catch((error) => {
            console.log(error)
            console.log(error ==="TypeError: Cannot read properties of null (reading 'style') at Mics.js:180:1 at async test_wav2vec (Mics.js:162:1)")
            document.getElementById("btn-transcript").disabled = false;
            document.getElementById("btn-transcript").style.cursor = "pointer";
            document.getElementById("showstatus").style.display = "none";
            document.getElementById("no-response").innerHTML="No response from server"
          })
          document.getElementById("showEvaluation").style.display ="inline";
        }
        else{
          document.getElementById("recordstatus").style.display = "block";
          document.getElementById("showstatus").style.display = "none";
        }
      //disbale the transcript btn
      
          
     }
    const test_own = async (e) => {
      this.setState({ showEvaluation: false });
      document.getElementById("displayAll").style.display = "none";
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
        await axios.post(      
          // 'http://tasr.eastus2.cloudapp.azure.com/audio_live_own', formData
          // `http://192.168.50.31:8000/audio_live_own`, formData
          `http://localhost:8000/audio_live_own`, formData
        )
        .then((res)=> {
          document.getElementById("showstatus").style.display = "none";
          document.getElementById("textsuccess").style.display = "block";
          document.getElementById("displayAll").style.display="block"          
          document.getElementById("textsuccess").innerHTML = res.data.transcript
          this.setState({transcript:res.data.transcript})
          if(res.data.time){
            document.getElementById("time").innerHTML = "Time Taken: "+res.data.time+ "seconds"
          }
          
        }  
        )
        .catch((error)=>{
          document.getElementById("showstatus").style.display = "none";
            document.getElementById("no-response").innerHTML="No response from server"
        })
        document.getElementById("showEvaluation").style.display ="inline";
      }
      else{
        alert("Please record audio first")
        document.getElementById("showstatus").style.display = "none";
      }
      
   }
     let strokeColor=this.state.strokestate ? "green" : undefined
    return (
      <div className='audio'>
          <h2 className="sectionTitle">Live Nepali ASR</h2>
          <center>       
            <div className='model-selection col-lg-6 col-sm-12 col-xs-12 col-md-8 mt-5'>
              <span>Select the Model </span>
              <select id="select" onChange={this.changeOption} style={{width:"30%"}}>
                <option value="Wav2Vec">Wav2Vec</option>
                <option value="CNN-ResNet-BiLSTM">CNN-Resnet</option>
              </select>         
              <br/>
              <span>Current Model: {this.state.selectedOption}</span>
              </div>
              <br/>
            <span className='titleNote'>Note: For better results use a proper 🎤 or 🎧 at low noise 🔊</span>
              <div className='model-selection model-text col-lg-6 col-sm-12 col-xs-12 col-md-8 mt-4'>
              <span >🗣️ Try This</span><br/>
            <span>अनुशासन एक त्यस्तो गुण हो जसद्वारा व्यक्तिले आफ्ना भावनाहरू र व्यवहारलाई नियन्त्रण गर्न सिक्छ। हाम्रो जीवनको हरेक मार्गमा अनुशासन अत्यन्त मूल्यवान छ। यसले व्यक्तिलाई जीवनमा प्रगति गर्न र सफलता प्राप्त गर्न प्रेरित गर्दछ। हामीले स्कूल, घर, कार्यालय, संस्था, कारखाना, खेल मैदान, रणभूमि वा अन्य स्थानमा अनुशासनको पालना गर्नुपर्दछ। अनुशासनले हामीलाई परिपक्व,सोच्न कार्य गर्न र जिम्मेवार निर्णयहरू लिन सक्षम गर्दछ।</span>
            </div>    
          </center> 
        
        
        <img src={mic} alt="mic" className="mic mt-3" />
        <br/>
        <br/>
        <div className='audio__container'>
          
          <ReactMic
            onChange={this.onChange}
            record={this.state.record}
            className="sound-wave col"
            // visualSetting="frequencyBars"
            visualSetting="sinewave"
            onStop={this.onStop}
            onData={this.onData}            
            // strokeColor={strokeColor}
            // strokeColor="#b22222"
            strokeColor="#4059Ad"
            strokeWidth={10}            
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
          <span id="start-recording" style={{color:"blue"}}>Click on start to start new recording</span>
          <span id="stop-recording" style={{color:"blue",display:"none"}}>
            <div className='record-status'><div className='circle'></div><span id="recording"style={{marginTop:"4px"}}> Recording</span></div>
            Click on stop to stop recording
          </span>
          <br/>
          <button className='btn col-2' onClick={this.startRecording} type="button" id="btn-start"><i className='fa fa-play' style={{paddingRight:"5px",color:"black"}}></i>Start</button>
          <button className='btn col-2' onClick={this.stopRecording} type="button" id="btn-stop"><i className='fa fa-stop' style={{paddingRight:"5px",color:"black"}}></i> Stop</button>
          
          {this.state.selectedOption === "Wav2Vec"?<button className='btn col-2' id="btn-transcript"onClick={test_wav2vec} type="button">Transcript- WV</button>:
          <button className='btn col-2' id="btn-transcript" onClick={test_own} type="button">Transcript- CNN</button>}
        </div>
        <br/>
        <span id="showstatus" style={{color:"green",display:"none"}}><i className="fa fa-info-circle" ></i> STT in Process...</span>
        <span id="recordstatus" style={{color:"red",display:"none"}}><i className="fa fa-exclamation-triangle" ></i> Please Record Audio</span>
        <span id="no-response" style={{color:'red'}}></span>
        <div id="displayAll" style={{display:"block"}}>
          <div className=" col">
            <div className=" col">
              <div className="liveOutput" id="liveOutput1">
              <span className='outputTitle'>Predicted Transcript ⬇️: </span>
              <p id="textsuccess" style={{color:'darkgreen'}} className="contain col outputText">
                </p>
              </div>
              <span id="time" style={{color:'Blue'}}></span>              
              </div> 
          </div>
          
          

          {this.state.transcript === "" ? null : <>
          <button onClick={()=>{
            const downloadTextFile = JSON.stringify(this.state.transcript);
            const blob = new Blob([downloadTextFile], { type: "text/plain" });
            const tempLink = document.createElement('a');
            tempLink.href = URL.createObjectURL(blob);;
            tempLink.setAttribute('download', 'summary.txt');
            tempLink.click();
            }} type="submit" className="btn btn-primary"><i className='fa  fa-download' style={{ color: "blue" }} /> Transcript</button>
          <button id="showEvaluation" className='btn col-2' onClick={()=>{
                this.setState({showEvaluation:true})
                document.getElementById("showEvaluation").style.display = "none";
              document.getElementById("evalbutton").style.display = "inline";
              }}> Evaluate Transcript</button>
            {this.state.showEvaluation ? <><div className='evaluateOutput'><span className='outputTitle'>Enter Actual Transcript ⬇️: </span><textarea onChange={(e)=>{
            this.setState({userInput:e.target.value})

            }} id="textholder" className=" col-xs-12 col-sm-12 col-md-8 col-lg-8" placeholder='कृपया तपाईंले बोलेको पाठ प्रविष्ट गर्नुहोस्'></textarea>
            </div>
            <button id="evalbutton" className='btn col-2' onClick={async (e)=>{
              if(this.state.userInput===""){
                alert("Please enter text to evaluate")
              }
              else{
                const data ={
                  userText: this.state.userInput,
                  userTranscript: this.state.transcript
                }                        
                let input = JSON.stringify(data);
                console.log(input)
                let customConfig = {
                headers: {
                'Content-Type': 'application/json'
                }};
                await axios.post("http://localhost:8000/evaluate",input, customConfig)
                .then(res => {
                  console.log(res.data)
                  if (res.data.cer != null && res.data.wer != null) {
                    document.getElementById("EvaluationResult").style.display = "flex";
                  document.getElementById("cer").innerHTML = "CER: "+res.data.cer;
                  document.getElementById("wer").innerHTML = "WER: "+res.data.wer;
                  document.getElementById("representation").innerHTML ="Note: 🔴removed character, 🟢added character, ⚫correct character"
                  }
                  function redTheDiff(){
                    let b= data.userTranscript //transcript
                    let a= data.userText //userInput
                    console.log(a)
                    console.log(b)

                    let diff = Diff.diffChars(a, b);
                    console.log(diff)
                    let result = "";

                    diff.forEach(function(part) {
                      // if the part is removed or added, wrap it in a span element with red color
                      let color = part.added ? 'green' : part.removed ? 'red' : 'black';
                      result += '<span style="color:' + color + '">' + part.value + '</span>';
                    });
                    document.getElementById("resultDiff").innerHTML = result;
                  }
                  redTheDiff();
                  // document.getElementById("evalbutton").style.display = "none";
                })
                .catch(err => {
                  console.log(err)
                }
                )
                
              }

            }}> Evaluate
          </button>  
              <div className='showEvaluation-result' id="EvaluationResult">
              <span className='outputTitle'>Evaluated Scores ⬇️:</span>
              <span id="cer"></span>
              <span id="wer"></span>
              <span className='outputTitle'>Difference Between Transcripts ⬇️</span>
              <span id="resultDiff"></span>
              <span id="representation"> </span>
            </div>
            </> : null}
            <span className="sectionDivider"></span>
            <center>       
            <h2 className="sectionTitle">Nepali Text Summarization</h2>
            <div className='model-selection col-lg-6 col-sm-12 col-xs-12 col-md-8 mt-5'>
              <span>Select Summary Method </span>
              <select id="selectsummary" onChange={this.changeOptionSummary} style={{width:"30%"}}>
                <option value="Extractive">Extractive</option>
                <option value="Abstractive">Abstractive</option>
              </select>         
              <br/>
              <span>Summary Method: {this.state.selectedOptionSummary}</span>
            </div>
          </center>
          <button id="sumbutton"className='btn col-2 mt-3' onClick={handlesummary}> Get Summary </button></>}
          <span id="summarystatus" style={{color:"blue",display:"none"}}><i className="fa fa-info-circle" ></i> Summary in Process...</span>
          <br/>
          <center>
            <div className='summary' id="summary" style={{ display: 'none' }}  >
            <div className="summaryOutput" id='summaryOutput'>
            <span className='outputTitle'>Generated Summary ⬇️: </span>
                <textarea className="col-lg-8 col-xs-8 col-md-8" value={this.state.summary} disabled></textarea>
              </div>
          <button onClick={()=>{
            const downloadTextFile = JSON.stringify(this.state.summary);
            const blob = new Blob([downloadTextFile], { type: "text/plain" });
            const tempLink = document.createElement('a');
            tempLink.href = URL.createObjectURL(blob);;
            tempLink.setAttribute('download', 'summary.txt');
            tempLink.click();
          }} type="submit" className="btn btn-primary"><i className='fa  fa-download' style={{color:"blue"}}/> Summary</button>
          </div>

          </center>
        </div>  
      </div>
    );
  }

}
