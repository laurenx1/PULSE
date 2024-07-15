import { useState } from 'react';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage'
import SignIn from './components/SignIn'
import UserProfile from './components/UserProfile';
import FeaturedStories from './components/FeaturedStories'
import Story from './components/Story';
import PulseCheck from './components/PulseCheck';
import TopicSelector from './components/TopicSelector';

function App() {
  const [user, setUser] = useState(null);
  const [clickedArticle, setClickedArticle] = useState(''); 

  return (
    <>
    <div data-theme='mytheme'>
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
         {user !== null && <Route path={`/${user.id}/featured`} element={<FeaturedStories user={user} setClickedArticle={setClickedArticle}/>} />}
         {user !== null && <Route path={`/${user.id}/topics`} element={<TopicSelector user={user} />} />}
         {clickedArticle !== '' && <Route path={`/openArticle`} element={<Story user={user} clickedArticle={clickedArticle}/>}/>}
         {user !== null && <Route path={`/${user.id}/pulsecheck`} element={<PulseCheck user={user} />} />}
      </Routes>
    </Router>
    </div>
    </>
  )
}

export default App
