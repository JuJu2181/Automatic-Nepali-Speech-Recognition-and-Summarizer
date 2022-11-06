import React from 'react'
import './content.css'
import { Link } from 'react-router-dom'
// import img from '../../static/image/background.jpg'

export default function Content() {
  return (
    <div className='content'>
        <div className='img'>
             {/* <img  className ="img"src= {img} alt="" /> */}
         
        </div>    

        <h3 class="project-title text-center mt-3">Automatic Nepali Speech Recognition and Summary</h3>
            
            <div class="container1">
                <p class="about">
                This is our major project on speech Recognition and summary. We have used the speech recognition API to convert the audio 
                file into text. We have also used the text summarization API to summarize the text. 
                We have used the ReactJS framework to build the front end of the website. The website is also responsive and can be used on 
                mobile devices as well.
                <br/>
                For speech recognition, we have used wav2vec 2.0 model (facebook/wav2vec2-large-xlsr-53). The model is finetuned on the openslr dataset.
                Similarly, for text summarization, we have used Extractive Summary using textRank Algorithm.
                
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
