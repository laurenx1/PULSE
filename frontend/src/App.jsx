import { useState } from 'react';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import LandingPage from './components/LandingPage'
import SignIn from './components/SignIn'
import UserProfile from './components/UserProfile';

import './App.css'

function App() {
  const [user, setUser] = useState(null);

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
            <SignIn setUser={setUser}/>
          } />
         {user !== null && <Route path={`/profile/${user.id}`} element={<UserProfile user={user} />} />}
      </Routes>
    </Router>
    </>
  )
}

export default App
