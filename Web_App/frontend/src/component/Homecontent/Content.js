
import './content.css'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'


// import img from '../../static/image/background.jpg'

export default function Content() {
  useEffect(()=>{
    axios.post('http://localhost:8000/loadmodel')
    .then(res => console.log("model loaded "))
    .catch(err => console.log(err))
  },[])
  return (
    <div className='content'>
        <div className='img'>
             {/* <img  className ="img"src= {img} alt="" /> */}
         
        </div>    
        <h1 class="project-title text-center mt-3">स्वर-सारांश</h1>
        <h4 class="project-title text-center mt-3">Automatic Nepali Speech Recognition and Summary</h4>
            
            <div class="container1">
                <p class="about">
                This is our major project on speech Recognition and summary. We have used the speech recognition API to convert the audio 
                file into text. We have also used the text summarization API to summarize the text. 
                We have used the ReactJS framework to build the front end of the website. The website is also responsive and can be used on 
                mobile devices as well.
                <br/>
                For speech recognition, we have used wav2vec 2.0 model (facebook/wav2vec2-large-xlsr-53). The model is finetuned on the openslr dataset.
                Similarly, for text summarization, we have used Extractive Summary using textRank Algorithm. Another model for speech to text is CNN-Resner-BiLSTM.
                
                </p>
            </div>
            <div class="content ">
            <div class="text-center">
                {/* <button class="button-three">Speech Recognition</button>
                <button class="button-three">Summary</button> */}
                <Link className='linkof' to='/sr'><button class="button-three">Speech Recognition</button></Link>
                
                <Link className='linkof' to='/summary'><button class="button-three">Summary</button></Link>
                
            </div>
            <br/>
            
            
            </div>
    </div>
  )
}
