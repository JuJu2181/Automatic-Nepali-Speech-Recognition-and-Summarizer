import React from 'react'
import {Link} from 'react-router-dom'
import './navbar.css'


export default function Navbar() {
    
  return (
    <div>
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark fixed-top">
			<div className="container" >    
				<span className='navbar-brand'><Link className='links-title' to="/"><i className="fas fa-microphone"/> <p className="navbar-logo-anish">स्वर-सारांश </p></Link></span>
                <button className="navbar-toggler text-white" type="button" 
                    data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false" 
                    aria-label="Toggle navigation"> 
                    <span className="navbar-toggler-icon "></span> 
                </button> 
                <div className="collapse navbar-collapse text-white "id="navbarSupportedContent"> 
                
                    <ul className="nav navbar-nav ml-auto">
                        
                        <li className="nav-item "> 
                            <span className=" px-4 mr-3 "><Link className='links' to="/sr">Speech Recognition</Link></span> 
                        </li> 
                        <li className="nav-item"> 
                            <span className="px-4 mr-3" ><Link className='links' to="/summary" > Summary</Link>    </span> 
                        </li> 
                        <li className="nav-item"> 
                            <span className="px-4 mr-3" ><Link  className='links' to="/mictest" > RealTime Speech</Link>    </span> 
                        </li> 
                        <li className="nav-item"> 
                            <span className="px-4 mr-3" > <Link  className='links' to ="/teams">Team</Link></span> 
                        </li> 
                        
                        


                    </ul> 
                </div>
			</div> 

		</nav>
    </div>
  )
}
