import React, {useState}from 'react'
import './summary.css'
import axios from 'axios'
import loading from '../../gif/256.gif'
import txtfile from '../../static/image/txtfile.jpg'
import type from '../../static/image/type.jpg'

export default function Summary() {
  

  const[text,setText] = useState('')
  const [txt, setTxt] = useState({
    fileName: '',
    fileContent: '',
  })
  const [mathikosummary,setmathikosummary] = useState('')
  const [talakosummary,settalakosummary] = useState('')
  const[input_text,setInput_text] = useState('')
  //sets the urlblob of the summary for texts given by user
  const [url_text,setUrl_text] = useState('')
  //sets the urlblob of the summary for input file txt
  const [url_text_input,setUrl_text_input] = useState('')
  //text bata ako summary download garnalai
  const [downloadbuttonstatustext, setDownloadbuttonstatustext] = useState(false)
  //file bata ako summary download garnalai
  const [downloadbuttonstatusfile, setDownloadbuttonstatusfile] = useState(false)
  //loading or wait message dekhualai
  const[waitstatus,setWaitstatus] = useState(false)
  const[TalakoWaitstatus,setTalakoWaitstatus] = useState(false)
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
  //this handle the input file as event catch   
  const handleFile = (e) => { 
      setText(e.target.files[0])      
      let ext=e.target.files[0].name.split('.').pop()
      if(ext === 'txt'){
        let file = e.target.files[0]
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          setTxt({
            fileName: file.name,
            fileContent: reader.result,
          });
          
        };
        reader.onerror = () => {
          alert('error');
        };
        
      }
      else{
        alert('Please upload a text file')
      }  
    console.log(txt.fileName,txt.fileContent)  
  }
  const handleSubmit =(e) => {
    if(text===''){
      document.getElementById('nofile-error').style.display='block';
      document.getElementById('txtfile').style.border='2px solid red';
    }else{
      let regex = "[\u0900-\u097F]+";
      if(txt.fileContent.match(regex)){
        document.getElementById('nofile-error').style.display='none';
        document.getElementById('summbtn').disabled=true;
        document.getElementById('summbtn').style.cursor='not-allowed';
        setWaitstatus(true)     
        const formData= new FormData()      
        formData.append('text',text)
        axios.post('http://localhost:8000/text',formData)
        .then( 
          function(res){
            document.getElementById('summbtn').disabled=false;
            document.getElementById('summbtn').style.cursor='pointer';
            setDownloadbuttonstatusfile(true)
            setWaitstatus(false)
            // var obj=JSON.parse(JSON.stringify(res.data))
          document.getElementById("upload").innerHTML="Upload Success"          
          setmathikosummary(res.data)
          const downloadTextFile = JSON.stringify(res.data);
          const blob = new Blob([downloadTextFile], { type: "text/plain" });
          const urls = URL.createObjectURL(blob);
          setUrl_text_input(urls)
        }
        )
      .catch((err)=>{
        console.log(err)
      })  
      }
      else{
        alert('Please upload a Nepali text file');
      }  
    }}  // texthande
  // this downloads the input texts summary
  const text_downloader = (e) => {
    if(url_text===''){
      alert('Please enter the text')
    }else{
      const tempLink = document.createElement('a');
      tempLink.href = url_text;
      tempLink.setAttribute('download', 'summary.txt');
      tempLink.click();
    }}
  //this handles the input text as event catch
  const texthandle = (e) => {
    if(e.target.value===''){
      document.getElementById('textholder').style.border='1px solid red'
    }
    else{
    setInput_text(e.target.value)
    }// console.log(e.target.value)
  }
  // <p>{txt.fileContent}</p>
  //this handles the connection to server submit click garesi acios le return garxa accordingly
  const textSubmit = (e) => {
    const data = {
      texts: input_text
    }
    let strlen= input_text.length
    if(input_text===''){
      document.getElementById('textholder').style.border='2px solid red';
      document.getElementById('textholder').placeholder='Please enter the text'
    }
    else if(strlen>100){
      console.log(data)
      let input = JSON.stringify(data);
      let customConfig = {
      headers: {
      'Content-Type': 'application/json'
      }};
      // validation of nepali texts from frontend
      var numberOfNepaliCharacters = 128;
      var unicodeShift = 0x0900;
      var NepaliAlphabet = [];
      for(var i = 0; i < numberOfNepaliCharacters; i++) {
        NepaliAlphabet.push("\\u0" + (unicodeShift + i).toString(16));
      }
      var regex = new RegExp("(?:^|\\s)["+NepaliAlphabet.join("")+"]+?(?:\\s|$)", "g");
      [input_text.match(regex) ].forEach(function(match) {
        if(match) {
          setTalakoWaitstatus(true)
          axios.post('http://localhost:8000/input-text',
        input, customConfig)
        .then(
          function(res){            
            setTalakoWaitstatus(false)            
            setDownloadbuttonstatustext(true)
            console.log(res.data)
            const downloadTextFile = JSON.stringify(res.data);
            const blob = new Blob([downloadTextFile], { type: "text/plain" });
            const url_text = URL.createObjectURL(blob);
            setUrl_text(url_text)
            settalakosummary(res.data)            
          }
        )
        } else {
          document.getElementById("input-text-error").innerHTML = "Please enter a valid Nepali sentence"
        }
      });
    }
    else{
      alert("The text contains less than 1000 characters")
    }      
  }
  return (
    <div>
      <p className='summaryTitle mt-3 text-center'>|| SUMMARY || सारांश ||</p>
        <div class="text mt-2">        
        <div class="text-input  mt-5">
              <img src={txtfile} alt="txtfile" className='textfile mt-2' height={100} />
              <p className='filesummary'>FILE SUMMARY</p> 
              <span id='nofile-error' className='error' style={{display:"none"}}><i className='fa fa-exclamation-triangle'></i> Please select the file</span>
              <br/>
              <input type="file" id="file" accept="text/plain" onChange={handleFile} required/>                            
              <label id="txtfile" for="file" class="btn btn-primary" style={{border:"2px dotted",borderRadius:"0px"}}><i class="fas fa-file" style={{color:"green"}}/> Upload txt File</label>
              <br/>
              <p class="filename col">
                {txt.fileName} 
              </p>
              </div> 
              <p id ="upload" class="message col">
              </p>                    
              <br/>
              <div class="text-content col">                    
              <button onClick={handleSubmit} id="summbtn" type="submit" class="btn btn-primary "><i className='fa  fa-arrow-right' style={{color:"orange"}}/>Summary</button>
              <br/>
              <br/>
              {waitstatus && <img class="col-xs-6 col-lg-3 col-md-6" src={loading} alt="wait" width="auto" height="auto"/>}
              <p id="success text-black"></p> 
              { !waitstatus && downloadbuttonstatusfile && <textarea class="col-lg-8 col-xs-8 col-md-8" value={mathikosummary} disabled></textarea>}
              <br/>
              {downloadbuttonstatusfile && <button onClick={input_text_downloader}  type="submit" class="btn btn-primary"><i className='fa  fa-download' style={{color:"blue"}}/> Summary</button>}
                  
        </div>
        <br/><br/>        
    </div>
    {/* text input */}
    <hr/>
    <div class="text">
        <div class="text-input text-center mt-1">
          <img src={type} alt="type" className='textfile mt-5' height={100} />
          <p className='filesummary'>TEXTS SUMMARY</p>
          <br/>
          <textarea onChange={texthandle} id="textholder" class=" col-6" placeholder='Please type Nepali only || कृपया नेपाली मात्र प्रविष्ट गर्नुहोस्'></textarea>
          <br/>
          <span id="input-text-error"></span>
          <br/>
          <button onClick={textSubmit}  type="submit" class="btn btn-primary mt-2"><i className='fa fa-arrow-right' style={{color:"orange"}}/>  Summary</button>
          <br/>
          {TalakoWaitstatus && <img class="col-xs-6 col-lg-3 col-md-3" src={loading} alt="wait" width="200px" height="200px"/>}
          <br/>
          <p id="success text-black"></p>
          {!TalakoWaitstatus && downloadbuttonstatustext && <textarea class="col-lg-8 col-xs-8 col-md-8" value={talakosummary} disabled></textarea>}
          <br/>
          {downloadbuttonstatustext && <button onClick={text_downloader}  type="submit" class="btn btn-primary mt-1"> <i className='fa  fa-download' style={{color:"blue"}}/> Summary</button>}
    </div>
    <br/>
    <br/>
  </div>
  <br/>

</div>
  )
}
