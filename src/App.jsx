import { useState } from 'react' 
import FaceVerificationPage from './Components/Face_verification_page';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import Home from './Components/Home';
function App() {

  return ( 
      <Router>
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/verify-face'  element = {<FaceVerificationPage/>}/>
        

    </Routes>
      </Router>
       
  );
}

export default App
