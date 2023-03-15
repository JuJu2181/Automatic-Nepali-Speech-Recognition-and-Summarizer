
import './content.css'
import { Link } from 'react-router-dom'
import { useEffect,useState} from 'react'
import axios from 'axios'


import wav2vec from '../../static/image/xlsr.png'

export default function Content() {
  const [model, setModel] = useState(false);
  useEffect(() => {
    axios
      // .post('http://tasr.eastus2.cloudapp.azure.com/loadmodel')
      // .post('http://192.168.50.31:8000/loadmodel')
      .post('http://localhost:8000/loadmodel')
      .then((res) => {
        setModel(true);
        document.getElementById('model-success').style.display = 'block';
        setTimeout(() => {
          document.getElementById('model-success').style.display = 'none';
          
        }, 4000);
      })
      .catch(
        (err) => {
          console.log("no response");
    
          setModel(false);
          document.getElementById('model-success').style.display = 'block';
          setTimeout(() => {
            document.getElementById('model-success').style.display = 'none';
            
          }, 4000);

        }
      );
  }, [])
  return (
    <div className='content'>
        
        <div className='img'>
             {/* <img  className ="img"src= {img} alt="" /> */}
          <div className="success" id="model-success" style={{display:"none"}}>
            { model? <><i className='fas fa-2x fa-check-circle' style={{color:'white',paddingLeft:"40%",paddingTop:"4px"}}></i>
            <br/>
            <span className="success-text" style={{color:'white',padding:'10px'}}>Model Load Success</span></>:<>
            <i className='fas fa-2x fa-exclamation-triangle' style={{color:'white',paddingLeft:"40%",paddingTop:"4px"}}></i>
            <br/>
            <span className="success-text" style={{color:'white',padding:'10px'}}>Server is Down</span></>
            }
            
          </div>  
         
        </div>  
        
        <h1 className="project-title text-center mt-3">स्वर-सारांश</h1>
        <h4 className="project-title project-title-english text-center mt-3">Automatic Nepali Speech Recognition and Summarizer</h4>
        <div className="content ">
        <div className="text-center">
            {/* <button className="button-three">Speech Recognition</button>
            <button className="button-three">Summary</button> */}
            <Link className='linkof' to='/sr'><button className="button-three">Speech Recognition</button></Link>
            
            <Link className='linkof' to='/summary'><button className="button-three">Summary</button></Link>
            
        </div>
        <br/>
        
        
        </div>
        <div className="container1">
            <p className="about">
            This is our major project on speech Recognition and summary. We have used the speech recognition API to convert the audio 
            file into text. We have also used the text summarization API to summarize the text.We have used the ReactJS framework to build the front end of the website. The website is also responsive and can be used on 
            mobile devices as well.
            <br/>
            For speech recognition, we have used wav2vec 2.0 model (facebook/wav2vec2-large-xlsr-53) which was finetuned on the Nepali openslr dataset.
            Similarly, for text summarization, we have used Extractive Summary using textRank Algorithm. An abstractive text summarizer model was also developed.
            
            </p>
        </div>

        <h1 className="project-title text-center mt-3">Motivation</h1>
        
        <div className="container1">
            <p className="about">
              By developing an automatic Nepali speech recognition and summarization project, we can help address this need and provide a valuable tool for individ-
              uals, businesses, and organizations that rely on Nepali language communication. The project has the potential to greatly enhance access to information, improve
              language learning, and facilitate more efficient and effective communication in Nepali. Furthermore, the project can have a significant impact on Nepali society, par-
              ticularly in education and healthcare. With accurate speech recognition and summarization technology, teachers can easily transcribe and summarize lectures,
              making them accessible to students who may have missed classes or have difficulty understanding spoken Nepali. In the healthcare sector, doctors and medical pro-
              fessionals can use technology to transcribe patient consultations and summarize medical records, improving patient care and medical research.
              Overall, the development of an automatic Nepali speech recognition and summarization project is a worthwhile endeavor that has the potential to improve
              communication, enhance access to information, and have a positive impact on Nepali society.
            </p>
        </div>
        {/* <h1 className="project-title text-center mt-3">Model Details and Visualiztion</h1> */}
        {/* <h4 className="project-title text-center mt-3"><i className='fab fa-facebook'></i>-wav2vec2-large-xlsr-53</h4> */}
        {/* <div className="container1 wave2vec">
          <img src={wav2vec}  style={{height:"80%",width:"100%"}}alt="xlsr diagram" />
          <br/>
        <a style={{textAlign:"center",fontSize:"15px"}} href="https://huggingface.co/facebook/wav2vec2-large-xlsr-53">Facebook's XLSR-Wav2Vec2</a>
        </div>
        <div className="container1 col-12">
          
            <p className="about">
            Wav2Vec2 is a pretrained model for Automatic Speech Recognition (ASR) and was released in September 2020 by Alexei Baevski, Michael Auli, and Alex Conneau.

Using a novel contrastive pretraining objective, Wav2Vec2 learns powerful speech representations from more than 50.000 hours of unlabeled speech. Similar, to BERT's masked language modeling, the model learns contextualized speech representations by randomly masking feature vectors before passing them to a transformer network.
            </p>
        </div> */}

    </div>
  )
}
