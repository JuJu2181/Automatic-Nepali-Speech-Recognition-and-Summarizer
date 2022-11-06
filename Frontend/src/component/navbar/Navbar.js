import React from 'react'
import {Link} from 'react-router-dom'
import './navbar.css'

export default function Navbar() {
  return (
    <div>
        <nav class="navbar navbar-expand-lg bg-dark navbar-dark">
			<div class="container" >    
				<a class="navbar-brand"><Link className='links-title' to="/"><i class="fas fa-microphone"/> ANSRAS </Link></a>
                <button class="navbar-toggler text-white" type="button" 
                    data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false" 
                    aria-label="Toggle navigation"> 
                    <span class="navbar-toggler-icon "></span> 
                </button> 
                <div class="collapse navbar-collapse text-white "id="navbarSupportedContent"> 
                    <ul class="nav navbar-nav ml-auto"> 

                        <li class="nav-item "> 
                            <a class="  px-4 mr-3 "><Link className='links' to="/sr">Speech Recognition</Link></a> 
                        </li> 
                        <li class="nav-item"> 
                            <a class="px-4 mr-3" ><Link Link className='links' to="/summary" > Summary</Link>    </a> 
                        </li> 
                        <li class="nav-item"> 
                            <a class="px-4 mr-3" ><Link Link className='links' to="/mictest" > RealTime Speech</Link>    </a> 
                        </li> 
                        <li class="nav-item"> 
                            <a class="px-4 mr-3" > <Link Link className='links' to ="/teams">Team</Link></a> 
                        </li> 
                        
                        


                    </ul> 
                </div>
			</div> 

		</nav>
    </div>
  )
}
