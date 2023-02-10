import React from 'react'
import './Scroll.css'

export default function Scroll() {
  const[visible, setVisible] = React.useState(false)
  const scroll=()=>{

    window.scrollTo(0,0);
  }
  window.addEventListener('scroll',()=>{
    if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }
  )
  return (
    <div>
        {visible && <button onClick={scroll} className="scroll"  id=''   
        >
            <i className="fa fa-arrow-up"></i> Top
            
        </button>}
    </div>
  )
}
