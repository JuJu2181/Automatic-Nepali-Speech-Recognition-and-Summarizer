import Home from "./pages/home/Home";
import SpeechPage from "./pages/speech/SpeechPage";
import Summarize from "./pages/summary/Summarize";
import TeamPage from "./pages/team/TeamPage";
import{BrowserRouter as Router,
  Routes,
  Route
  } from "react-router-dom";
function App() {
  return (
    <><Router>
    <Routes>
      <Route exact path="/"
      element={<Home/>} />
      
    
      <Route path="/sr"
      element={<SpeechPage/>} /> 
        
      <Route path="/summary" element={<Summarize/>} />  

      <Route path="/teams" element={<TeamPage/>} />
    </Routes>
  </Router>
    </>
  );
}

export default App;
