import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import API from "./pages/API";
import Navbar from './components/Navbar';
import CreateMatch from './components/CreateMatch';

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/senddata" element={<API />} />
          <Route path="/creatematch" element={<CreateMatch />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
