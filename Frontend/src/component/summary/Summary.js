import React, {useState}from 'react'
import './summary.css'
// import axios from 'axios'

export default function Summary() {
  

  const[text,setText] = useState('')
  const [txt, setTxt] = useState({
    fileName: '',
    fileContent: '',
  })
  
  const handleFile = (e) => {
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
  // const handleSubmit = (e) => {

    
  //   const formData= new FormData()
  //   if(text.name.split('.').pop() === 'txt'){ 
  //     formData.append('text',text)
  //     axios.post('http://localhost:5000/text',formData)
  //     .then(
  //       res =>{document.getElementById("success").innerHTML = "The file is uploaded!"}

  //     )
  //   }
  //   else{
  //     alert("Please upload a .txt file")
  //   } 

  // }
  // const getSummary =(e)=> {
  //   // let options = {
  //   //      scriptPath:'../pythonfiles',
  //   //   };
  //   //   PythonShell.run('hello.py', options, function (err, results) {
  //   //      if (err) console.log(err);
  //   //      if (results) console.log(results);
  //   //      document.getElementById("summary").innerHTML = results
  //   //   });
  //   axios.get('http://localhost:5000/summary')
  //   .then((response) =>{
  //       console.log(response.data)
  //   })
      
      

  // }



  return (
    <div>
        <div class="text">
        <div class="atext-input text-center mt-5">
            
                <h1>Nepali Transcript File</h1>
                <hr/>
                <p>Upload the txt File</p>
                <br/>
              
                
                    <input type="file" id="file" accept="txt/*" onChange={handleFile} required/>
                    <label for="file" class="btn btn-primary"><i class="fas fa-plus"></i></label>
                    <br/>
                    <p class="col">
                      {txt.fileName}<br></br>
                      {txt.fileContent}
                    </p>
                    <button   type="submit" class="btn btn-primary">Upload</button>
                    <p id="success text-black"></p>
                    
                    
                    <button type="submit" class="btn btn-primary">Summary</button>
                <p class="trascript mt-5">
                  <p id="success"></p>
                    The Summary appears here!
                </p>
                
                
            
        </div>
    </div>
    </div>
  )
}
