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
import LikedSavedList from './components/LikedSavedList';

function App() {
  const [user, setUser] = useState(null);
  const [clickedArticle, setClickedArticle] = useState(''); // clickedArticle changes upon opening article, so can be used to get lastRead as well
  const [viewInteracted, setViewInteracted] = useState('');
  const [topics, setTopics] = useState([]);


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
         {user !== null && <Route path={`/profile/${user.id}`} element={<UserProfile user={user} setViewInteracted={setViewInteracted} clickedArticle={clickedArticle} setClickedArticle={setClickedArticle} topics={topics}/>} />}
         {user !== null && <Route path={`/${user.id}/featured`} element={<FeaturedStories user={user} setClickedArticle={setClickedArticle} setViewInteracted={setViewInteracted} />} />}
         {user !== null && <Route path={`/${user.id}/topics`} element={<TopicSelector user={user} setTopics={setTopics}/>} />}
         {clickedArticle !== '' && <Route path={`/openArticle`} element={<Story user={user} clickedArticle={clickedArticle} setViewInteracted={setViewInteracted}/>}/>}
         {user !== null && <Route path={`/${user.id}/pulsecheck`} element={<PulseCheck user={user} setViewInteracted={setViewInteracted}/>} />}
         {user !== null && (viewInteracted !== '') && <Route path={`/${user.id}/seeYourContent`} element={<LikedSavedList user={user} viewInteracted={viewInteracted} setViewInteracted={setViewInteracted} setClickedArticle={setClickedArticle}/>} />}
      </Routes>
    </Router>
    </div>
    </>
  )
}

export default App
