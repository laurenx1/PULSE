import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {GoogleOAuthProvider, GoogleLogin} from '@react-oauth/google';

const SignIn = ({setUser}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  const navigate = useNavigate();

  const handleVerifiedAccount = user => {
    navigate(`/profile/${user.id}`);
    setUser(user);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (isSignUp) {
        // Handle sign up
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_URL + '/auth/register',
          {
            email,
            username,
            password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const data = response.data;
        handleVerifiedAccount(data.user);
      } else {
        const response = await axios.post(
          import.meta.env.VITE_BACKEND_URL + '/auth/login',
          {
            email,
            password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const data = response.data;
        handleVerifiedAccount(data.user);
      }
    } catch (error) {
      console.error('Error logging in or signing up', error);
    }
  };

  const handleGoogleSuccess = async response => {
    const {credential} = response;
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/auth/google-login',
        {
          token: credential,
        },
      );
      const data = res.data;
      handleVerifiedAccount(data.user);
    } catch (error) {
      console.error('Error with Google login', error);
    }
  };

  const handleGoogleFailure = error => {
    console.error('Google login failed', error);
  };

  return (
    <div className="container mx-auto flex flex-col justify-center items-center h-screen bg-base-100 p-4">
      <form
        className="w-full max-w-sm p-6 bg-base-200 rounded-lg shadow-md"
        onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email:
          </label>
          <input
            className="input input-bordered w-full"
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="password">
            Password:
          </label>
          <input
            className="input input-bordered w-full"
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {isSignUp && (
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="username">
              Username:
            </label>
            <input
              className="input input-bordered w-full"
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
        )}
        <button className="btn btn-info w-full" type="submit">
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
        <p
          className="text-sm mt-4 text-center cursor-pointer"
          onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp
            ? 'Already have an account? Log in'
            : 'Need an account? Sign up'}
        </p>
      </form>
      <div className="w-full max-w-sm p-6 mt-4 bg-base-200 rounded-lg shadow-md">
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onFailure={handleGoogleFailure}
            buttonText="Login with Google"
            cookiePolicy={'single_host_origin'}
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default SignIn;
