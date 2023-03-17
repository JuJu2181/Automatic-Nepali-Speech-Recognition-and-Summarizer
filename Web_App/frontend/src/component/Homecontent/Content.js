
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
          <Link className='linkof' to='/mictest'><button className="button-three">Live Speech</button></Link>
          
            <Link className='linkof' to='/sr'><button className="button-three">Speech Recognition</button></Link>
            
          <Link className='linkof' to='/summary'><button className="button-three">Summarizer</button></Link>
          
            
        </div>
        <br/>
        
        
        </div>
        <div className="container1">
            <p className="about">
            A system which can convert Nepali speech to text and generate summary of text developed as major project for final year of computer engineering. This project introduces an innovative Nepali speech recognition and summarizer system that has the potential to revolutionize the way we process and analyze spoken information. Our system leverages the power of deep learning algorithms, including CNN, Resnet, BiLSTM, and wav2vec2, to transcribe speech into text with remarkable accuracy and speed. Additionally, the summarizer component of our system employs advanced natural language processing techniques, such as the TextRank Algorithm and Transformer mt5, to condense lengthy speeches into concise and informative summaries, making it easier to digest large amounts of information. This system has significant applications for various fields, including journalism, legal transcription, and business meetings. By streamlining the process of speech transcription and information extraction, our system can save time, increase productivity, and improve the overall quality of speech-to-text analysis.
            
            </p>
        </div>

        <h1 className="project-title text-center mt-3">Motivation</h1>
        
        <div className="container1">
            <p className="about">
            The Nepali language is spoken by more than 17 million people worldwide, making it one of the most widely spoken languages in South Asia. However, there is a significant need for automated speech recognition and summarization tools for Nepali, as there are currently limited options available for accurately transcribing and summarizing Nepali speech. By developing **Swar-Saransha**, we aim to address this need and provide a valuable tool for individuals, businesses, and organizations that rely on Nepali language communication. The project has the potential to greatly enhance access to information, improve language learning, and facilitate more efficient and effective communication in Nepal.
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
