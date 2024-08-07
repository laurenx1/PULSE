import {useState} from 'react';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import UserProfile from './components/UserProfile';
import FeaturedStories from './components/FeaturedStories';
import Story from './components/Story';
import PulseCheck from './components/PulseCheck';
import TopicSelector from './components/TopicSelector';
import LikedSavedList from './components/LikedSavedList';
import PulseCheckArticles from './components/PulseCheckArticles';
import TopicStories from './components/TopicStories';

function App() {
  const [user, setUser] = useState(null);
  const [clickedArticle, setClickedArticle] = useState(''); // clickedArticle changes upon opening article, so can be used to get lastRead as well
  const [viewInteracted, setViewInteracted] = useState('');
  const [topics, setTopics] = useState([]);
  const [question, setQuestion] = useState('');
  const [questionKeywords, setQuestionKeywords] = useState([]);
  const [viewTopic, setViewTopic] = useState([]); 

  // @TODO: make all margins consisent w wrap
  return (
    <>
      <div data-theme="mytheme">
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <LandingPage />
                </>
              }
            />
            <Route path="/login" element={<SignIn setUser={setUser} />} />
            {user !== null && (
              <Route
                path={`/profile/${user.id}`}
                element={
                  <UserProfile
                    user={user}
                    setViewInteracted={setViewInteracted}
                    clickedArticle={clickedArticle}
                    setClickedArticle={setClickedArticle}
                    topics={topics}
                    setQuestion={setQuestion}
                    question={question}
                    setQuestionKeywords={setQuestionKeywords}
                    questionKeywords={questionKeywords}
                    setViewTopic={setViewTopic}
                  />
                }
              />
            )}
            {user !== null && (
              <Route
                path={`/${user.id}/featured`}
                element={
                  <FeaturedStories
                    user={user}
                    setClickedArticle={setClickedArticle}
                    setViewInteracted={setViewInteracted}
                  />
                }
              />
            )}
            {user !== null && (
              <Route
                path={`/${user.id}/topics`}
                element={<TopicSelector user={user} setTopics={setTopics} />}
              />
            )}
            {clickedArticle !== '' && (
              <Route
                path={`/openArticle`}
                element={
                  <Story
                    user={user}
                    clickedArticle={clickedArticle}
                    setViewInteracted={setViewInteracted}
                  />
                }
              />
            )}
            {user !== null && (
              <Route
                path={`/${user.id}/pulsecheck`}
                element={
                  <PulseCheck
                    user={user}
                    setViewInteracted={setViewInteracted}
                    setQuestion={setQuestion}
                    setQuestionKeywords={setQuestionKeywords}
                  />
                }
              />
            )}
            {user !== null && viewInteracted !== '' && (
              <Route
                path={`/${user.id}/seeYourContent`}
                element={
                  <LikedSavedList
                    user={user}
                    viewInteracted={viewInteracted}
                    setViewInteracted={setViewInteracted}
                    setClickedArticle={setClickedArticle}
                  />
                }
              />
            )}
            {user !== null && (
              <Route
                path={`/${user.id}/pulsecheck-articles`}
                element={
                  <PulseCheckArticles
                    user={user}
                    setClickedArticle={setClickedArticle}
                    setViewInteracted={setViewInteracted}
                    question={question}
                    questionKeywords={questionKeywords}
                  />
                }
              />
            )}
            {user !== null && (
              <Route
                path={`/${user.id}/topic-stories`}
                element={
                  <TopicStories
                    user={user}
                    setClickedArticle={setClickedArticle}
                    setViewInteracted={setViewInteracted}
                    viewTopic={viewTopic}
                  />
                }
              />
            )}
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
