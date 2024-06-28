import { useState } from 'react';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import LandingPage from './components/LandingPage'
import SignIn from './components/SignIn'

import './App.css'

function App() {

  return (
    <>
    <Router>
      <Routes>
          <Route path='/' element={
            <>
            <LandingPage/>
            </>
          } />
          <Route path='/login' element={
            <SignIn/>
          } />
      </Routes>
    </Router>
    </>
  )
}

export default App
