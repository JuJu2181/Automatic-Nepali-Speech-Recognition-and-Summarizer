import Home from "./pages/home/Home";
import SpeechPage from "./pages/speech/SpeechPage";
import Summarize from "./pages/summary/Summarize";
import TeamPage from "./pages/team/TeamPage";
import RealTime from "./pages/realtime/RealTime";
import './App.css'
import{BrowserRouter as Router,
  Routes,
  Route
  } from "react-router-dom";
import Footer from "./component/Footer/Footer";
import Scroll from "./component/ScrollToTop/Scroll";
import Navbar from "./component/navbar/Navbar";
function App() {
  
  return (
    <><Router>
      <Navbar/>
    <Routes>
      <Route exact path="/"
      element={<Home/>} />     
    
      <Route path="/sr"
      element={<SpeechPage/>} /> 
        
      <Route path="/summary" element={<Summarize/>} />  

      <Route path="/teams" element={<TeamPage/>} />
      <Route path="/mictest" element={<RealTime/>} />

    </Routes>
    <Scroll/>
    <Footer/>
  </Router>
    </>
  );
}

export default App;
