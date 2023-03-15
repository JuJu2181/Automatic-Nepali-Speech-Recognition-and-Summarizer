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
  const handleSubmit =async (e) => {
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
        await axios.post("http://tasr.eastus2.cloudapp.azure.com/text",formData)
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
        document.getElementById('summbtn').disabled=false;
        document.getElementById('summbtn').style.cursor='pointer';
        setWaitstatus(false)
        document.getElementById("upload").innerHTML="Request Failed, Try again!" 
        
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
  const textSubmit = async(e) => {    
      if(input_text===''){
        document.getElementById('textholder').style.border='2px solid red';
        document.getElementById("input-text-error").innerHTML = "कृपया नेपाली मात्र प्रविष्ट गर्नुहोस् |";
      }else{
        // eslint-disable-next-line no-control-regex
        const regex = /[^\u0000-\u007F]+/g;
        let nepaliText = input_text.match(regex)
        console.log(nepaliText)
        if(nepaliText===null){
          document.getElementById('textholder').style.border='2px solid red';
          document.getElementById("input-text-error").innerHTML = "कृपया नेपाली मात्र प्रविष्ट गर्नुहोस् |"
        }
        else{
          nepaliText = nepaliText.join(' ').trim()
          let strlen = nepaliText.split(' ').length        
          if(strlen >= 50){
            const data ={
              texts: nepaliText
            }
                        
              let input = JSON.stringify(data);
              let customConfig = {
              headers: {
              'Content-Type': 'application/json'
              }};
              setTalakoWaitstatus(true)
              await axios.post('http://tasr.eastus2.cloudapp.azure.com/input-text',input, customConfig)
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
                  document.getElementById("input-text-error").style.display = "none"
                  document.getElementById('textholder').style.border='2px solid green';

                }
              )
              .catch((err)=>{
                setTalakoWaitstatus(false)
                document.getElementById("input-text-error").innerHTML = "Request was not handled!"

              }) 
            
          } else {
            document.getElementById("input-text-error").innerHTML = "कृपया 50 भन्दा बढी शब्दहरू टाइप गर्नुहोस् |"
          }
        }
      }  
      
    }
        
  return (
    <div>
      <p className='summaryTitle mt-3 text-center'>|| SUMMARY || सारांश ||</p>
        <div className="text mt-2">        
        <div className="text-input  mt-5">
              <img src={txtfile} alt="txtfile" className='textfile mt-2' height={100} />
              <p className='filesummary'>FILE SUMMARY</p> 
              <span id='nofile-error' className='error' style={{display:"none"}}><i className='fa fa-exclamation-triangle'></i> Please select the file</span>
              <br/>
              <input type="file" id="file" accept="text/plain" onChange={handleFile} required/>                            
              <label id="txtfile" htmlFor="file" className="btn btn-primary" style={{border:"2px dotted",borderRadius:"0px"}}><i className="fas fa-upload" style={{color:"green"}}/> Upload txt File</label>
              <br/>
              <p className="filename col">
                {txt.fileName} 
              </p>
              </div> 
              <p id ="upload" className="message col">
              </p>                    
              <br/>
              <div className="text-content col">                    
              <button onClick={handleSubmit} id="summbtn" type="submit" className="btn btn-primary "><i className='fa  fa-arrow-right' style={{color:"orange"}}/>Summary</button>
              <br/>
              <br/>
              {waitstatus && <img className="col-xs-6 col-lg-3 col-md-6" src={loading} alt="wait" width="auto" height="auto"/>}
              <p id="success text-black"></p> 
              { !waitstatus && downloadbuttonstatusfile && <textarea className="col-lg-8 col-xs-12 col-sm-12 col-md-8" value={mathikosummary} disabled></textarea>}
              <br/>
              {downloadbuttonstatusfile && <button onClick={input_text_downloader}  type="submit" className="btn btn-primary"><i className='fa  fa-download' style={{color:"blue"}}/> Summary</button>}
                  
        </div>
        <br/><br/>        
    </div>
    {/* text input */}
    <hr/>
    <div className="text">
        <div className="text-input text-center mt-1">
          <img src={type} alt="type" className='textfile mt-5' height={100} />
          <p className='filesummary'>TEXTS SUMMARY</p>
          <br/>
          <textarea onChange={texthandle} id="textholder" className=" col-xs-12 col-sm-12 col-md-8 col=lg-8" placeholder='कृपया नेपाली मात्र प्रविष्ट गर्नुहोस्'></textarea>
          <br/>
          <span id="input-text-error"></span>
          <br/>
          <button onClick={textSubmit}  type="submit" className="btn btn-primary mt-2"><i className='fa fa-arrow-right' style={{color:"orange"}}/>  Summary</button>
          <br/>
          {TalakoWaitstatus && <img className="col-xs-6 col-lg-3 col-md-3" src={loading} alt="wait" width="200px" height="200px"/>}
          <br/>
          <p id="success text-black"></p>
          {!TalakoWaitstatus && downloadbuttonstatustext && <textarea className="col-lg-8 col-xs-8 col-md-8" value={talakosummary} disabled></textarea>}
          <br/>
          {downloadbuttonstatustext && <button onClick={text_downloader}  type="submit" className="btn btn-primary mt-1"> <i className='fa  fa-download' style={{color:"blue"}}/> Summary</button>}
    </div>
    <br/>
    <br/>
  </div>
  <br/>

</div>
  )
}
