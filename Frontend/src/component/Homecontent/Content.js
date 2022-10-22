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

        <h3 class=" title text-center">Nepali Speech Recognition and Summary</h3>
            <hr/>
            <div class="container1">
                <p>
                Speech recognition, or speech-to-text, is the ability of a machine or program to identify words spoken aloud and convert them into readable text. Rudimentary speech recognition software has a limited vocabulary and may only identify words and phrases when spoken clearly. More sophisticated software can handle natural speech, different accents and various languages.

                Speech recognition uses a broad array of research in computer science, linguistics and computer engineering. Many modern devices and text-focused programs have speech recognition functions in them to allow for easier or hands-free use of a device.
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
