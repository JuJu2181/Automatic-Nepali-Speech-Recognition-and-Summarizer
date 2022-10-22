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
  
  const handleFile = (e) => {
    console.log(e.target.files[0])
    setText(e.target.files[0])
    
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
  const handleSubmit =(e) => {

    
    const formData= new FormData()
    if(text.name.split('.').pop() === 'txt'){ 
      formData.append('text',text)
      axios.post('http://localhost:8000/text',formData)
      .then( 
        function(res){
          // var obj=JSON.parse(JSON.stringify(res.data))
        document.getElementById("upload").innerHTML="Upload Success"
        document.getElementById("success").innerHTML = res.data
        console.log(res.data)
        }
        
        

      )
      // console.log(await resp.json)
    }
    else{
      alert("Please upload a .txt file")
    } 

  }
  // texthande
  const texthandle = (e) => {
    setInput_text(e.target.value)
    console.log(e.target.value)

  }
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
// const result = await axios.post('https://testapi.org/post', usersName, customConfig);
    axios.post('http://localhost:8000/input-text',
    input, customConfig)
    .then(
      function(res){
        
        document.getElementById("textsuccess").innerHTML = res.data
        console.log(res.data)
      }
    )
  }
  




  return (
    <div>
        <div class="text">
        <div class="atext-input text-center mt-5">
            
                <h1>Summary From Input</h1>
                <hr/>
                <p>Upload the txt File</p>
                <br/>
              
                
                    <input type="file" id="file" accept="txt/*" onChange={handleFile} required/>
                    <label for="file" class="btn btn-primary"><i class="fas fa-plus"></i></label>
                    <br/>
                    <p class="filename col">
                      {txt.fileName} 
                    </p>
                    
                    <br/>
                    <p>{txt.fileContent}</p>
                    <p id ="upload" class="message col">
                    </p>
                      
                    
                    <button onClick={handleSubmit}  type="submit" class="btn btn-primary mt-5">Get the Summary</button>
                    <p id="success text-black"></p>
                    
                    
                    
                    <div class=" col">
                      <div class=" col">
                      <p id="success" class=" contain col">

                      </p>    
                      <br></br>
                      
                      </div>
                    </div>
                    
                
                
            
        </div>
        <br></br>
        <br></br>
    </div>
    {/* text input */}
    <div class="text">
        <div class="atext-input text-center mt-5">
            
                <h1>Summary from Texts</h1>
                <hr/>                
                <br/>
                <textarea onChange={texthandle} class=" col-6" placeholder='कृपया नेपाली मात्र प्रविष्ट गर्नुहोस्'></textarea>
                <br/>
                      
                    
                    <button onClick={textSubmit}  type="submit" class="btn btn-primary mt-5"> Summary</button>
                    <p id="success text-black"></p>
                    
                    
                    
                    <div class=" col">
                      <div class=" col">
                      <p id="textsuccess" class=" contain col">

                      </p>    
                      <br></br>
                      
                      </div>
                    </div>
                    
                
                
            
        </div>
        <br></br>
        <br></br>
    </div>
    <br/>

    </div>
  )
}
