import React, {useState}from 'react'
import './summary.css'
import axios from 'axios'

export default function Summary() {
  

  const[text,setText] = useState('')
  const [txt, setTxt] = useState({
    fileName: '',
    fileContent: '',
  })

  const[input_text,setInput_text] = useState('')

  //sets the urlblob of the summary for texts given by user
  const [url_text,setUrl_text] = useState('')

  //sets the urlblob of the summary for input file txt
  const [url_text_input,setUrl_text_input] = useState('')

  //text bata ako summary download garnalai
  const [downloadbuttonstatustext, setDownloadbuttonstatustext] = useState(false)

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
  
  const handleFile = (e) => {  
        
      console.log(e.target.files[0])
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
    
    
  }
  const handleSubmit =(e) => {
    if(text===''){
      document.getElementById('nofile-error').innerHTML = 'No file selected'
    }else{  
    
      const formData= new FormData()
      
        formData.append('text',text)
        axios.post('http://localhost:8000/text',formData)
        .then( 
          function(res){
            // var obj=JSON.parse(JSON.stringify(res.data))
          document.getElementById("upload").innerHTML="Upload Success"
          document.getElementById("success").innerHTML = res.data
          console.log(res.data)
          const downloadTextFile = JSON.stringify(res.data);
          const blob = new Blob([downloadTextFile], { type: "text/plain" });
          const urls = URL.createObjectURL(blob);
          setUrl_text_input(urls)
          }
          
        

      )
    }  
    
  }
  // texthande

  // this downloads the input texts summary
  const text_downloader = (e) => {
    if(url_text===''){
      alert('Please enter the text')
    }
    else{
      const tempLink = document.createElement('a');
      tempLink.href = url_text;
      tempLink.setAttribute('download', 'summary.txt');
      tempLink.click();

    }  
    
  }
  //this handles the input text as event catch
  const texthandle = (e) => {
    setInput_text(e.target.value)
    
    console.log(e.target.value)
    

  }

  //this handles the connection to server submit click garesi acios le return garxa accordingly
  const textSubmit = (e) => {
    const data = {
      texts: input_text
    }
    console.log(data)
    let input = JSON.stringify(data);
    let customConfig = {
    headers: {
    'Content-Type': 'application/json'
    }
    };
    console.log(input)
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
        axios.post('http://localhost:8000/input-text',
      input, customConfig)
      .then(
        function(res){
          
          
          document.getElementById("textsuccess").innerHTML = res.data
          setDownloadbuttonstatustext(true)
          console.log(res.data)
          const downloadTextFile = JSON.stringify(res.data);
          const blob = new Blob([downloadTextFile], { type: "text/plain" });
          const url_text = URL.createObjectURL(blob);
          setUrl_text(url_text)
          
        }
      )
      } else {
        document.getElementById("input-text-error").innerHTML = "Please enter a valid Nepali sentence"
      }
    });

      
  }
  




  return (
    <div>
        <div class="text mt-2">
        <div class="text-input text-center mt-5">
                <br/>
                <h1>Summary From Input</h1>
                <hr/>
                <p>To get the summary, you can upload txt file of nepali charaters.
                  <br/>
                  To upload the file click on plus sign!
                  
                  </p>
                <br/>
              
                    <span id="nofile-error"></span>
                    <br/>
                    <input type="file" id="file" accept="txt/*" onChange={handleFile} required/>
                    
                    
                    <label for="file" class="btn btn-primary"><i class="fas fa-plus"></i></label>
                    <br/>
                    <p class="filename col">
                      {txt.fileName} 
                    </p>
                    
                    <br/>
                    <div class="text-content col">
                    <p>{txt.fileContent}</p>
                    </div> 
                    <p id ="upload" class="message col">
                    </p>
                      
                    
                    <button onClick={handleSubmit}  type="submit" class="btn btn-primary mt-1">Get the Summary</button>
                    <p id="success text-black"></p>
                    
                    
                    
                    <div class=" col">
                      <div class=" col">
                      <p id="success" class=" contain col">

                      </p>    
                      <br></br>
                      
                      </div>
                    </div>
                    <button onClick={input_text_downloader}  type="submit" class="btn btn-primary"> Download-summary</button>
                    
                
                
            
        </div>
        <br></br>
        <br></br>
    </div>
    {/* text input */}
    <div class="text">
        <div class="text-input text-center mt-5">
          <br/>
          <h1>Summary from Texts</h1>
          <hr/>     
          <p>To get the summary, you can enter the nepali texts.
            <br/>
            You need enter the Nepali texts to get summary.
            </p>           
          <br/>
          <textarea onChange={texthandle} class=" col-6" placeholder='कृपया नेपाली मात्र प्रविष्ट गर्नुहोस्'></textarea>
          <br/>
          <span id="input-text-error"></span>
          <br/>                     
              
          <button onClick={textSubmit}  type="submit" class="btn btn-primary mt-2"> Summary</button>
          <p id="success text-black"></p>
          
          
          
          <div class=" col">
            <div class=" col">
            <p id="textsuccess" class=" contain col">

            </p>
            
            </div>
          </div>
          {downloadbuttonstatustext && <button onClick={text_downloader}  type="submit" class="btn btn-primary mt-1"> Download-summary</button>}
   
          
          
      
  </div>
  <br></br>
  <br></br>
    </div>
    <br/>

    </div>
  )
}
